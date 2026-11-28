"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getMessages } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n-client";

export function ThemeToggle() {
  const locale = useLocale();
  const messages = getMessages(locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("raiton-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-btn"
      aria-label={messages.header.themeToggle}
      title={messages.header.themeTitle}
    >
      {mounted ? (
        <>
          <Sun className="hidden h-[18px] w-[18px] dark:block" />
          <Moon className="h-[18px] w-[18px] dark:hidden" />
        </>
      ) : (
        <span className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
