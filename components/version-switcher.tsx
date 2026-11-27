"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { VERSIONS, getVersion, isLatest } from "@/lib/versions";

export function VersionSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() ?? "/docs";
  const router = useRouter();
  const match = pathname.match(/\/docs\/(\d+\.\d+)/);
  const current = match ? getVersion(match[1]) : undefined;

  return (
    <label
      className={`relative inline-flex items-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.05)] text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] ${
        compact ? "h-8 pl-3 pr-7" : "h-9 pl-3.5 pr-8"
      }`}
      title="Changer de version de documentation"
    >
      <span className="sr-only">Version de la documentation</span>
      <select
        value={current?.id ?? VERSIONS[0].id}
        onChange={(event) => router.push(`/docs/${event.target.value}/`)}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-mono text-[11.5px] font-semibold tracking-wide outline-none"
      >
        {VERSIONS.map((version) => (
          <option key={version.id} value={version.id}>
            {version.label}
            {isLatest(version.id) ? " (latest)" : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5" />
    </label>
  );
}
