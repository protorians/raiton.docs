"use client";

import { useEffect, useMemo, useState } from "react";
import { getMessages, type Locale } from "@/lib/i18n";

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export function OnThisPage({
  entries,
  locale,
}: {
  entries: TocItem[];
  locale: Locale;
}) {
  const [active, setActive] = useState<string>(entries[0]?.id ?? "");

  const ids = useMemo(() => entries.map((entry) => entry.id), [entries]);

  useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = 128;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= offset) current = id;
      }

      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
      if (atBottom) current = ids[ids.length - 1];

      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  if (entries.length === 0) return null;

  const messages = getMessages(locale);

  return (
    <nav aria-label={messages.docs.onThisPage} className="text-[13px]">
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--faint)]">
        {messages.docs.onThisPage}
      </p>
      <ul className="space-y-0.5 border-l border-[var(--border)]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="toc-link"
              data-depth={entry.depth}
              data-active={entry.id === active}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
