import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content");
const overridesDir = path.join(contentDir, "versions");
const latest = "6.10";

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

const entries = [];
if (fs.existsSync(contentDir)) {
  const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const override = path.join(overridesDir, latest, `${slug}.md`);
    const filePath = fs.existsSync(override) ? override : path.join(contentDir, file);
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
}

entries.sort((left, right) => left.order - right.order);

fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(entries, null, 0),
);

console.log(`search-index.json: ${entries.length} pages`);
