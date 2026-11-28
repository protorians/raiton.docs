"use client";

import { ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  getLocaleFromPathname,
  getMessages,
  LOCALE_LABELS,
  LOCALE_SHORT,
  LOCALE_STORAGE_KEY,
  LOCALES,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);

  function change(next: Locale) {
    if (next === locale) return;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
    router.push(switchLocalePath(pathname, next));
  }

  return (
    <label
      className={`relative inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.05)] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] ${
        compact ? "h-8 pl-2.5 pr-7 text-[11.5px]" : "h-9 pl-3 pr-8 text-[12px]"
      }`}
      title={messages.header.changeLanguage}
    >
      <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="sr-only">{messages.common.language}</span>
      <span aria-hidden className="font-mono text-[10.5px] font-semibold tracking-wide">
        {LOCALE_SHORT[locale]}
      </span>
      <select
        value={locale}
        onChange={(event) => change(event.target.value as Locale)}
        aria-label={messages.header.changeLanguage}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {LOCALE_LABELS[item]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5" />
    </label>
  );
}
