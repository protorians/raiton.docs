"use client";

import { Activity, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  {
    key: "request",
    label: "Requête",
    detail: "POST /api/users",
    meta: "Bun.serve · HTTP/1.1",
    code: "POST /api/users\nContent-Type: application/json\n\n{ \"email\": \"ada@raiton.dev\", \"name\": \"Ada\" }",
  },
  {
    key: "controller",
    label: "Contrôleur",
    detail: "@Post(\"/\")",
    meta: "@Input(CreateUser) · @Output(User)",
    code: "@Controllable(\"/users\")\nexport class UsersController {\n  @Post(\"/\")\n  create(@Body() input: CreateUser) {\n    return this.users.create(input)\n  }\n}",
  },
  {
    key: "contract",
    label: "Contrat",
    detail: "CreateUser",
    meta: "TypeBox · validation runtime",
    code: "const CreateUser = t.object({\n  email: t.string().email(),\n  name: t.string().min(2),\n})",
  },
  {
    key: "artefacts",
    label: "Artefacts",
    detail: "Types · OpenAPI · SDK",
    meta: "une source, quatre sorties",
    code: "types.ts        validation runtime\nopenapi.json    document généré\nclient.ts       SDK typé",
  },
  {
    key: "response",
    label: "Réponse",
    detail: "201 Created",
    meta: "JSON typé · tracé",
    code: "HTTP/1.1 201 Created\n\n{ \"id\": \"usr_01\", \"email\": \"ada@raiton.dev\" }",
  },
];

export function HeroSignal() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % STAGES.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [paused]);

  const stage = STAGES[active];

  return (
    <div className="glass relative overflow-hidden rounded-[26px] p-5 sm:p-7">
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(63,123,255,.18)" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-[rgba(123,77,255,.14)] blur-3xl" aria-hidden />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="kick">
            <Activity className="h-3.5 w-3.5" /> Le signal Raiton
          </p>
          <h2 className="mt-2 text-balance text-[21px] font-semibold tracking-[-0.03em] sm:text-[25px]">
            Une requête. Toute la chaîne s&apos;allume.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="icon-btn h-8 w-8 shrink-0 border border-[var(--border)] bg-[var(--panel-solid)]"
          aria-label={paused ? "Reprendre le signal" : "Mettre le signal en pause"}
          title={paused ? "Reprendre" : "Pause"}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="relative mt-7">
        <div className="absolute left-[10%] right-[10%] top-[6px] h-px bg-[var(--border-strong)]" aria-hidden />
        <div
          className="absolute left-[10%] top-[6px] h-px w-[80%] origin-left bg-[var(--accent)] transition-transform duration-700 ease-out"
          style={{ transform: `scaleX(${active / (STAGES.length - 1)})` }}
          aria-hidden
        />
        <div role="tablist" aria-label="Étapes de la requête" className="relative grid grid-cols-5 gap-1">
          {STAGES.map((item, index) => {
            const isActive = index === active;
            const isPast = index < active;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="raiton-signal-panel"
                onClick={() => setActive(index)}
                className="group flex min-w-0 flex-col items-center gap-2.5 text-center"
              >
                <span
                  className={`relative block h-[13px] w-[13px] rounded-full border transition-[background-color,border-color,box-shadow] duration-300 ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] shadow-[0_0_0_5px_rgba(169,196,255,.16),0_0_18px_rgba(169,196,255,.7)]"
                      : isPast
                        ? "border-[rgba(169,196,255,.5)] bg-[rgba(169,196,255,.5)]"
                        : "border-[var(--border-strong)] bg-[var(--bg)] group-hover:border-[var(--accent)]"
                  }`}
                />
                <span
                  className={`truncate text-[9.5px] font-medium leading-tight transition-colors sm:text-[11px] ${
                    isActive ? "text-[var(--fg)]" : "text-[var(--faint)] group-hover:text-[var(--muted)]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="raiton-signal-panel"
        role="tabpanel"
        className="relative mt-6 grid gap-4 md:grid-cols-[.92fr_1.08fr] md:gap-5"
      >
        <div key={`${stage.key}-copy`} className="animate-fade-up">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
            Chaîne de requête · {stage.label}
          </p>
          <p className="mt-2 font-mono text-[15px] font-medium text-[var(--accent-strong)]">
            {stage.detail}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{stage.meta}</p>
        </div>
        <pre
          key={stage.key}
          className="animate-fade-up overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3.5 font-mono text-[11px] leading-[1.7] text-[var(--fg-soft)] sm:text-[11.5px]"
        >
          <code>{stage.code}</code>
        </pre>
      </div>
    </div>
  );
}
