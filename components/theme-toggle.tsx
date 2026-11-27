"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
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
      aria-label="Basculer le thème clair/sombre"
      title="Thème clair / sombre"
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
