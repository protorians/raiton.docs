"use client";

import { Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  getLocaleFromPathname,
  getMessages,
  localizePath,
  stripLocale,
} from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { getLatestVersion } from "@/lib/versions";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const v = getLatestVersion(locale).id;
  const bare = stripLocale(pathname);
  const clean = bare.replace(/^\/docs\/\d+\.\d+/, "/docs").replace(/\/+$/, "");
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });

  const LINKS = [
    {
      href: localizePath(locale, "/docs"),
      label: messages.header.links.documentation,
      match: "/docs",
    },
    {
      href: localizePath(locale, `/docs/${v}/quickstart`),
      label: messages.header.links.quickstart,
      match: "/quickstart",
    },
    {
      href: localizePath(locale, `/docs/${v}/decorators`),
      label: messages.header.links.reference,
      match: "/decorators",
    },
    {
      href: localizePath(locale, `/docs/${v}/releases`),
      label: messages.header.links.versions,
      match: "/releases",
    },
  ];

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (link: (typeof LINKS)[number]) => {
    if (link.match === "/docs") {
      if (clean === "/docs") return true;
      return (
        bare.startsWith("/docs/") &&
        !LINKS.slice(1).some((item) => bare.includes(item.match))
      );
    }
    return bare.includes(link.match);
  };

  useEffect(() => {
    const measure = () => {
      const active = LINKS.find(isActive);
      const element = active ? linkRefs.current[active.href] : null;
      if (!element || !navRef.current) {
        setPill((value) => ({ ...value, opacity: 0 }));
        return;
      }
      setPill({
        left: element.offsetLeft,
        width: element.offsetWidth,
        opacity: 1,
      });
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
    // The measurement only depends on the active pathname.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header className="site-header sticky top-2 z-50 px-3 pt-2 sm:top-3 sm:px-4 sm:pt-3">
      <div
        data-nav-light
        className="nav-glass mx-auto grid h-[58px] w-full max-w-[1240px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[20px] px-2 py-1.5 pl-2.5 sm:h-[60px] sm:px-2.5"
      >
        <Link
          href={localizePath(locale, "/")}
          className="min-w-0 justify-self-start overflow-hidden"
          aria-label={messages.header.homeAria}
        >
          <Logo />
        </Link>

        <nav
          className="hidden items-center justify-self-center md:flex"
          aria-label={messages.header.mainNavAria}
        >
          <div
            ref={navRef}
            className="nav-inset relative flex items-center gap-0.5 rounded-full border border-[var(--border)] p-1"
          >
            <span
              aria-hidden
              className="nav-pill absolute top-1 h-[calc(100%-8px)] rounded-full transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(.23,1,.32,1)]"
              style={{
                transform: `translateX(${pill.left}px)`,
                width: pill.width,
                opacity: pill.opacity,
              }}
            />
            {LINKS.map((link) => (
              <Link
                key={link.href}
                ref={(node) => {
                  linkRefs.current[link.href] = node;
                }}
                href={link.href}
                className="relative z-[1] rounded-full px-3 py-2 text-[13px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)] data-[active=true]:text-[var(--fg)] lg:px-3.5"
                data-active={isActive(link)}
                aria-current={isActive(link) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex items-center justify-self-end gap-1">
          <SearchDialog />
          <LanguageSwitcher />
          <div className="hidden xl:block">
            <VersionSwitcher />
          </div>
          <ThemeToggle />
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="icon-btn hidden lg:inline-flex"
            aria-label={messages.header.githubAria}
          >
            <Github className="h-[17px] w-[17px]" />
          </a>
          <button
            type="button"
            className="icon-btn md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? messages.header.closeMenu : messages.header.openMenu}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-glass mx-auto mt-2 w-full max-w-[1240px] rounded-[20px] p-3 md:hidden">
          <nav className="mt-1 grid gap-1" aria-label={messages.header.mobileNavAria}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-hover flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] text-[var(--fg-soft)] hover:text-[var(--fg)]"
              >
                {link.label}
                <span className="font-mono text-[11px] text-[var(--faint)]">↗</span>
              </Link>
            ))}
          </nav>
          <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] px-1 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[var(--faint)]">
              {messages.common.version}
            </span>
            <VersionSwitcher compact />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] px-1 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[var(--faint)]">
              {messages.common.language}
            </span>
            <LanguageSwitcher compact />
          </div>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="nav-hover mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13.5px] text-[var(--fg-soft)]"
          >
            <Github className="h-4 w-4" /> {messages.common.github}
          </a>
        </div>
      )}
    </header>
  );
}
