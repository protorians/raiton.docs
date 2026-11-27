import {
  ArrowRight,
  Boxes,
  Check,
  Github,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Timer,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CodeCopy } from "@/components/code-copy";
import { CopyButton } from "@/components/copy-button";
import { HeroSignal } from "@/components/hero-signal";
import { listDocs } from "@/lib/docs";
import { BASE_PATH, SITE } from "@/lib/site";
import { renderMarkdown } from "@/lib/markdown";
import { LATEST_VERSION } from "@/lib/versions";

const v = LATEST_VERSION.id;

const FEATURES = [
  {
    icon: Zap,
    title: "Bun-first, trois runtimes",
    description:
      "Bun.serve natif en production, adaptateurs Node.js et Deno complets. Le même contrôleur, le même bootstrap, le même comportement.",
    href: `/docs/${v}/runtimes`,
    tag: "Runtime",
    pills: ["Bun", "Node.js", "Deno"],
    wide: true,
  },
  {
    icon: Boxes,
    title: "Injection explicite",
    description:
      "Singletons, transients, cycles onInit/onMount/onUnmount et détection des dépendances circulaires. Rien d’implicite.",
    href: `/docs/${v}/injection`,
    tag: "Architecture",
  },
  {
    icon: Sparkles,
    title: "Contrats schema-first",
    description:
      "Une définition TypeBox alimente la validation runtime, les types TypeScript, OpenAPI et le client généré. Une seule source de vérité.",
    href: `/docs/${v}/contracts`,
    tag: "Contrats",
  },
  {
    icon: Radio,
    title: "MCP HTTP + stdio",
    description:
      "Exposez outils, prompts et ressources aux agents IA, sur le même port que votre API. Schémas, scopes, audit et limitation de débit.",
    href: `/docs/${v}/mcp`,
    tag: "IA",
    pills: ["tools", "prompts", "resources"],
    wide: true,
  },
  {
    icon: Timer,
    title: "Scheduler et files",
    description:
      "Cron, intervalles, tâches nommées et backends mémoire, Redis ou RabbitMQ. HMR et injection de dépendances inclus.",
    href: `/docs/${v}/scheduler`,
    tag: "Jobs",
  },
  {
    icon: ShieldCheck,
    title: "Observabilité opt-in",
    description:
      "Corrélation, métriques Prometheus, traces OTLP et arrêt gracieux. Désactivée, elle n’ajoute aucun coût sur le chemin chaud.",
    href: `/docs/${v}/observability`,
    tag: "Production",
    pills: ["Prometheus", "OTLP", "health"],
    wide: true,
  },
];

const LIFECYCLE = [
  {
    icon: Wand2,
    title: "Créer",
    description: "Un projet complet, testé et prêt à démarrer, en une commande.",
    code: "bun raiton new my-api --template api",
  },
  {
    icon: Terminal,
    title: "Développer",
    description: "HMR sur les contrôleurs, services, sockets, MCP et jobs.",
    code: "bun raiton dev",
  },
  {
    icon: Rocket,
    title: "Livrer",
    description: "Build, diagnostic, contrat OpenAPI et client typé.",
    code: "bun raiton build && bun raiton start",
  },
];

const START = [
  {
    href: `/docs/${v}/quickstart`,
    title: "Démarrage rapide",
    detail: "Serveur en 5 minutes",
    icon: Zap,
  },
  {
    href: `/docs/${v}/application`,
    title: "Application & cycle de vie",
    detail: "Application, routes, DI",
    icon: Boxes,
  },
  {
    href: `/docs/${v}/contracts`,
    title: "Contrats",
    detail: "Validation, OpenAPI, SDK",
    icon: Sparkles,
  },
  {
    href: `/docs/${v}/decorators`,
    title: "Référence",
    detail: "Décorateurs et API core",
    icon: Terminal,
  },
];

