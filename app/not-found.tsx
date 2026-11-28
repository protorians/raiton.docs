"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getLocaleFromPathname,
  getMessages,
  localizePath,
} from "@/lib/i18n";

export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);

  return (
    <div className="site-container relative flex min-h-[64vh] flex-col items-center justify-center py-20 text-center">
      <div className="orb absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 opacity-80" aria-hidden />
      <div className="relative pt-24">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          {messages.notFound.code}
        </p>
        <h1 className="display-title mt-3 text-4xl sm:text-5xl">
          {messages.notFound.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
          {messages.notFound.body}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={localizePath(locale, "/docs")} className="btn btn-primary">
            {messages.notFound.back}
          </Link>
          <Link href={localizePath(locale, "/")} className="btn btn-glass">
            {messages.notFound.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
