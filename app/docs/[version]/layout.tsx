import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { getNavigation } from "@/lib/docs";
import { VERSIONS, getVersion } from "@/lib/versions";

export function generateStaticParams() {
  return VERSIONS.map((version) => ({ version: version.id }));
}

export default async function VersionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ version: string }>;
}) {
  const { version: id } = await params;
  const version = getVersion(id);
  if (!version) notFound();

  return (
    <DocsShell version={version} sections={getNavigation(version.id)}>
      {children}
    </DocsShell>
  );
}
