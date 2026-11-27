import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsLanding } from "@/components/docs-landing";
import { getNavigation, listDocs } from "@/lib/docs";
import { getVersion } from "@/lib/versions";

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version: id } = await params;
  const version = getVersion(id);
  return {
    title: version ? `Documentation ${version.label}` : "Documentation",
    description: version?.summary,
  };
}

export default async function VersionIndexPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version: id } = await params;
  const version = getVersion(id);
  if (!version) notFound();

  return (
    <DocsLanding
      version={version}
      sections={getNavigation(version.id)}
      docs={listDocs(version.id)}
    />
  );
}
