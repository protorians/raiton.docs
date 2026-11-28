import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content");
const overridesDir = path.join(contentDir, "versions");
const latest = "6.10";

const locales = [
  { code: "fr", dir: contentDir, output: "search-index.json" },
  { code: "en", dir: path.join(contentDir, "en"), output: "search-index.en.json" },
];

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function sharedFiles(locale) {
  const files = new Set(markdownFiles(contentDir));
  if (locale !== "fr") {
    for (const file of markdownFiles(locale.dir)) files.add(file);
  }
  return [...files].sort();
}

function resolveFile(locale, slug) {
  const candidates =
    locale.code === "fr"
      ? [
          path.join(overridesDir, latest, `${slug}.md`),
          path.join(contentDir, `${slug}.md`),
        ]
      : [
          path.join(locale.dir, "versions", latest, `${slug}.md`),
          path.join(locale.dir, `${slug}.md`),
          path.join(overridesDir, latest, `${slug}.md`),
          path.join(contentDir, `${slug}.md`),
        ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function walkText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<div class="callout[^>]*>/g, " ")
    .replace(/<\/div>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function headings(markdown) {
  const found = [];
  let fence = null;
  for (const line of markdown.split("\n")) {
    const match = line.match(/^\s*(```+|~~~+)/);
    if (match) {
      if (!fence) fence = match[1][0];
      else if (line.trim().startsWith(fence)) fence = null;
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (heading) {
      const text = heading[1]
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[`*_]/g, "")
        .trim();
      found.push({ id: slugify(text), text });
    }
  }
  return found;
}

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "public", ".nojekyll"), "");

for (const locale of locales) {
  const entries = [];

  for (const file of sharedFiles(locale)) {
    const slug = file.replace(/\.md$/, "");
    const filePath = resolveFile(locale, slug);
    if (!filePath) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    if (data.draft === true) continue;

    entries.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      section: data.section || "guides",
      order: typeof data.order === "number" ? data.order : 999,
      since: data.since ? String(data.since) : "6.0",
      headings: headings(content),
      text: walkText(content).slice(0, 2200),
    });
  }

  entries.sort((left, right) => left.order - right.order);

  fs.writeFileSync(
    path.join(root, "public", locale.output),
    JSON.stringify(entries, null, 0),
  );

  console.log(`${locale.output}: ${entries.length} pages`);
}
