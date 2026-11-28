import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { DEFAULT_LOCALE, type Locale } from "./i18n";
import { renderMarkdown, type RenderResult, type TocEntry } from "./markdown";
import { BASE_PATH } from "./site";
import {
  getLatestVersion,
  getSectionMeta,
  getVersions,
  isSince,
  SECTION_ORDER,
  type DocVersion,
} from "./versions";

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  since: string;
  tags: string[];
  draft: boolean;
  /** True when the page has content in the requested locale. */
  translated: boolean;
}

export interface DocPage extends DocMeta {
  html: string;
  toc: TocEntry[];
  sourcePath: string;
}

export interface NavSection {
  id: string;
  title: string;
  description?: string;
  items: DocMeta[];
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const OVERRIDES_DIR = path.join(CONTENT_DIR, "versions");
const LOCALIZED_DIRS: Record<Locale, string> = {
  fr: CONTENT_DIR,
  en: path.join(CONTENT_DIR, "en"),
};
const renderCache = process.env.NODE_ENV === "production" ? new Map<string, RenderResult>() : null;

function isDirectory(directory: string): boolean {
  try {
    return fs.statSync(directory).isDirectory();
  } catch {
    return false;
  }
}

function markdownFiles(directory: string): string[] {
  if (!isDirectory(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function readMeta(file: string, slug: string, translated: boolean): DocMeta {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    section: typeof data.section === "string" ? data.section : "guides",
    order: typeof data.order === "number" ? data.order : 999,
    since: data.since ? String(data.since) : "6.0",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    translated,
  };
}

/**
 * Shared French sources, plus English pages that may not exist in French yet.
 * Locale pages fall back to the French source when no translation exists.
 */
function sharedFiles(locale: Locale): string[] {
  const files = new Set(markdownFiles(CONTENT_DIR));
  if (locale !== DEFAULT_LOCALE) {
    for (const file of markdownFiles(LOCALIZED_DIRS[locale])) {
      files.add(file);
    }
  }
  return [...files].sort();
}

function firstExisting(...candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveFile(locale: Locale, version: string, slug: string): string | null {
  const shared = path.join(CONTENT_DIR, `${slug}.md`);

  if (locale === DEFAULT_LOCALE) {
    return firstExisting(
      path.join(OVERRIDES_DIR, version, `${slug}.md`),
      shared,
    );
  }

  const localized = LOCALIZED_DIRS[locale];
  return firstExisting(
    path.join(localized, "versions", version, `${slug}.md`),
    path.join(localized, `${slug}.md`),
    path.join(OVERRIDES_DIR, version, `${slug}.md`),
    shared,
  );
}

function isTranslatedFile(locale: Locale, file: string): boolean {
  if (locale === DEFAULT_LOCALE) return true;
  const localized = `${LOCALIZED_DIRS[locale]}${path.sep}`;
  return file.startsWith(localized);
}

function sectionRank(section: string): number {
  const index = SECTION_ORDER.indexOf(section as (typeof SECTION_ORDER)[number]);
  return index === -1 ? SECTION_ORDER.length : index;
}

export function listDocs(version: string, locale: Locale = DEFAULT_LOCALE): DocMeta[] {
  const docs: DocMeta[] = [];

  for (const file of sharedFiles(locale)) {
    const slug = file.replace(/\.md$/, "");
    const fileToRead = resolveFile(locale, version, slug);
    if (!fileToRead) continue;
    const meta = readMeta(fileToRead, slug, isTranslatedFile(locale, fileToRead));
    if (meta.draft) continue;
    if (!isSince(meta.since, version)) continue;
    docs.push(meta);
  }

  return docs.sort((left, right) => {
    const section = sectionRank(left.section) - sectionRank(right.section);
    if (section !== 0) return section;
    if (left.order !== right.order) return left.order - right.order;
    return left.title.localeCompare(right.title, locale);
  });
}

export function getNavigation(
  version: string,
  locale: Locale = DEFAULT_LOCALE,
): NavSection[] {
  const docs = listDocs(version, locale);
  const sections: NavSection[] = [];
  const sectionMeta = getSectionMeta(locale);

  for (const id of SECTION_ORDER) {
    const items = docs.filter((doc) => doc.section === id);
    if (items.length === 0) continue;
    sections.push({
      id,
      title: sectionMeta[id].title,
      description: sectionMeta[id].description,
      items,
    });
  }

  const known = new Set<string>(SECTION_ORDER);
  const extras = docs.filter((doc) => !known.has(doc.section));
  if (extras.length > 0) {
    sections.push({
      id: "autres",
      title: locale === "en" ? "Other" : "Autres",
      items: extras,
    });
  }

  return sections;
}

export function getDocMeta(
  version: string,
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): DocMeta | null {
  return listDocs(version, locale).find((doc) => doc.slug === slug) ?? null;
}

export async function getDoc(
  version: string,
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DocPage | null> {
  const meta = getDocMeta(version, slug, locale);
  if (!meta) return null;

  const file = resolveFile(locale, version, slug);
  if (!file) return null;

  const cacheKey = `${locale}:${version}:${slug}`;
  const cached = renderCache?.get(cacheKey);

  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);

  let rendered: RenderResult;
  if (cached) {
    rendered = cached;
  } else {
    const availableSlugs = new Set(listDocs(version, locale).map((doc) => doc.slug));
    rendered = await renderMarkdown(content, {
      version,
      locale,
      basePath: BASE_PATH,
      availableSlugs,
      fallbackVersion: getLatestVersion(locale).id,
    });
    renderCache?.set(cacheKey, rendered);
  }

  return {
    ...meta,
    html: rendered.html,
    toc: rendered.toc,
    sourcePath: path.relative(process.cwd(), file),
  };
}

export function getPrevNext(
  version: string,
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): { previous: DocMeta | null; next: DocMeta | null } {
  const docs = listDocs(version, locale);
  const index = docs.findIndex((doc) => doc.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? docs[index - 1] : null,
    next: index < docs.length - 1 ? docs[index + 1] : null,
  };
}

export function getDocParams(
  locale: Locale = DEFAULT_LOCALE,
): { version: string; slug: string[] }[] {
  const params: { version: string; slug: string[] }[] = [];
  for (const version of getVersions(locale)) {
    for (const doc of listDocs(version.id, locale)) {
      params.push({ version: version.id, slug: [doc.slug] });
    }
  }
  return params;
}

export function getVersionCount(locale: Locale = DEFAULT_LOCALE): number {
  return getVersions(locale).length;
}

export function getVersionDocs(version: DocVersion, locale: Locale = DEFAULT_LOCALE): DocMeta[] {
  return listDocs(version.id, locale);
}

export function getFirstDoc(
  version: string,
  locale: Locale = DEFAULT_LOCALE,
): DocMeta | null {
  return listDocs(version, locale)[0] ?? null;
}

export function getSectionLabel(
  section: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const meta = getSectionMeta(locale);
  return (
    meta[section as (typeof SECTION_ORDER)[number]]?.title ??
    section.charAt(0).toUpperCase() + section.slice(1)
  );
}
