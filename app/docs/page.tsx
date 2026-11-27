import type { Metadata } from "next";
import { DocsLanding } from "@/components/docs-landing";
import { getNavigation, listDocs } from "@/lib/docs";
import { LATEST_VERSION } from "@/lib/versions";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Documentation officielle de Raiton : démarrage, concepts, contrats, MCP, scheduler, CLI et référence API.",
};

export default function DocsIndexPage() {
  return (
    <div className="min-h-[60vh] border-b border-[var(--border)]">
      <div className="site-container">
        <DocsLanding
          version={LATEST_VERSION}
          sections={getNavigation(LATEST_VERSION.id)}
          docs={listDocs(LATEST_VERSION.id)}
        />
      </div>
    </div>
  );
}
