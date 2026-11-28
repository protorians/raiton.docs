"use client";

import { useEffect } from "react";
import { getMessages } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n-client";

/**
 * Progressively enhances server-rendered Shiki blocks with a copy button.
 */
export function CodeCopy() {
  const locale = useLocale();
  const messages = getMessages(locale);

  useEffect(() => {
    const roots = Array.from(document.querySelectorAll("[data-doc-content]"));
    if (roots.length === 0) return;

    const blocks = roots.flatMap((root) => Array.from(root.querySelectorAll("pre.shiki")));

    for (const pre of blocks) {
      if (pre.parentElement?.classList.contains("code-shell")) continue;

      const shell = document.createElement("div");
      shell.className = "code-shell";
      pre.parentNode?.insertBefore(shell, pre);
      shell.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.innerHTML = `<span>${messages.common.copy}</span>`;

      button.addEventListener("click", async () => {
        const code = pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML =
            `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg><span>${messages.common.copied}</span>`;
          window.setTimeout(() => {
            button.innerHTML = `<span>${messages.common.copy}</span>`;
          }, 1800);
        } catch {
          /* clipboard unavailable */
        }
      });

      shell.appendChild(button);
    }
  }, [locale, messages.common.copy, messages.common.copied]);

  return null;
}
