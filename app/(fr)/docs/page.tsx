import type { Metadata } from "next";
import { DocsIndexPage, docsIndexMetadata } from "@/app/_pages/docs-index-page";

export const metadata: Metadata = docsIndexMetadata("fr");

export default function Page() {
  return <DocsIndexPage locale="fr" />;
}
