"use client";

import {
  BookMarked,
  Boxes,
  ChevronRight,
  Compass,
  History,
  Menu,
  Rocket,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  getMessages,
  interpolate,
  localizePath,
  type Locale,
} from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { DocVersion } from "@/lib/versions";

interface SidebarDoc {
  slug: string;
  title: string;
  since: string;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarDoc[];
}

const ICONS: Record<string, typeof Rocket> = {
  demarrage: Rocket,
  concepts: Boxes,
  fonctionnalites: Sparkles,
  cli: Terminal,
  reference: BookMarked,
  guides: Compass,
  versions: History,
};

function isActive(pathname: string, slug: string): boolean {
  return pathname.replace(/\/$/, "").endsWith(`/${slug}`);
}

export function DocsShell({
  locale,
  version,
  sections,
  children,
}: {
  locale: Locale;
  version: DocVersion;
  sections: SidebarSection[];
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const messages = getMessages(locale);
  const [open, setOpen] = useState(false);
  const docsVersion = interpolate(messages.docs.docsVersion, {
    version: version.label,
  });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--faint)]">
          {messages.common.documentation}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="version-pill" data-status={version.status}>
            {version.label}
          </span>
          <span className="truncate font-mono text-[10px] text-[var(--faint)]">{version.tag}</span>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-8">
        {sections.map((section) => {
          const Icon = ICONS[section.id] ?? Boxes;
          return (
            <div key={section.id}>
              <p className="mb-1.5 flex items-center gap-1.5 px-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
                <Icon className="h-3 w-3 text-[var(--accent)]" />
                {section.title}
              </p>
              <ul className="space-y-px">
                {section.items.map((doc) => (
                  <li key={doc.slug}>
                    <Link
                      href={localizePath(locale, `/docs/${version.id}/${doc.slug}`)}
                      className="sidebar-link"
                      data-active={isActive(pathname, doc.slug)}
                      aria-current={isActive(pathname, doc.slug) ? "page" : undefined}
                    >
                      <span className="truncate">{doc.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <div className="glass rounded-xl p-3">
          <p className="text-[11px] font-semibold text-[var(--fg)]">{messages.docs.issueTitle}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
            {messages.docs.issueBody}
          </p>
          <a
            href={SITE.issues}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-strong)]"
          >
            {messages.docs.openIssue} <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="site-container">
      <div className="sticky top-[4.2rem] z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--header)] px-1 py-2.5 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--panel)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--fg)]"
        >
          <Menu className="h-4 w-4" />
          {messages.docs.menu}
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[var(--faint)]">
          {docsVersion}
        </span>
      </div>

      <div className="flex">
        <aside className="sticky top-[4.2rem] hidden h-[calc(100vh-5.2rem)] w-[272px] shrink-0 overflow-y-auto border-r border-[var(--border)] lg:block">
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-[rgba(5,1,3,.68)] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(86vw,320px)] overflow-y-auto border-r border-[var(--border)] bg-[var(--panel-solid)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel-solid)] px-4 py-3">
              <span className="text-[13px] font-semibold">{docsVersion}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label={messages.common.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
