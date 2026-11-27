import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown, type RenderResult, type TocEntry } from "./markdown";
import { BASE_PATH } from "./site";
import {
  SECTION_META,
  SECTION_ORDER,
  isSince,
  VERSIONS,
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
const renderCache = process.env.NODE_ENV === "production" ? new Map<string, RenderResult>() : null;

function isDirectory(directory: string): boolean {
  try {
    return fs.statSync(directory).isDirectory();
  } catch {
    return false;
  }
}

function readMeta(file: string, slug: string): DocMeta {
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
  };
}

function sharedFiles(): string[] {
  if (!isDirectory(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function overrideFile(version: string, slug: string): string | null {
  const file = path.join(OVERRIDES_DIR, version, `${slug}.md`);
  return fs.existsSync(file) ? file : null;
}

function resolveFile(version: string, slug: string): string | null {
  return overrideFile(version, slug) ?? path.join(CONTENT_DIR, `${slug}.md`);
}

function sectionRank(section: string): number {
  const index = SECTION_ORDER.indexOf(section as (typeof SECTION_ORDER)[number]);
  return index === -1 ? SECTION_ORDER.length : index;
}

export function listDocs(version: string): DocMeta[] {
  const docs: DocMeta[] = [];

  for (const file of sharedFiles()) {
    const slug = file.replace(/\.md$/, "");
    const shared = path.join(CONTENT_DIR, file);
    const fileToRead = overrideFile(version, slug) ?? shared;
    const meta = readMeta(fileToRead, slug);
    if (meta.draft) continue;
    if (!isSince(meta.since, version)) continue;
    docs.push(meta);
  }

  return docs.sort((left, right) => {
    const section = sectionRank(left.section) - sectionRank(right.section);
    if (section !== 0) return section;
    if (left.order !== right.order) return left.order - right.order;
    return left.title.localeCompare(right.title, "fr");
  });
}

export function getNavigation(version: string): NavSection[] {
  const docs = listDocs(version);
  const sections: NavSection[] = [];

  for (const id of SECTION_ORDER) {
    const items = docs.filter((doc) => doc.section === id);
    if (items.length === 0) continue;
    sections.push({
      id,
      title: SECTION_META[id].title,
      description: SECTION_META[id].description,
      items,
    });
  }

  const known = new Set<string>(SECTION_ORDER);
  const extras = docs.filter((doc) => !known.has(doc.section));
  if (extras.length > 0) {
    sections.push({ id: "autres", title: "Autres", items: extras });
  }

  return sections;
}

export function getDocMeta(version: string, slug: string): DocMeta | null {
  return listDocs(version).find((doc) => doc.slug === slug) ?? null;
}

export async function getDoc(version: string, slug: string): Promise<DocPage | null> {
  const meta = getDocMeta(version, slug);
  if (!meta) return null;

  const file = resolveFile(version, slug);
  if (!file || !fs.existsSync(file)) return null;

  const cacheKey = `${version}:${slug}`;
  const cached = renderCache?.get(cacheKey);

  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);

  let rendered: RenderResult;
  if (cached) {
    rendered = cached;
  } else {
    const availableSlugs = new Set(listDocs(version).map((doc) => doc.slug));
    rendered = await renderMarkdown(content, {
      version,
      basePath: BASE_PATH,
      availableSlugs,
      fallbackVersion: VERSIONS[0].id,
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
): { previous: DocMeta | null; next: DocMeta | null } {
  const docs = listDocs(version);
  const index = docs.findIndex((doc) => doc.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? docs[index - 1] : null,
    next: index < docs.length - 1 ? docs[index + 1] : null,
  };
}

export function getDocParams(): { version: string; slug: string[] }[] {
  const params: { version: string; slug: string[] }[] = [];
  for (const version of VERSIONS) {
    for (const doc of listDocs(version.id)) {
      params.push({ version: version.id, slug: [doc.slug] });
    }
  }
  return params;
}

export function getVersionCount(): number {
  return VERSIONS.length;
}

export function getVersionDocs(version: DocVersion): DocMeta[] {
  return listDocs(version.id);
}

export function getFirstDoc(version: string): DocMeta | null {
  return listDocs(version)[0] ?? null;
}

export function getSectionLabel(section: string): string {
  return (
    SECTION_META[section as (typeof SECTION_ORDER)[number]]?.title ??
    section.charAt(0).toUpperCase() + section.slice(1)
  );
}
