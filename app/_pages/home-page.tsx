import type { Metadata } from "next";
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
import {
  getMessages,
  interpolate,
  localizePath,
  type Locale,
} from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { BASE_PATH, SITE } from "@/lib/site";
import { getLatestVersion } from "@/lib/versions";

const FEATURE_ICONS = {
  runtimes: Zap,
  injection: Boxes,
  contracts: Sparkles,
  mcp: Radio,
  scheduler: Timer,
  observability: ShieldCheck,
} as const;

const LIFECYCLE_ICONS = {
  create: Wand2,
  develop: Terminal,
  ship: Rocket,
} as const;

const START_ICONS = {
  quickstart: Zap,
  application: Boxes,
  contracts: Sparkles,
  decorators: Terminal,
} as const;

export function homeMetadata(locale: Locale): Metadata {
  const home = getMessages(locale).home;
  return {
    title: { absolute: home.metaTitle },
    description: home.metaDescription,
    alternates: {
      canonical: localizePath(locale, "/"),
      languages: {
        fr: "/",
        en: "/en/",
      },
    },
    openGraph: {
      title: home.metaTitle,
      description: home.metaDescription,
      locale: locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      title: home.metaTitle,
      description: home.metaDescription,
    },
  };
}

export async function HomePage({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const home = messages.home;
  const latest = getLatestVersion(locale);
  const v = latest.id;

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
    { version: v, locale, basePath: BASE_PATH, nightCode: true },
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
    { version: v, locale, basePath: BASE_PATH, nightCode: true },
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
    { version: v, locale, basePath: BASE_PATH, nightCode: true },
  );

  const docs = listDocs(v, locale);
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
                {latest.label} · {home.hero.beta}
              </span>
              <span className="chip">Bun-first</span>
              <span className="chip">Node.js</span>
              <span className="chip">Deno</span>
              <span className="chip">MIT</span>
            </div>

            <h1 className="display-title mt-6 text-[2.55rem] sm:text-[3.9rem] lg:text-[4.35rem]">
              {home.hero.titleFirst}
              <br />
              <span className="text-[var(--accent)]">{home.hero.titleSecond}</span>
            </h1>

            <p className="lede mt-6 max-w-xl text-[16px] sm:text-[17px]">
              {home.hero.lede}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={localizePath(locale, `/docs/${v}/quickstart`)}
                className="btn btn-primary btn-lg"
              >
                {home.hero.start} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-glass btn-lg">
                <Github className="h-4 w-4" /> {home.hero.github}
              </a>
            </div>

            <div className="glass mt-8 flex max-w-md items-center gap-2 rounded-xl p-1.5 pl-4">
              <span className="font-mono text-[13px] text-[var(--faint)]">$</span>
              <code className="flex-1 truncate font-mono text-[12.5px] text-[var(--fg-soft)]">
                bun add raiton reflect-metadata
              </code>
              <CopyButton
                value="bun add raiton reflect-metadata"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-[11.5px] font-medium text-[var(--accent-strong)] transition-colors hover:bg-[rgba(241,90,129,.2)]"
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[var(--faint)]">
              <Check className="h-3.5 w-3.5 text-[var(--mint)]" />
              {home.hero.installNote}
            </p>
          </div>

          <div className="relative mx-auto min-w-0 w-full max-w-full lg:max-w-[560px]">
            <div
              className="pointer-events-none absolute inset-x-[-12%] top-[-18%] bottom-[-10%] rounded-[50%] opacity-90 blur-3xl"
              data-parallax
              style={{ "--depth": 18 } as CSSProperties}
              aria-hidden
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_38%,rgba(241,90,129,.32),transparent_62%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_72%,rgba(244,202,164,.24),transparent_60%)]" />
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
              className="pointer-events-none absolute -left-4 -top-14 hidden rounded-xl border border-white/[0.14] bg-[rgba(24,13,17,.92)] px-3 py-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur-md sm:block"
              data-parallax
              style={{ "--depth": 24 } as CSSProperties}
            >
              <p className="font-mono text-[9.5px] text-white/45">POST /api/users</p>
              <p className="text-[11px] font-medium text-white">
                <span className="text-[#86e0a8]">201</span> Created
              </p>
            </div>

            <div
              className="pointer-events-none absolute -bottom-6 -right-3 hidden rounded-xl border border-white/[0.14] bg-[rgba(24,13,17,.86)] px-3 py-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur-md sm:block"
              data-parallax
              style={{ "--depth": 30 } as CSSProperties}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">MCP</p>
              <p className="font-mono text-[10.5px] text-white/85">tools/call → refund</p>
            </div>

            <div
              className="pointer-events-none absolute -bottom-3 left-10 flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-[rgba(24,13,17,.86)] px-3 py-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur-md"
              data-parallax
              style={{ "--depth": 20 } as CSSProperties}
            >
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-[#86e0a8]" />
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
      <section className="border-y border-[var(--border)] bg-[rgba(255,235,240,.022)]">
        <div className="site-container grid divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {home.proof.map((item, index) => (
            <div
              key={item.label}
              className={`py-6 lg:px-8 ${index > 0 ? "lg:border-l lg:border-[var(--border)]" : ""}`}
              data-reveal
              style={{ "--d": index } as CSSProperties}
            >
              <p className="text-[30px] font-bold tracking-[-0.045em] text-[var(--fg)]">{item.value}</p>
              <p className="mt-0.5 text-[12.5px] font-medium text-[var(--fg-soft)]">{item.label}</p>
              <p className="mt-0.5 text-[11.5px] text-[var(--faint)]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pieces */}
      <section className="site-container py-16 lg:py-24">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">{home.featuresSection.eyebrow}</p>
          <h2 className="mt-3 text-balance text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.6rem]">
            {home.featuresSection.title}
          </h2>
          <p className="lede mt-4 text-[14.5px]">
            {home.featuresSection.lede}
          </p>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {home.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[feature.key as keyof typeof FEATURE_ICONS] ?? Zap;
            const href = localizePath(locale, `/docs/${v}/${feature.key}`);
            return (
              <Link
                key={feature.title}
                href={href}
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
                    {feature.pills.map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,.04)] px-2.5 py-1 font-mono text-[10px] text-[var(--fg-soft)]"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--accent-strong)] opacity-70 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {home.featuresSection.cta} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* The code */}
      <section className="border-y border-[var(--border)] bg-[rgba(255,235,240,.022)]">
        <div className="site-container py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5" data-reveal>
            <div className="max-w-2xl">
              <h2 className="text-balance text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.6rem]">
                {home.codeSection.title}
              </h2>
              <p className="lede mt-4 text-[14.5px]">
                {home.codeSection.lede}
              </p>
            </div>
            <Link href={localizePath(locale, `/docs/${v}/tutorial`)} className="btn btn-glass">
              {home.codeSection.cta} <ArrowRight className="h-4 w-4" />
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
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0609] to-transparent" />
                </div>
              </div>
            ))}
          </div>

          <div
            className="glass mt-5 flex flex-wrap items-center gap-2 rounded-xl px-4 py-3"
            data-reveal
          >
            <Terminal className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-[12px] text-[var(--muted)]">{home.codeSection.local}</span>
            <code className="font-mono text-[12px] text-[var(--fg)]">bun raiton dev</code>
            <span className="text-[11.5px] text-[var(--faint)]">
              {home.codeSection.hmr}
            </span>
          </div>
        </div>
      </section>

      {/* The path */}
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
          <div data-reveal>
            <p className="eyebrow">{home.lifecycle.eyebrow}</p>
            <h2 className="mt-3 text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] sm:text-[2.4rem]">
              {home.lifecycle.title}
            </h2>
            <p className="lede mt-4 text-[14.5px]">
              {home.lifecycle.lede}
            </p>
            <Link
              href={localizePath(locale, `/docs/${v}/cli`)}
              className="link-underline mt-5 inline-flex items-center gap-1 text-[13px]"
            >
              {home.lifecycle.cta} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-3">
            <div
              className="pointer-events-none absolute left-0 right-0 top-[42px] hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent sm:block"
              aria-hidden
            />
            {home.lifecycle.items.map((item, index) => {
              const Icon = LIFECYCLE_ICONS[item.key as keyof typeof LIFECYCLE_ICONS] ?? Zap;
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
      <section className="border-y border-[var(--border)] bg-[rgba(255,235,240,.022)]">
        <div className="site-container py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <p className="eyebrow">{home.startSection.eyebrow}</p>
              <h2 className="mt-3 text-[2rem] font-bold tracking-[-0.04em]">
                {home.startSection.title}
              </h2>
            </div>
            <Link href={localizePath(locale, "/docs")} className="btn btn-glass">
              {home.startSection.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {home.startSection.items.map((item, index) => {
              const Icon = START_ICONS[item.key as keyof typeof START_ICONS] ?? Zap;
              return (
                <Link
                  key={item.slug}
                  href={localizePath(locale, `/docs/${v}/${item.slug}`)}
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
              {interpolate(home.startSection.wallFooter, {
                count: docs.length,
                version: latest.label,
              })}
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
                {latest.label} · {messages.common.latest}
              </span>
              <span className="chip font-mono">{latest.tag}</span>
              <span className="chip">{latest.released}</span>
            </div>
            <h2 className="mt-4 text-[1.6rem] font-bold tracking-[-0.035em]">
              {latest.headline}
            </h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[var(--muted)]">
              {latest.summary}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {latest.highlights.map((highlight) => (
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
              href={localizePath(locale, `/docs/${v}/releases`)}
              className="mt-6 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--accent-strong)]"
            >
              {home.release.readNotes} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,#1c1015,#0b0609)] p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_60px_120px_-50px_rgba(0,0,0,.95)]">
            <div className="orb absolute -right-10 -top-14 h-40 w-40 opacity-80 sm:-right-14 sm:-top-16 sm:h-52 sm:w-52" aria-hidden />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[rgba(241,90,129,.22)] blur-3xl" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_88%_0%,rgba(10,4,7,.6),transparent_58%)]"
              aria-hidden
            />
            <div className="relative">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff9db0]">
                {home.release.readyEyebrow}
              </p>
              <h2 className="mt-3 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.035em]">
                {home.release.readyTitle}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-white/65">
                {home.release.readyBody}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href={localizePath(locale, `/docs/${v}/quickstart`)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#ff8fa8,#f15a81)] px-4 text-[12.5px] font-semibold text-[#2c0e17] shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_8px_24px_-10px_rgba(241,90,129,.6)] transition-transform hover:-translate-y-0.5"
                >
                  {home.release.start} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 text-[12.5px] font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-white/[0.12]"
                >
                  <Github className="h-3.5 w-3.5" /> {messages.common.github}
                </a>
              </div>
              <p className="mt-6 font-mono text-[10.5px] text-white/40">
                {home.release.command}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
