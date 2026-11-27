import GithubSlugger from "github-slugger";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface RenderResult {
  html: string;
  toc: TocEntry[];
}

export interface RenderOptions {
  version: string;
  basePath?: string;
  /** Slugs documented in the current version. */
  availableSlugs?: Set<string>;
  /** Version to use when a link targets a page missing from this version. */
  fallbackVersion?: string;
  /** Code is always a night surface, in both themes. */
  nightCode?: boolean;
}

const CALLOUT_TITLES: Record<string, string> = {
  note: "Note",
  tip: "Astuce",
  warning: "Attention",
  danger: "Danger",
  info: "Info",
  important: "Important",
};

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Turn :::note blocks into styled containers. Inner content stays markdown
 * and is parsed by remark afterwards.
 */
function expandCallouts(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let fence: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);

    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (line.trim().startsWith(fence)) fence = null;
      output.push(line);
      continue;
    }

    const opening = !fence && line.trim().match(/^:::([a-z]+)\b\s*(.*)$/i);
    if (!opening) {
      output.push(line);
      continue;
    }

    const type = opening[1].toLowerCase();
    let title = (opening[2] || "").trim();
    const explicitTitle = title.match(/\{title="([^"]+)"\}/);
    if (explicitTitle) title = explicitTitle[1];
    title = title || CALLOUT_TITLES[type] || "Note";

    const inner: string[] = [];
    let closed = false;
    let cursor = index + 1;

    for (; cursor < lines.length; cursor += 1) {
      if (lines[cursor].trim() === ":::") {
        closed = true;
        break;
      }
      inner.push(lines[cursor]);
    }

    if (!closed) {
      output.push(line);
      continue;
    }

    output.push(
      `<div class="callout callout-${type}" data-title="${escapeAttribute(title)}">`,
      "",
      ...expandCallouts(inner.join("\n")).split("\n"),
      "",
      "</div>",
    );

    index = cursor;
  }

  return output.join("\n");
}

function stripInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

function buildToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let fence: string | null = null;

  for (const line of markdown.split("\n")) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (line.trim().startsWith(fence)) fence = null;
      continue;
    }
    if (fence) continue;

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!heading) continue;

    const depth = heading[1].length;
    const text = stripInline(heading[2]);
    const id = slugger.slug(text);

    if (depth === 2 || depth === 3) {
      entries.push({ id, text, depth });
    }
  }

  return entries;
}

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function walk(node: HastNode, visit: (node: HastNode) => void) {
  visit(node);
  if (node.children) {
    for (const child of node.children) walk(child, visit);
  }
}

function rewriteLink(
  href: string,
  options: RenderOptions,
  basePath: string,
): string {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) return href;

  if (href === "/" || href === "") {
    return `${basePath}/`;
  }

  if (href.startsWith("/docs")) {
    const [pathPart, hash] = href.split("#");
    let rest = pathPart.replace(/^\/docs\/?/, "");
    rest = rest.replace(/\/+$/, "");

    const parts = rest.split("/").filter(Boolean);
    if (parts.length > 0 && /^\d+\.\d+$/.test(parts[0])) {
      parts.shift();
    }

    let targetVersion = options.version;
    const targetSlug = parts.join("/");
    if (
      targetSlug &&
      options.availableSlugs &&
      !options.availableSlugs.has(targetSlug) &&
      options.fallbackVersion
    ) {
      targetVersion = options.fallbackVersion;
    }

    const suffix = parts.length > 0 ? `/${parts.join("/")}/` : "/";
    return `${basePath}/docs/${targetVersion}${suffix}${hash ? `#${hash}` : ""}`;
  }

  if (href.startsWith("/")) {
    return `${basePath}${href}`;
  }

  return href;
}

function rehypeDocsLinks(options: RenderOptions) {
  const basePath = options.basePath ?? "";
  return (tree: HastNode) => {
    walk(tree, (node) => {
      if (node.type !== "element" || !node.properties) return;

      if (node.tagName === "a") {
        const href = node.properties.href;
        if (typeof href === "string") {
          node.properties.href = rewriteLink(href, options, basePath);
          if (/^https?:\/\//.test(href)) {
            node.properties.target = "_blank";
            node.properties.rel = "noreferrer noopener";
          }
        }
      }

      if (node.tagName === "img") {
        const src = node.properties.src;
        if (typeof src === "string" && src.startsWith("/")) {
          node.properties.src = `${basePath}${src}`;
        }
        node.properties.loading = "lazy";
      }
    });
  };
}

export async function renderMarkdown(
  source: string,
  options: RenderOptions,
): Promise<RenderResult> {
  const expanded = expandCallouts(source);
  const toc = buildToc(expanded);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Lien vers cette section",
      },
      content: { type: "text", value: "#" },
    })
    .use(rehypeShiki, {
      themes: options.nightCode
        ? { light: "vesper", dark: "vesper" }
        : { light: "github-light", dark: "github-dark" },
    })
    .use(rehypeDocsLinks, options)
    .use(rehypeStringify)
    .process(expanded);

  return { html: String(file), toc };
}
