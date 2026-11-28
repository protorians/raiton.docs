"use client";

import { Github, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  getLocaleFromPathname,
  getMessages,
  interpolate,
  localizePath,
} from "@/lib/i18n";
import { SITE, getSiteCopy } from "@/lib/site";
import { getLatestVersion } from "@/lib/versions";

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const copy = getSiteCopy(locale);
  const latest = getLatestVersion(locale);
  const v = latest.id;

  const columns = [
    {
      title: messages.footer.columns.documentation,
      links: [
        { href: "/docs", label: messages.footer.links.overview },
        {
          href: `/docs/${v}/quickstart`,
          label: messages.footer.links.quickstart,
        },
        { href: `/docs/${v}/contracts`, label: messages.footer.links.contracts },
        { href: `/docs/${v}/mcp`, label: messages.footer.links.mcp },
        { href: `/docs/${v}/cli`, label: messages.footer.links.cli },
      ],
    },
    {
      title: messages.footer.columns.reference,
      links: [
        {
          href: `/docs/${v}/decorators`,
          label: messages.footer.links.decorators,
        },
        { href: `/docs/${v}/core-api`, label: messages.footer.links.coreApi },
        {
          href: `/docs/${v}/configuration`,
          label: messages.footer.links.configuration,
        },
        { href: `/docs/${v}/types`, label: messages.footer.links.types },
        { href: `/docs/${v}/errors`, label: messages.footer.links.errors },
      ],
    },
    {
      title: messages.footer.columns.resources,
      links: [
        {
          href: `/docs/${v}/releases`,
          label: interpolate(messages.footer.links.releases, {
            version: latest.label,
          }),
        },
        {
          href: `/docs/${v}/versioning`,
          label: messages.footer.links.versioning,
        },
        {
          href: `/docs/${v}/deployment`,
          label: messages.footer.links.deployment,
        },
        { href: `/docs/${v}/testing`, label: messages.footer.links.testing },
        {
          href: `/docs/${v}/contributing`,
          label: messages.footer.links.contributing,
        },
      ],
    },
  ];

  return (
    <footer className="site-footer relative mt-6 border-t border-[var(--border)]">
      <div className="site-container pb-10 pt-12">
        <p
          aria-hidden
          className="wordmark-outline pointer-events-none -mb-3 select-none overflow-hidden text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.78]"
        >
          raiton
        </p>

        <div className="relative grid gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href={localizePath(locale, "/")} aria-label={messages.header.homeAria}>
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
              {copy.tagline} {messages.footer.taglineSuffix}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={SITE.github}
                target="_blank"
                rel="noreferrer"
                className="chip transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                <Github className="h-3.5 w-3.5" /> {messages.common.github}
              </a>
              <a
                href={SITE.npm}
                target="_blank"
                rel="noreferrer"
                className="chip font-mono transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                npm
              </a>
              <span className="chip font-mono">{latest.tag}</span>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--faint)]">
                {column.title}
              </p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localizePath(locale, link.href)}
                      className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--accent-strong)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] pt-6 text-[12px] text-[var(--faint)] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.fullName}.{" "}
            {interpolate(messages.footer.license, { license: SITE.license })}
          </p>
          <p className="flex items-center gap-1.5">
            {messages.footer.designedWith}{" "}
            <Heart className="h-3.5 w-3.5 text-[var(--rose)]" />{" "}
            {messages.footer.by} {SITE.author}
          </p>
        </div>
      </div>
    </footer>
  );
}
