"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLocaleFromPathname, getMessages } from "@/lib/i18n";

/**
 * Keeps the document language, the skip link and the stored locale in sync
 * with the current route. The first-visit redirect itself runs in an inline
 * script from the root layout, before paint.
 */
export function LocaleRuntime() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <a
      href="#content"
      className="sr-only z-[300] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-[var(--accent-ink)]"
    >
      {messages.common.skipToContent}
    </a>
  );
}
