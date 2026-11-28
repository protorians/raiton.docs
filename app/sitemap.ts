import type { MetadataRoute } from "next";
import { getDocParams } from "@/lib/docs";
import { LOCALES, localizePath, type Locale } from "@/lib/i18n";
import { BASE_PATH } from "@/lib/site";
import { getVersions } from "@/lib/versions";

export const dynamic = "force-static";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://raiton.protorians.dev").replace(/\/$/, "");
const origin = `${siteUrl}${BASE_PATH}`;

function alternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${origin}${localizePath(locale, path)}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    pages.push(
      {
        url: `${origin}${localizePath(locale, "/")}`,
        changeFrequency: "weekly",
        priority: locale === "en" ? 0.9 : 1,
        alternates: alternates("/"),
      },
      {
        url: `${origin}${localizePath(locale, "/docs/")}`,
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: alternates("/docs/"),
      },
    );

    for (const version of getVersions(locale as Locale)) {
      const path = `/docs/${version.id}/`;
      pages.push({
        url: `${origin}${localizePath(locale, path)}`,
        changeFrequency: "monthly",
        priority: version.status === "latest" ? 0.9 : 0.5,
        alternates: alternates(path),
      });
    }

    for (const param of getDocParams(locale as Locale)) {
      const path = `/docs/${param.version}/${param.slug.join("/")}/`;
      pages.push({
        url: `${origin}${localizePath(locale, path)}`,
        changeFrequency: "monthly",
        priority: param.version === getVersions(locale as Locale)[0].id ? 0.7 : 0.3,
        alternates: alternates(path),
      });
    }
  }

  return pages;
}
