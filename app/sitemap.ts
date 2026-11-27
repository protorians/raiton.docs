import type { MetadataRoute } from "next";
import { getDocParams } from "@/lib/docs";
import { BASE_PATH } from "@/lib/site";
import { VERSIONS } from "@/lib/versions";

export const dynamic = "force-static";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://raiton.protorians.dev").replace(/\/$/, "");
const origin = `${siteUrl}${BASE_PATH}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/docs/`, changeFrequency: "weekly", priority: 0.9 },
  ];

  for (const version of VERSIONS) {
    pages.push({
      url: `${origin}/docs/${version.id}/`,
      changeFrequency: "monthly",
      priority: version.status === "latest" ? 0.9 : 0.5,
    });
  }

  for (const param of getDocParams()) {
    pages.push({
      url: `${origin}/docs/${param.version}/${param.slug.join("/")}/`,
      changeFrequency: "monthly",
      priority: param.version === VERSIONS[0].id ? 0.7 : 0.3,
    });
  }

  return pages;
}
