import type { Metadata } from "next";
import {
  VersionIndexPage,
  versionIndexMetadata,
} from "@/app/_pages/version-index-page";

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;
  return versionIndexMetadata("fr", version);
}

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  return <VersionIndexPage locale="fr" params={{ version }} />;
}
