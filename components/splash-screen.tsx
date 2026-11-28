"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RaitonMark } from "@/components/raiton-mark";
import { getMessages } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n-client";

const SEEN_KEY = "raiton-splash";
const LEAVE_DELAY = 2520;
const EXIT_DURATION = 560;

type SplashState = "visible" | "leaving" | "hidden";

/**
 * First-paint brand moment: the Raiton mark traces its own contours, then
 * fills in and hands the page over. Shown once per browser session, skipped
 * for reduced motion, and dismissible at any time (click, Escape, ×).
 */
export function SplashScreen() {
  const [state, setState] = useState<SplashState>("visible");
  const timers = useRef<number[]>([]);
  const locale = useLocale();
  const messages = getMessages(locale);

  const remember = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "seen");
    } catch {
      /* storage can be unavailable in private contexts */
    }
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const dismiss = useCallback(
    (immediate = false) => {
      clearTimers();
      remember();

      if (immediate) {
        setState("hidden");
        return;
      }

      setState((current) => (current === "hidden" ? current : "leaving"));
      timers.current.push(
        window.setTimeout(() => setState("hidden"), EXIT_DURATION),
      );
    },
    [clearTimers, remember],
  );

  useEffect(() => {
    // The inline head script resolved the first-paint decision before paint.
    if (document.documentElement.dataset.splash === "off") {
      setState("hidden");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dismiss(true);
      return;
    }

    timers.current.push(window.setTimeout(() => dismiss(), LEAVE_DELAY));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimers();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [clearTimers, dismiss]);

  // Hold the page still while the overlay is present. This lives in its own
  // effect so the lock is released when the splash hides: the component then
  // renders `null` without unmounting, so an unmount-only cleanup would leak.
  useEffect(() => {
    if (state === "hidden") return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [state]);

  if (state === "hidden") return null;

  return (
    <div
      className={`splash${state === "leaving" ? " is-leaving" : ""}`}
      data-splash
      onClick={() => dismiss()}
    >
      <span className="splash__glow splash__glow--rose" aria-hidden="true" />
      <span className="splash__glow splash__glow--peach" aria-hidden="true" />
      <span className="splash__scan" aria-hidden="true" />
      <span className="splash__glitch" aria-hidden="true" />

      <div className="splash__stage" aria-hidden="true">
        <div className="splash__mark-wrap">
          <RaitonMark className="splash__mark" />
        </div>
        <p className="splash__wordmark">raiton</p>
        <p className="splash__caption">backend framework</p>
        <span className="splash__progress">
          <span />
        </span>
      </div>

      <button
        type="button"
        className="splash__skip"
        aria-label={messages.common.skipIntro}
        title={messages.common.close}
        onClick={(event) => {
          event.stopPropagation();
          dismiss();
        }}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
