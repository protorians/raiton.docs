import type { ReactNode } from "react";
import { VersionLayout } from "@/app/_layouts/version-layout";
import { getVersions } from "@/lib/versions";

export function generateStaticParams() {
  return getVersions("en").map((version) => ({ version: version.id }));
}

export default async function VersionRouteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  return (
    <VersionLayout locale="en" versionId={version}>
      {children}
    </VersionLayout>
  );
}
