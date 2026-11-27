import {
  ArrowRight,
  BookMarked,
  Boxes,
  Clock,
  Compass,
  History,
  Rocket,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { DocMeta, NavSection } from "@/lib/docs";
import { VERSIONS, isLatest, type DocVersion } from "@/lib/versions";

const ICONS: Record<string, typeof Rocket> = {
  demarrage: Rocket,
  concepts: Boxes,
  fonctionnalites: Sparkles,
  cli: Terminal,
  reference: BookMarked,
  guides: Compass,
  versions: History,
};

const START_HERE = [
  { slug: "quickstart", label: "Démarrage rapide", icon: Zap },
  { slug: "application", label: "Application & cycle de vie", icon: Boxes },
  { slug: "contracts", label: "Contrats schema-first", icon: Sparkles },
  { slug: "cli", label: "Le CLI en 5 minutes", icon: Terminal },
];

export function DocsLanding({
  version,
  sections,
  docs,
}: {
  version: DocVersion;
  sections: NavSection[];
  docs: DocMeta[];
}) {
  const latest = isLatest(version.id);
  const find = (slug: string) => docs.find((doc) => doc.slug === slug);
  const availableStart = START_HERE.filter((item) => find(item.slug));

  return (
    <div className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">Documentation</span>
          <span className="version-pill" data-status={version.status}>
            {version.label}
            {latest ? " · latest" : " · archive"}
          </span>
          <span className="chip font-mono">{version.tag}</span>
        </div>

        <h1 className="display-title mt-5 text-balance text-4xl sm:text-5xl">
          Construisez avec <span className="text-[var(--accent)]">Raiton</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[var(--muted)]">
          {latest
            ? "Des contrôleurs lisibles, une injection de dépendances explicite, des contrats qui alimentent la validation, OpenAPI et le client typé. Tout le nécessaire pour livrer une API TypeScript sans assembler dix bibliothèques."
            : `Retrouvez les concepts, le CLI, les fonctionnalités et la référence API tels qu'ils existaient dans Raiton ${version.id}. Les pages introduites plus tard ne figurent pas dans cette archive.`}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href={`/docs/${version.id}/quickstart`} className="btn-primary">
            Démarrer en 5 minutes <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/docs/${version.id}/cli`} className="btn-ghost">
            Explorer le CLI
          </Link>
          <span className="chip">
            <Clock className="h-3.5 w-3.5" /> {docs.length} pages · {version.label}
          </span>
        </div>
      </div>

      {!latest && (
        <div className="docs-prose mt-10 max-w-3xl">
          <div className="callout callout-warning">
            <p>
              Vous consultez la documentation archivée de <strong>Raiton {version.id}</strong>.
              Les nouvelles fonctionnalités peuvent ne pas y figurer.{" "}
              <Link href={`/docs/${VERSIONS[0].id}/`}>Lire la documentation actuelle →</Link>
            </p>
          </div>
        </div>
      )}

      {availableStart.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Commencer ici</h2>
              <p className="mt-1 text-[13px] text-[var(--muted)]">
                Le parcours recommandé pour une première API.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {availableStart.map((item) => {
              const doc = find(item.slug)!;
              const Icon = item.icon;
              return (
                <Link
                  key={item.slug}
                  href={`/docs/${version.id}/${item.slug}`}
                  className="group flex items-start gap-3.5 glass spotlight rounded-xl p-4 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-card"
                  data-spotlight
                  data-reveal
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--fg)]">
                      {item.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-relaxed text-[var(--muted)]">
                      {doc.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">Parcourir la documentation</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {sections
            .filter((section) => !["versions"].includes(section.id))
            .map((section) => {
              const Icon = ICONS[section.id] ?? Boxes;
              return (
                <div
                  key={section.id}
                  className="glass spotlight rounded-xl p-5"
                  data-spotlight
                  data-reveal
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-soft)] text-[var(--accent-strong)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-[14px] font-semibold">{section.title}</h3>
                      {section.description && (
                        <p className="text-[11.5px] text-[var(--muted)]">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {section.items.slice(0, 5).map((doc) => (
                      <li key={doc.slug}>
                        <Link
                          href={`/docs/${version.id}/${doc.slug}`}
                          className="group flex items-center justify-between gap-3 rounded-md px-2 py-1 text-[12.5px] text-[var(--fg-soft)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--accent-strong)]"
                        >
                          <span className="truncate">{doc.title}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {section.items.length > 5 && (
                    <Link
                      href={`/docs/${version.id}/${section.items[0].slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--accent-strong)]"
                    >
                      Voir les {section.items.length} pages <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      <section className="mt-14 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="glass rounded-2xl p-6" data-reveal>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
              Nouveautés {version.label}
            </p>
          </div>
          <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.02em]">
            {version.headline}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{version.summary}</p>
          <ul className="mt-4 space-y-2">
            {version.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--fg-soft)]">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                {highlight}
              </li>
            ))}
          </ul>
          <Link
            href={`/docs/${version.id}/releases`}
            className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--accent-strong)]"
          >
            Lire les notes de version <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="glass rounded-2xl p-6" data-reveal>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
            Toutes les versions
          </p>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {VERSIONS.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/docs/${item.id}/`}
                  className="group flex items-center gap-3 py-2.5"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isLatest(item.id) ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-[var(--fg)]">
                      Raiton {item.label}
                      {isLatest(item.id) && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent-strong)]">
                          latest
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[11.5px] text-[var(--muted)]">
                      {item.headline}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--faint)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/docs/${version.id}/versioning`}
            className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent-strong)]"
          >
            Politique de versions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
