import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeCopy } from "@/components/code-copy";
import { OnThisPage } from "@/components/on-this-page";
import {
  getDoc,
  getPrevNext,
  getSectionLabel,
} from "@/lib/docs";
import {
  getMessages,
  interpolate,
  localizePath,
  type Locale,
} from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getLatestVersion, getVersion, isLatest } from "@/lib/versions";

export async function docMetadata(
  locale: Locale,
  params: { version: string; slug: string[] },
): Promise<Metadata> {
  const messages = getMessages(locale);
  const doc = await getDoc(params.version, params.slug.join("/"), locale);
  if (!doc) return { title: messages.notFound.title };

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: localizePath(locale, `/docs/${params.version}/${doc.slug}/`),
      languages: {
        fr: `/docs/${params.version}/${doc.slug}/`,
        en: `/en/docs/${params.version}/${doc.slug}/`,
      },
    },
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      title: doc.title,
      description: doc.description,
    },
  };
}

export async function DocPage({
  locale,
  params,
}: {
  locale: Locale;
  params: { version: string; slug: string[] };
}) {
  const messages = getMessages(locale);
  const version = getVersion(params.version, locale);
  if (!version) notFound();

  const slug = params.slug.join("/");
  const doc = await getDoc(version.id, slug, locale);
  if (!doc) notFound();

  const { previous, next } = getPrevNext(version.id, doc.slug, locale);
  const words = doc.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(words / 210));
  const editUrl = `${SITE.docsGithub}/edit/main/${doc.sourcePath}`;
  const isNew = doc.since !== "6.0";
  const latestId = getLatestVersion(locale).id;
  const sectionLabel = getSectionLabel(doc.section, locale);

  return (
    <article className="min-w-0 px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0 max-w-[820px]">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-[var(--faint)]"
            aria-label={messages.docs.breadcrumbAria}
          >
            <Link
              href={localizePath(locale, `/docs/${version.id}/`)}
              className="hover:text-[var(--accent-strong)]"
            >
              {messages.common.documentation}
            </Link>
            <span>/</span>
            <span>{sectionLabel}</span>
            <span>/</span>
            <span className="max-w-[220px] truncate text-[var(--muted)]">{doc.title}</span>
          </nav>

          <header className="mt-5 border-b border-[var(--border)] pb-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">{sectionLabel}</span>
              {isNew && (
                <span className="version-pill" data-status="latest">
                  {interpolate(messages.docs.since, { version: doc.since })}
                </span>
              )}
              {!isLatest(version.id) && (
                <span className="version-pill" data-status="archived">
                  {version.label}
                </span>
              )}
            </div>

            <h1 className="display-title mt-3 text-balance text-[2.35rem] text-[var(--fg)] sm:text-[2.7rem]">
              {doc.title}
            </h1>

            {doc.description && (
              <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[var(--muted)]">
                {doc.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--faint)]">
              <span className="chip">
                <Clock className="h-3.5 w-3.5" />{" "}
                {interpolate(messages.docs.readingTime, { minutes: readingTime })}
              </span>
              <span className="font-mono">{version.tag}</span>
            </div>
          </header>

          {!isLatest(version.id) && (
            <div className="docs-prose mt-6">
              <div className="callout callout-warning">
                <p>
                  {interpolate(messages.docs.archivedNotice, {
                    version: version.id,
                  })}{" "}
                  <Link href={localizePath(locale, `/docs/${latestId}/${doc.slug}`)}>
                    {messages.docs.currentVersion}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {!doc.translated && (
            <div className="docs-prose mt-6">
              <div className="callout callout-info">
                <p>{messages.common.translationNotice}</p>
              </div>
            </div>
          )}

          <details className="glass mt-6 rounded-xl p-4 xl:hidden">
            <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {messages.docs.onThisPage}
            </summary>
            <div className="mt-3">
              <OnThisPage entries={doc.toc} locale={locale} />
            </div>
          </details>

          <CodeCopy />
          <div
            className="docs-prose mt-7"
            data-doc-content
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />

          <div className="mt-10 flex items-center justify-between border-t border-[var(--border)] pt-5">
            <a
              href={editUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--accent-strong)]"
            >
              {messages.docs.edit} <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-[11px] text-[var(--faint)]">
              {interpolate(messages.docs.updatedWith, { version: version.label })}
            </span>
          </div>

          <nav
            className="mt-6 grid gap-3 sm:grid-cols-2"
            aria-label={messages.docs.pageNavAria}
          >
            {previous ? (
              <Link
                href={localizePath(locale, `/docs/${version.id}/${previous.slug}`)}
                className="glass spotlight group rounded-xl p-4 transition-colors hover:border-[var(--accent)]" data-spotlight
              >
                <span className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">
                  <ChevronLeft className="h-3.5 w-3.5" /> {messages.docs.previous}
                </span>
                <span className="mt-1.5 block text-[13.5px] font-medium text-[var(--fg)] group-hover:text-[var(--accent-strong)]">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={localizePath(locale, `/docs/${version.id}/${next.slug}`)}
                className="glass spotlight group rounded-xl p-4 text-right transition-colors hover:border-[var(--accent)] sm:col-start-2" data-spotlight
              >
                <span className="flex items-center justify-end gap-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">
                  {messages.docs.next} <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1.5 block text-[13.5px] font-medium text-[var(--fg)] group-hover:text-[var(--accent-strong)]">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-[6.2rem] max-h-[calc(100vh-7.5rem)] overflow-y-auto pb-10">
            <OnThisPage entries={doc.toc} locale={locale} />
          </div>
        </aside>
      </div>
    </article>
  );
}
