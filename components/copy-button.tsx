"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { getMessages } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n-client";

export function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const locale = useLocale();
  const messages = getMessages(locale);
  const copyLabel = label ?? messages.common.copy;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button type="button" onClick={copy} className={className} aria-label={copyLabel}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span>{copied ? messages.common.copied : copyLabel}</span>
    </button>
  );
}
