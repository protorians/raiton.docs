import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsLanding } from "@/components/docs-landing";
import { getNavigation, listDocs } from "@/lib/docs";
import { getMessages, localizePath, type Locale } from "@/lib/i18n";
import { getVersion } from "@/lib/versions";

export function versionIndexMetadata(locale: Locale, id: string): Metadata {
  const version = getVersion(id, locale);
  const messages = getMessages(locale);
  const title = version
    ? `${messages.common.documentation} ${version.label}`
    : messages.common.documentation;

  return {
    title,
    description: version?.summary,
    alternates: {
      canonical: localizePath(locale, `/docs/${id}/`),
      languages: {
        fr: `/docs/${id}/`,
        en: `/en/docs/${id}/`,
      },
    },
    twitter: {
      title,
      description: version?.summary,
    },
  };
}

export function VersionIndexPage({
  locale,
  params,
}: {
  locale: Locale;
  params: { version: string };
}) {
  const version = getVersion(params.version, locale);
  if (!version) notFound();

  return (
    <DocsLanding
      locale={locale}
      version={version}
      sections={getNavigation(version.id, locale)}
      docs={listDocs(version.id, locale)}
    />
  );
}
