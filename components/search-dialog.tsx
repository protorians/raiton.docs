"use client";

import { Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { asset } from "@/lib/site";
import { VERSIONS, getVersionOrLatest, isSince } from "@/lib/versions";

interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  section: string;
  since: string;
  headings: { id: string; text: string }[];
  text: string;
}

function score(entry: SearchEntry, query: string): number {
  const q = query.toLowerCase();
  let total = 0;
  if (entry.title.toLowerCase().includes(q)) total += 12;
  if (entry.title.toLowerCase().startsWith(q)) total += 8;
  if (entry.description.toLowerCase().includes(q)) total += 5;
  if (entry.section.toLowerCase().includes(q)) total += 3;
  for (const heading of entry.headings) {
    if (heading.text.toLowerCase().includes(q)) total += 6;
  }
  const occurrences = entry.text.toLowerCase().split(q).length - 1;
  total += Math.min(occurrences, 6);
  return total;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[rgba(169,196,255,.24)] px-0.5 text-inherit">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function SearchDialog() {
  const pathname = usePathname() ?? "/docs";
  const version = getVersionOrLatest(pathname.match(/\/docs\/(\d+\.\d+)/)?.[1]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open || entries.length > 0) return;
    setLoading(true);
    fetch(asset("/search-index.json"))
      .then((response) => (response.ok ? response.json() : []))
      .then((data: SearchEntry[]) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open, entries.length]);

  const results = useMemo(() => {
    const sorted = query.trim()
      ? [...entries]
          .map((entry) => ({ entry, value: score(entry, query) }))
          .filter((item) => item.value > 0)
          .sort((left, right) => right.value - left.value)
          .map((item) => item.entry)
      : entries;
    return sorted.slice(0, query.trim() ? 10 : 5);
  }, [entries, query]);

  useEffect(() => setCursor(0), [query, open]);

  const navigate = useCallback(
    (index: number) => {
      const entry = results[index];
      if (!entry) return;
      setOpen(false);
      const target = isSince(entry.since, version.id) ? version.id : VERSIONS[0].id;
      window.location.assign(asset(`/docs/${target}/${entry.slug}/`));
    },
    [results, version.id],
  );

  function onInputKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      navigate(cursor);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.05)] pl-0 pr-0 text-[12.5px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)] lg:h-9 lg:w-auto lg:justify-start lg:pl-3 lg:pr-2 lg:min-w-[220px]"
        aria-label="Rechercher dans la documentation"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden flex-1 text-left lg:inline">Rechercher…</span>
        <span className="kbd ml-auto hidden lg:inline-flex">⌘K</span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-start justify-center bg-[rgba(2,4,10,.68)] px-4 pt-[10vh] backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Recherche dans la documentation"
              className="w-full max-w-[640px] overflow-hidden rounded-[22px] border border-[var(--border-strong)] bg-[var(--panel-solid)] shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_50px_140px_-30px_rgba(0,0,0,.95)]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
                <Search className="h-4 w-4 text-[var(--muted)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKey}
                  placeholder={`Rechercher dans la documentation ${version.label}…`}
                  className="h-14 w-full bg-transparent text-[14px] text-[var(--fg)] outline-none placeholder:text-[var(--faint)]"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="icon-btn h-7 w-7"
                  aria-label="Fermer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[min(62vh,470px)] overflow-y-auto p-2">
                {loading && (
                  <p className="px-3 py-6 text-center text-[13px] text-[var(--muted)]">
                    Chargement de l&apos;index…
                  </p>
                )}

                {!loading && results.length === 0 && (
                  <p className="px-3 py-8 text-center text-[13px] text-[var(--muted)]">
                    Aucun résultat pour « {query} ».
                  </p>
                )}

                {!loading && results.length > 0 && (
                  <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
                    {query.trim() ? "Résultats" : "Pages suggérées"}
                  </p>
                )}

                {results.map((entry, index) => (
                  <button
                    key={entry.slug}
                    type="button"
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => navigate(index)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      cursor === index
                        ? "bg-[var(--accent-soft)]"
                        : "hover:bg-[var(--bg-soft)]"
                    }`}
                  >
                    <span className="mt-0.5 rounded-md border border-[var(--border)] bg-[var(--panel)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
                      {entry.section}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-[var(--fg)]">
                        <Highlight text={entry.title} query={query} />
                      </span>
                      {entry.description && (
                        <span className="mt-0.5 line-clamp-1 block text-[12px] text-[var(--muted)]">
                          {entry.description}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 hidden shrink-0 font-mono text-[10px] text-[var(--faint)] sm:block">
                      ↵
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-[var(--border)] bg-[var(--bg-soft)] px-4 py-2.5 text-[10.5px] text-[var(--faint)]">
                <span className="flex items-center gap-1">
                  <span className="kbd h-5">↑</span>
                  <span className="kbd h-5">↓</span>
                  naviguer
                </span>
                <span className="flex items-center gap-1">
                  <span className="kbd h-5">↵</span>
                  ouvrir
                </span>
                <span className="ml-auto font-mono">{version.label}</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
