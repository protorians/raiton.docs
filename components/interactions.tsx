"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Progressive enhancement shared by every page:
 * - reveals [data-reveal] once, in view
 * - pointer light for [data-spotlight]
 * - restrained layer parallax for [data-parallax-root]
 * - the light caught on the glass nav
 */
export function Interactions() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealables = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let observer: IntersectionObserver | null = null;

    if (reduced.matches || !("IntersectionObserver" in window)) {
      revealables.forEach((element) => element.classList.add("in"));
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("in");
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -7% 0px", threshold: 0.12 },
      );
      revealables.forEach((element) => observer?.observe(element));
    }

    return () => observer?.disconnect();
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const cleanups: Array<() => void> = [];

    document.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((card) => {
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--px", `${event.clientX - rect.left}px`);
        card.style.setProperty("--py", `${event.clientY - rect.top}px`);
      };
      card.addEventListener("pointermove", move, { passive: true });
      cleanups.push(() => card.removeEventListener("pointermove", move));
    });

    document.querySelectorAll<HTMLElement>("[data-parallax-root]").forEach((root) => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!fine) return;
      let frame = 0;
      const move = (event: PointerEvent) => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          const rect = root.getBoundingClientRect();
          const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
          const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
          root.style.setProperty("--mx", x.toFixed(4));
          root.style.setProperty("--my", y.toFixed(4));
        });
      };
      const leave = () => {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        root.style.setProperty("--mx", "0");
        root.style.setProperty("--my", "0");
      };
      root.addEventListener("pointermove", move, { passive: true });
      root.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        if (frame) window.cancelAnimationFrame(frame);
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", leave);
      });
    });

    document.querySelectorAll<HTMLElement>("[data-nav-light]").forEach((bar) => {
      const move = (event: PointerEvent) => {
        const rect = bar.getBoundingClientRect();
        bar.style.setProperty("--nx", `${event.clientX - rect.left}px`);
      };
      bar.addEventListener("pointermove", move, { passive: true });
      cleanups.push(() => bar.removeEventListener("pointermove", move));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  return null;
}
