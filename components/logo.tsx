import { asset } from "@/lib/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f8e7c4] shadow-[inset_0_0_0_1px_rgba(255,255,255,.35),0_6px_16px_-8px_rgba(0,0,0,.8)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/brand/logo-mark.png")}
          alt=""
          width={37}
          height={34}
          className="h-full w-full object-contain"
        />
        <span className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/25" />
      </span>
      {!compact && (
        <span className="flex items-baseline gap-2">
          <span className="text-[18px] font-bold leading-none tracking-[-0.035em] text-[var(--fg)]">
            raiton
          </span>
          <span className="hidden rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.05)] px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:inline-flex">
            docs
          </span>
        </span>
      )}
    </span>
  );
}
