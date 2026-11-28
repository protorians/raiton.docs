import type { Metadata } from "next";
import { DocsLanding } from "@/components/docs-landing";
import { getNavigation, listDocs } from "@/lib/docs";
import {
  DEFAULT_LOCALE,
  getMessages,
  localizePath,
  type Locale,
} from "@/lib/i18n";
import { getLatestVersion } from "@/lib/versions";

export function docsIndexMetadata(locale: Locale = DEFAULT_LOCALE): Metadata {
  const messages = getMessages(locale);
  return {
    title: messages.common.documentation,
    description: messages.docs.indexDescription,
    alternates: {
      canonical: localizePath(locale, "/docs/"),
      languages: {
        fr: "/docs/",
        en: "/en/docs/",
      },
    },
    twitter: {
      title: messages.common.documentation,
      description: messages.docs.indexDescription,
    },
  };
}

export function DocsIndexPage({ locale }: { locale: Locale }) {
  const version = getLatestVersion(locale);

  return (
    <div className="min-h-[60vh] border-b border-[var(--border)]">
      <div className="site-container">
        <DocsLanding
          locale={locale}
          version={version}
          sections={getNavigation(version.id, locale)}
          docs={listDocs(version.id, locale)}
        />
      </div>
    </div>
  );
}
