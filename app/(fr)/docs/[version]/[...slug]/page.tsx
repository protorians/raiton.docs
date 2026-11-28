import type { Metadata } from "next";
import { DocPage, docMetadata } from "@/app/_pages/doc-page";
import { getDocParams } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocParams("fr");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string; slug: string[] }>;
}): Promise<Metadata> {
  const resolved = await params;
  return docMetadata("fr", resolved);
}

export default async function Page({
  params,
}: {
  params: Promise<{ version: string; slug: string[] }>;
}) {
  const resolved = await params;
  return <DocPage locale="fr" params={resolved} />;
}
