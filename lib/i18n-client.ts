"use client";

import { usePathname } from "next/navigation";
import { getLocaleFromPathname, type Locale } from "./i18n";

/** Locale derived from the current route, for client components. */
export function useLocale(): Locale {
  return getLocaleFromPathname(usePathname());
}
