import { DEFAULT_LOCALE, type Locale } from "./i18n";

export const SITE = {
  name: "Raiton",
  fullName: "Protorians Raiton",
  npm: "https://www.npmjs.com/package/raiton",
  github: "https://github.com/protorians/raiton",
  docsGithub: "https://github.com/protorians/raiton.docs",
  issues: "https://github.com/protorians/raiton/issues",
  releases: "https://github.com/protorians/raiton/releases",
  author: "Y. Yannick GOBOU",
  license: "MIT",
};

interface SiteCopy {
  tagline: string;
  description: string;
}

const SITE_COPY: Record<Locale, SiteCopy> = {
  fr: {
    tagline: "Le framework backend TypeScript, sans cérémonie.",
    description:
      "Raiton est un framework backend TypeScript modulaire : injection de dépendances, contrôleurs, contrats schema-first, MCP, scheduler et observabilité. Optimisé pour Bun, compatible Node.js et Deno.",
  },
  en: {
    tagline: "The TypeScript backend framework, without the ceremony.",
    description:
      "Raiton is a modular TypeScript backend framework: dependency injection, controllers, schema-first contracts, MCP, scheduler and observability. Optimized for Bun, compatible with Node.js and Deno.",
  },
};

export function getSiteCopy(locale: Locale = DEFAULT_LOCALE): SiteCopy {
  return SITE_COPY[locale] ?? SITE_COPY[DEFAULT_LOCALE];
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset path with the configured GitHub Pages base path. */
export function asset(pathname: string): string {
  if (/^https?:\/\//.test(pathname) || pathname.startsWith("data:")) return pathname;
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${BASE_PATH}${clean}`;
}
