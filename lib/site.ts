export const SITE = {
  name: "Raiton",
  fullName: "Protorians Raiton",
  tagline: "Le framework backend TypeScript, sans cérémonie.",
  description:
    "Raiton est un framework backend TypeScript modulaire : injection de dépendances, contrôleurs, contrats schema-first, MCP, scheduler et observabilité. Optimisé pour Bun, compatible Node.js et Deno.",
  npm: "https://www.npmjs.com/package/raiton",
  github: "https://github.com/protorians/raiton",
  docsGithub: "https://github.com/protorians/raiton.docs",
  issues: "https://github.com/protorians/raiton/issues",
  releases: "https://github.com/protorians/raiton/releases",
  author: "Y. Yannick GOBOU",
  license: "MIT",
};

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset path with the configured GitHub Pages base path. */
export function asset(pathname: string): string {
  if (/^https?:\/\//.test(pathname) || pathname.startsWith("data:")) return pathname;
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${BASE_PATH}${clean}`;
}

export const NAV_LINKS = [
  { href: "/docs", label: "Documentation" },
  { href: "/docs/6.9/contracts", label: "Contrats" },
  { href: "/docs/6.9/cli", label: "CLI" },
  { href: "/docs/6.9/releases", label: "Versions" },
];