export default async function HomePage() {
  const heroCode = await renderMarkdown(
    `\`\`\`ts
import {
  Body, Controllable, Post,
} from "raiton/framework"
import { Input, Output, t } from "raiton/contracts"

const CreateUser = t.object({
  email: t.string().email(),
  name: t.string().min(2),
})

@Controllable("/users")
export class UsersController {
  @Post("/")
  @Input(CreateUser)
  @Output(User)
  create(@Body() input: CreateUser) {
    return this.users.create(input)
  }
}
\`\`\``,
    { version: v, basePath: BASE_PATH, nightCode: true },
  );

  const controller = await renderMarkdown(
    `\`\`\`ts
import {
  Body, Controllable, Get, Post,
} from "raiton/framework"
import { Input, Output, t } from "raiton/contracts"

const CreateUser = t.object({
  email: t.string().email(),
  name: t.string().min(2),
})

@Controllable("/users")
export class UsersController {
  @Get("/")
  @Output(t.array(User))
  list() {
    return this.users.all()
  }

  @Post("/")
  @Input(CreateUser)
  @Output(User)
  create(@Body() input: CreateUser) {
    return this.users.create(input)
  }
}
\`\`\``,
    { version: v, basePath: BASE_PATH, nightCode: true },
  );

  const bootstrap = await renderMarkdown(
    `\`\`\`ts
import "reflect-metadata"
import { Application } from "raiton/core"
import { openApiPlugin, RuntimeType } from "raiton/framework"

export default async function main(thread: ThreadInterface) {
  const app = new Application({ port: 5711, prefix: "/api" })

  app.register(openApiPlugin({ route: "/docs" }))

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
\`\`\``,
    { version: v, basePath: BASE_PATH, nightCode: true },
  );

  const docs = listDocs(v);
  const titles = docs.map((doc) => doc.title);
  const wallRows = [
    titles.filter((_, index) => index % 3 === 0),
    titles.filter((_, index) => index % 3 === 1),
    titles.filter((_, index) => index % 3 === 2),
  ];

  return (
    <div>
      <CodeCopy />

      {/* Arrival */}
      <section
        className="relative overflow-hidden border-b border-[var(--border)]"
        data-parallax-root
      >
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 hero-grid opacity-80" aria-hidden />

        <div className="site-container relative grid min-w-0 items-center gap-14 py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-10 lg:py-20">
          <div className="relative z-[2] min-w-0" data-reveal>
            <div className="flex flex-wrap items-center gap-2">
              <span className="version-pill" data-status="latest">
                {LATEST_VERSION.label} · beta
              </span>
              <span className="chip">Bun-first</span>
              <span className="chip">Node.js</span>
              <span className="chip">Deno</span>
              <span className="chip">MIT</span>
            </div>

            <h1 className="display-title mt-6 text-[2.55rem] sm:text-[3.9rem] lg:text-[4.35rem]">
              Le backend TypeScript,
              <br />
              <span className="text-[var(--accent)]">sans cérémonie.</span>
            </h1>

            <p className="lede mt-6 max-w-xl text-[16px] sm:text-[17px]">
              Contrôleurs, injection de dépendances, contrats, MCP et scheduler.
              Un seul framework, trois runtimes, zéro magie inutile.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`/docs/${v}/quickstart`} className="btn btn-primary btn-lg">
                Commencer <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-glass btn-lg">
                <Github className="h-4 w-4" /> Voir sur GitHub
              </a>
            </div>

            <div className="glass mt-8 flex max-w-md items-center gap-2 rounded-xl p-1.5 pl-4">
              <span className="font-mono text-[13px] text-[var(--faint)]">$</span>
              <code className="flex-1 truncate font-mono text-[12.5px] text-[var(--fg-soft)]">
                bun add raiton reflect-metadata
              </code>
              <CopyButton
                value="bun add raiton reflect-metadata"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-[11.5px] font-medium text-[var(--accent-strong)] transition-colors hover:bg-[rgba(169,196,255,.18)]"
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[var(--faint)]">
              <Check className="h-3.5 w-3.5 text-[var(--mint)]" />
              Fonctionne aussi avec npm, pnpm et Deno. TypeScript 5+.
            </p>
          </div>

          <div className="relative mx-auto min-w-0 w-full max-w-full lg:max-w-[560px]">
            <div
              className="pointer-events-none absolute inset-x-[-12%] top-[-18%] bottom-[-10%] rounded-[50%] opacity-90 blur-3xl"
              data-parallax
              style={{ "--depth": 18 } as CSSProperties}
              aria-hidden
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_38%,rgba(63,123,255,.34),transparent_62%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_72%,rgba(123,77,255,.25),transparent_60%)]" />
            </div>

            <div data-parallax className="min-w-0" style={{ "--depth": 7 } as CSSProperties}>
              <div className="hero-window glass-window relative max-w-full overflow-hidden rounded-[20px]">
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                  <span className="flex gap-1.5">
                    <span className="block h-2 w-2 rounded-full bg-[#ff5f57]" />
                    <span className="block h-2 w-2 rounded-full bg-[#febc2e]" />
                    <span className="block h-2 w-2 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="ml-1 font-mono text-[11px] text-white/55">
                    users.controller.ts
                  </span>
                  <span className="ml-auto rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/45">
                    ts
                  </span>
                </div>
                <div
                  className="code-night text-white/85"
                  dangerouslySetInnerHTML={{ __html: heroCode.html }}
                />
              </div>
            </div>

            <div
              className="pointer-events-none absolute -left-4 -top-14 hidden rounded-xl border border-white/[0.14] bg-[rgba(10,14,26,.92)] px-3 py-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur-md sm:block"
              data-parallax
              style={{ "--depth": 24 } as CSSProperties}
            >
              <p className="font-mono text-[9.5px] text-white/45">POST /api/users</p>
              <p className="text-[11px] font-medium text-white">
                <span className="text-[#7de8a8]">201</span> Created
              </p>
            </div>

            <div
              className="pointer-events-none absolute -bottom-6 -right-3 hidden rounded-xl border border-white/[0.14] bg-[rgba(10,14,26,.86)] px-3 py-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur-md sm:block"
              data-parallax
              style={{ "--depth": 30 } as CSSProperties}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">MCP</p>
              <p className="font-mono text-[10.5px] text-white/85">tools/call → refund</p>
            </div>

            <div
              className="pointer-events-none absolute -bottom-3 left-10 flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-[rgba(10,14,26,.86)] px-3 py-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur-md"
              data-parallax
              style={{ "--depth": 20 } as CSSProperties}
            >
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-[#7de8a8]" />
              <span className="font-mono text-[10px] text-white/70">HMR connected</span>
            </div>
          </div>
        </div>
      </section>

      {/* The signature trace */}
      <section className="site-container relative z-[2] -mt-1 pb-14 pt-8 lg:pb-20 lg:pt-10">
        <div data-reveal>
          <HeroSignal />
        </div>
      </section>

      {/* Proof */}
      <section className="border-y border-[var(--border)] bg-[rgba(255,255,255,.018)]">
        <div className="site-container grid divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {[
            ["1", "contrat · 4 artefacts", "validation, types, OpenAPI, SDK"],
            ["3", "runtimes", "Bun, Node.js et Deno"],
            ["15", "commandes CLI", "du scaffold au diagnostic"],
            ["0", "coût par défaut", "observabilité opt-in"],
          ].map(([value, label, detail], index) => (
            <div
              key={label}
              className={`py-6 lg:px-8 ${index > 0 ? "lg:border-l lg:border-[var(--border)]" : ""}`}
              data-reveal
              style={{ "--d": index } as CSSProperties}
            >
              <p className="text-[30px] font-bold tracking-[-0.045em] text-[var(--fg)]">{value}</p>
              <p className="mt-0.5 text-[12.5px] font-medium text-[var(--fg-soft)]">{label}</p>
              <p className="mt-0.5 text-[11.5px] text-[var(--faint)]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pieces */}
      <section className="site-container py-16 lg:py-24">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Pourquoi Raiton</p>
          <h2 className="mt-3 text-balance text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.6rem]">
            Tout ce qu’une API attend. Rien de plus.
          </h2>
          <p className="lede mt-4 text-[14.5px]">
            Raiton assemble les briques indispensables d’un backend TypeScript
            derrière une API cohérente, typée et documentée. Vous gardez le contrôle
            sur chaque couche.
          </p>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`spotlight glass group relative flex flex-col rounded-2xl p-5 transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] ${
                  feature.wide ? "lg:col-span-2" : ""
                }`}
                data-spotlight
                data-reveal
                style={{ "--d": index % 3 } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.015em] text-[var(--fg)]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 flex-1 text-[12.8px] leading-relaxed text-[var(--muted)]">
                  {feature.description}
                </p>
                {feature.pills && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {feature.pills.map((runtime) => (
                      <span
                        key={runtime}
                        className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.04)] px-2.5 py-1 font-mono text-[10px] text-[var(--fg-soft)]"
                      >
                        {runtime}
                      </span>
                    ))}
                  </div>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--accent-strong)] opacity-70 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Lire la documentation <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* The code */}
      <section className="border-y border-[var(--border)] bg-[rgba(255,255,255,.018)]">
        <div className="site-container py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5" data-reveal>
            <div className="max-w-2xl">
              <h2 className="text-balance text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.6rem]">
                Déclaratif, typé, sans surprise.
              </h2>
              <p className="lede mt-4 text-[14.5px]">
                Un contrôleur se lit comme la route qu’il décrit. Le contrat
                alimente la validation et la documentation sans duplication.
              </p>
            </div>
            <Link href={`/docs/${v}/tutorial`} className="btn btn-glass">
              Construire une API complète <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {[
              { file: "controllers/users.controller.ts", html: controller.html },
              { file: "main.ts", html: bootstrap.html },
            ].map((snippet, index) => (
              <div
                key={snippet.file}
                className="glass-window overflow-hidden rounded-2xl"
                data-reveal
                style={{ "--d": index } as CSSProperties}
              >
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                  <span className="flex gap-1.5">
                    <span className="block h-2 w-2 rounded-full bg-[#ff5f57]/80" />
                    <span className="block h-2 w-2 rounded-full bg-[#febc2e]/80" />
                    <span className="block h-2 w-2 rounded-full bg-[#28c840]/80" />
                  </span>
                  <span className="ml-1 truncate font-mono text-[11px] text-white/55">
                    {snippet.file}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">
                    TypeScript
                  </span>
                </div>
                <div className="relative">
                  <div
                    className="code-night max-h-[390px] overflow-y-auto text-white/85"
                    dangerouslySetInnerHTML={{ __html: snippet.html }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#080b13] to-transparent" />
                </div>
              </div>
            ))}
          </div>

          <div
            className="glass mt-5 flex flex-wrap items-center gap-2 rounded-xl px-4 py-3"
            data-reveal
          >
            <Terminal className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-[12px] text-[var(--muted)]">Puis, en local :</span>
            <code className="font-mono text-[12px] text-[var(--fg)]">bun raiton dev</code>
            <span className="text-[11.5px] text-[var(--faint)]">
              HMR sur les contrôleurs, services, sockets, MCP et jobs.
            </span>
          </div>
        </div>
      </section>

      {/* The path */}
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
          <div data-reveal>
            <p className="eyebrow">Le cycle complet</p>
            <h2 className="mt-3 text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] sm:text-[2.4rem]">
              Du premier fichier au premier déploiement.
            </h2>
            <p className="lede mt-4 text-[14.5px]">
              Le CLI couvre l’onboarding, la génération de code, le diagnostic,
              les contrats et la génération de client. Les commandes machine
              renvoient un JSON stable, les erreurs un code de sortie prévisible.
            </p>
            <Link
              href={`/docs/${v}/cli`}
              className="link-underline mt-5 inline-flex items-center gap-1 text-[13px]"
            >
              Explorer le CLI <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-3">
            <div
              className="pointer-events-none absolute left-0 right-0 top-[42px] hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent sm:block"
              aria-hidden
            />
            {LIFECYCLE.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="glass relative flex flex-col rounded-2xl p-5"
                  data-reveal
                  style={{ "--d": index } as CSSProperties}
                >
                  <span className="relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--panel-solid)] text-[var(--accent-strong)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-1 flex-1 text-[12px] leading-relaxed text-[var(--muted)]">
                    {item.description}
                  </p>
                  <code className="mt-4 block overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--code-bg)] px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-[var(--fg-soft)]">
                    {item.code}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Where to go */}
      <section className="border-y border-[var(--border)] bg-[rgba(255,255,255,.018)]">
        <div className="site-container py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <p className="eyebrow">Documentation</p>
              <h2 className="mt-3 text-[2rem] font-bold tracking-[-0.04em]">
                Par où commencer&nbsp;?
              </h2>
            </div>
            <Link href="/docs" className="btn btn-glass">
              Toute la documentation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {START.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="spotlight glass group rounded-xl p-4 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))]"
                  data-spotlight
                  data-reveal
                  style={{ "--d": index } as CSSProperties}
                >
                  <Icon className="h-4 w-4 text-[var(--accent-strong)]" />
                  <p className="mt-3 text-[13.5px] font-medium group-hover:text-[var(--accent-strong)]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">{item.detail}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-10" data-reveal>
            <div className="docs-wall" aria-hidden>
              <div className="docs-wall__plane">
                {wallRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="docs-wall__row"
                    style={
                      {
                        "--dur": `${74 + rowIndex * 9}s`,
                        "--dir": rowIndex % 2 === 1 ? "reverse" : "normal",
                      } as CSSProperties
                    }
                  >
                    {[...row, ...row].map((title, index) => (
                      <span key={`${title}-${index}`} className="docs-wall__item">
                        {title}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
              {docs.length} pages · {LATEST_VERSION.label} · une seule source
            </p>
          </div>
        </div>
      </section>

      {/* The release and the door */}
      <section className="site-container py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="glass rounded-2xl p-6 sm:p-8" data-reveal>
            <div className="flex flex-wrap items-center gap-2">
              <span className="version-pill" data-status="latest">
                {LATEST_VERSION.label} · latest
              </span>
              <span className="chip font-mono">{LATEST_VERSION.tag}</span>
              <span className="chip">{LATEST_VERSION.released}</span>
            </div>
            <h2 className="mt-4 text-[1.6rem] font-bold tracking-[-0.035em]">
              {LATEST_VERSION.headline}
            </h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[var(--muted)]">
              {LATEST_VERSION.summary}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {LATEST_VERSION.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--fg-soft)]"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--mint)]" />
                  {highlight}
                </li>
              ))}
            </ul>
            <Link
              href={`/docs/${v}/releases`}
              className="mt-6 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--accent-strong)]"
            >
              Lire les notes de version <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,#141a2a,#0b0e18)] p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_60px_120px_-50px_rgba(0,0,0,.95)]">
            <div className="orb absolute -right-10 -top-14 h-40 w-40 opacity-80 sm:-right-14 sm:-top-16 sm:h-52 sm:w-52" aria-hidden />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[rgba(123,77,255,.22)] blur-3xl" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_88%_0%,rgba(11,14,24,.6),transparent_58%)]"
              aria-hidden
            />
            <div className="relative">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c3d6ff]">
                Prêt à construire ?
              </p>
              <h2 className="mt-3 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.035em]">
                Votre première API tourne avant la pause café.
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-white/65">
                Un projet complet, un serveur qui répond, des tests qui passent.
                Ensuite, vous décidez de la base de données.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href={`/docs/${v}/quickstart`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#c7d8ff,#a9c4ff)] px-4 text-[12.5px] font-semibold text-[#08101f] shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_8px_24px_-10px_rgba(169,196,255,.65)] transition-transform hover:-translate-y-0.5"
                >
                  Démarrer <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 text-[12.5px] font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-white/[0.12]"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </div>
              <p className="mt-6 font-mono text-[10.5px] text-white/40">
                bun raiton new my-api --yes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
