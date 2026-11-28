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
import {
  getMessages,
  interpolate,
  localizePath,
  type Locale,
} from "@/lib/i18n";
import {
  getLatestVersion,
  getVersions,
  isLatest,
  type DocVersion,
} from "@/lib/versions";

const ICONS: Record<string, typeof Rocket> = {
  demarrage: Rocket,
  concepts: Boxes,
  fonctionnalites: Sparkles,
  cli: Terminal,
  reference: BookMarked,
  guides: Compass,
  versions: History,
};

const START_SLUGS = ["quickstart", "application", "contracts", "cli"] as const;
const START_ICONS = {
  quickstart: Zap,
  application: Boxes,
  contracts: Sparkles,
  cli: Terminal,
} as const;

export function DocsLanding({
  locale,
  version,
  sections,
  docs,
}: {
  locale: Locale;
  version: DocVersion;
  sections: NavSection[];
  docs: DocMeta[];
}) {
  const messages = getMessages(locale);
  const t = messages.landing;
  const latest = isLatest(version.id);
  const latestVersion = getLatestVersion(locale);
  const versions = getVersions(locale);
  const find = (slug: string) => docs.find((doc) => doc.slug === slug);
  const availableStart = START_SLUGS.filter((slug) => find(slug));

  return (
    <div className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{t.eyebrow}</span>
          <span className="version-pill" data-status={version.status}>
            {version.label}
            {latest ? ` · ${t.latestSuffix}` : ` · ${t.archiveSuffix}`}
          </span>
          <span className="chip font-mono">{version.tag}</span>
        </div>

        <h1 className="display-title mt-5 text-balance text-4xl sm:text-5xl">
          {t.titleBefore} <span className="text-[var(--accent)]">{t.titleAccent}</span>
          {t.titleEnd}
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[var(--muted)]">
          {latest
            ? t.descriptionLatest
            : interpolate(t.descriptionArchived, { version: version.id })}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={localizePath(locale, `/docs/${version.id}/quickstart`)}
            className="btn-primary"
          >
            {t.startCta} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={localizePath(locale, `/docs/${version.id}/cli`)}
            className="btn-ghost"
          >
            {t.exploreCli}
          </Link>
          <span className="chip">
            <Clock className="h-3.5 w-3.5" />{" "}
            {interpolate(t.pagesCount, {
              count: docs.length,
              version: version.label,
            })}
          </span>
        </div>
      </div>

      {!latest && (
        <div className="docs-prose mt-10 max-w-3xl">
          <div className="callout callout-warning">
            <p>
              {interpolate(t.archiveNotice, { version: version.id })}{" "}
              <Link href={localizePath(locale, `/docs/${latestVersion.id}/`)}>
                {t.currentDocs}
              </Link>
            </p>
          </div>
        </div>
      )}

      {availableStart.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{t.startHereTitle}</h2>
              <p className="mt-1 text-[13px] text-[var(--muted)]">
                {t.startHereDescription}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {availableStart.map((slug) => {
              const doc = find(slug)!;
              const Icon = START_ICONS[slug];
              return (
                <Link
                  key={slug}
                  href={localizePath(locale, `/docs/${version.id}/${slug}`)}
                  className="group flex items-start gap-3.5 glass spotlight rounded-xl p-4 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-card"
                  data-spotlight
                  data-reveal
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--fg)]">
                      {t.startHere[slug]}
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
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{t.browseTitle}</h2>
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
                          href={localizePath(locale, `/docs/${version.id}/${doc.slug}`)}
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
                      href={localizePath(locale, `/docs/${version.id}/${section.items[0].slug}`)}
                      className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--accent-strong)]"
                    >
                      {interpolate(t.viewAll, { count: section.items.length })}{" "}
                      <ArrowRight className="h-3 w-3" />
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
              {interpolate(t.whatsNew, { version: version.label })}
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
            href={localizePath(locale, `/docs/${version.id}/releases`)}
            className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--accent-strong)]"
          >
            {t.releaseNotes} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="glass rounded-2xl p-6" data-reveal>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
            {t.allVersions}
          </p>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {versions.map((item) => (
              <li key={item.id}>
                <Link
                  href={localizePath(locale, `/docs/${item.id}/`)}
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
                          {t.latestWord}
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
            href={localizePath(locale, `/docs/${version.id}/versioning`)}
            className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent-strong)]"
          >
            {t.policy} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
