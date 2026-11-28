import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { getNavigation } from "@/lib/docs";
import type { Locale } from "@/lib/i18n";
import { getVersion } from "@/lib/versions";

export function VersionLayout({
  locale,
  versionId,
  children,
}: {
  locale: Locale;
  versionId: string;
  children: ReactNode;
}) {
  const version = getVersion(versionId, locale);
  if (!version) notFound();

  return (
    <DocsShell
      locale={locale}
      version={version}
      sections={getNavigation(version.id, locale)}
    >
      {children}
    </DocsShell>
  );
}
