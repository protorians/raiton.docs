"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  getLocaleFromPathname,
  getMessages,
  localizePath,
} from "@/lib/i18n";
import { getVersion, getVersions, isLatest } from "@/lib/versions";

export function VersionSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() ?? "/docs";
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const versions = getVersions(locale);
  const match = pathname.match(/\/docs\/(\d+\.\d+)/);
  const current = match ? getVersion(match[1], locale) : undefined;

  return (
    <label
      className={`relative inline-flex items-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.05)] text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] ${
        compact ? "h-8 pl-3 pr-7" : "h-9 pl-3.5 pr-8"
      }`}
      title={messages.common.version}
    >
      <span className="sr-only">{messages.common.version}</span>
      <select
        value={current?.id ?? versions[0].id}
        onChange={(event) =>
          router.push(localizePath(locale, `/docs/${event.target.value}/`))
        }
        className="cursor-pointer appearance-none bg-transparent pr-1 font-mono text-[11.5px] font-semibold tracking-wide outline-none"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {version.label}
            {isLatest(version.id) ? ` (${messages.common.latest})` : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5" />
    </label>
  );
}
