import { DEFAULT_LOCALE, type Locale } from "./i18n";

export type VersionStatus = "latest" | "archived";

export interface DocVersion {
  id: string;
  label: string;
  tag: string;
  status: VersionStatus;
  released: string;
  headline: string;
  summary: string;
  highlights: string[];
}

interface VersionBase {
  id: string;
  label: string;
  tag: string;
  status: VersionStatus;
}

interface VersionCopy {
  released: string;
  headline: string;
  summary: string;
  highlights: string[];
}

const VERSIONS_BASE: VersionBase[] = [
  { id: "6.10", label: "v6.10", tag: "v6.10.0-beta.28", status: "latest" },
  { id: "6.9", label: "v6.9", tag: "v6.9.0-beta.26", status: "archived" },
  { id: "6.8", label: "v6.8", tag: "v6.8.9-beta.25", status: "archived" },
  { id: "6.7", label: "v6.7", tag: "v6.7.0-beta.15", status: "archived" },
  { id: "6.6", label: "v6.6", tag: "v6.6.0-beta.14", status: "archived" },
];

const VERSION_COPY: Record<Locale, Record<string, VersionCopy>> = {
  fr: {
    "6.10": {
      released: "27 novembre 2026",
      headline: "Performance et consolidation",
      summary:
        "Raiton 6.10 consolide les contrats schema-first, le manifeste, MCP stdio, l'observabilité et la CLI, avec un routage, un pipeline HTTP et un démarrage plus rapides.",
      highlights: [
        "Routage, pipeline HTTP et démarrage optimisés",
        "Benchmarks et tests de non-régression",
        "Contrats TypeBox : validation runtime, types, OpenAPI et client généré",
        "Manifeste versionné, JSON Schema publié et cache HMR",
        "MCP stdio, observabilité et CLI de diagnostic",
      ],
    },
    "6.9": {
      released: "27 novembre 2026",
      headline: "Contrats, manifeste et MCP stdio",
      summary:
        "La version la plus complète de Raiton : contrats schema-first, manifeste versionné, transports MCP HTTP et stdio, observabilité et CLI de diagnostic.",
      highlights: [
        "Contrats TypeBox : validation runtime, types, OpenAPI et client généré",
        "Manifeste versionné, JSON Schema publié et cache HMR",
        "MCP stdio, schémas d'outils, scopes et audit",
        "Observabilité opt-in : corrélation, métriques Prometheus, traces OTLP",
        "CLI new, generate, inspect, why, doctor, contract et docs agents",
      ],
    },
    "6.8": {
      released: "26 novembre 2026",
      headline: "Scheduler intégré",
      summary:
        "Le scheduler déclaratif rejoint le framework : cron, intervalles, tâches nommées et files d'attente mémoire, Redis ou RabbitMQ.",
      highlights: [
        "Décorateurs @Scheduler, @Cron, @Every, @Timeout et @Task",
        "Backends de file mémoire, Redis et RabbitMQ",
        "Reprise HMR des jobs et injection de dépendances",
        "Correction du rechargement HMR des middlewares et hooks",
      ],
    },
    "6.7": {
      released: "9 septembre 2026",
      headline: "Cache HTTP et ETag",
      summary:
        "Deux mécanismes de performance HTTP : validation par ETag et cache de routes avec le décorateur @Cache.",
      highlights: [
        "Décorateur @Cache avec TTL, clé et vary",
        "CacheManager et ETag personnalisable",
        "Réponses 304 Not Modified",
      ],
    },
    "6.6": {
      released: "4 septembre 2026",
      headline: "Health checks, CSRF et artefacts DI",
      summary:
        "Une base plus solide pour la production : health checks, protection CSRF et chargement des artefacts par injection de dépendances.",
      highlights: [
        "Endpoint /health par défaut et décorateur @HealthCheck",
        "Protection CSRF double-submit et synchronizer",
        "Chargement DI des artefacts avec cache par timestamp",
      ],
    },
  },
  en: {
    "6.10": {
      released: "November 27, 2026",
      headline: "Performance and consolidation",
      summary:
        "Raiton 6.10 consolidates schema-first contracts, the manifest, MCP stdio, observability and the CLI, with faster routing, HTTP pipeline and startup.",
      highlights: [
        "Optimized routing, HTTP pipeline and startup",
        "Benchmarks and non-regression tests",
        "TypeBox contracts: runtime validation, types, OpenAPI and generated client",
        "Versioned manifest, published JSON Schema and HMR cache",
        "MCP stdio, observability and diagnostic CLI",
      ],
    },
    "6.9": {
      released: "November 27, 2026",
      headline: "Contracts, manifest and MCP stdio",
      summary:
        "The most complete Raiton release yet: schema-first contracts, a versioned manifest, MCP HTTP and stdio transports, observability and a diagnostic CLI.",
      highlights: [
        "TypeBox contracts: runtime validation, types, OpenAPI and generated client",
        "Versioned manifest, published JSON Schema and HMR cache",
        "MCP stdio, tool schemas, scopes and audit",
        "Opt-in observability: correlation, Prometheus metrics, OTLP traces",
        "CLI new, generate, inspect, why, doctor, contract and agent docs",
      ],
    },
    "6.8": {
      released: "November 26, 2026",
      headline: "Built-in scheduler",
      summary:
        "The declarative scheduler joins the framework: cron, intervals, named tasks and in-memory, Redis or RabbitMQ queues.",
      highlights: [
        "@Scheduler, @Cron, @Every, @Timeout and @Task decorators",
        "In-memory, Redis and RabbitMQ queue backends",
        "HMR job recovery and dependency injection",
        "Fixed HMR reload for middleware and hooks",
      ],
    },
    "6.7": {
      released: "September 9, 2026",
      headline: "HTTP cache and ETag",
      summary:
        "Two HTTP performance mechanisms: ETag validation and route caching with the @Cache decorator.",
      highlights: [
        "@Cache decorator with TTL, key and vary",
        "CacheManager and customizable ETag",
        "304 Not Modified responses",
      ],
    },
    "6.6": {
      released: "September 4, 2026",
      headline: "Health checks, CSRF and DI artifacts",
      summary:
        "A stronger production foundation: health checks, CSRF protection and artifact loading through dependency injection.",
      highlights: [
        "Default /health endpoint and @HealthCheck decorator",
        "Double-submit and synchronizer CSRF protection",
        "DI artifact loading with timestamp-based cache",
      ],
    },
  },
};

export function getVersions(locale: Locale = DEFAULT_LOCALE): DocVersion[] {
  const copy = VERSION_COPY[locale] ?? VERSION_COPY[DEFAULT_LOCALE];
  return VERSIONS_BASE.map((version) => ({
    ...version,
    ...copy[version.id],
  }));
}

export function getLatestVersion(locale: Locale = DEFAULT_LOCALE): DocVersion {
  return getVersions(locale)[0];
}

export const SECTION_ORDER = [
  "demarrage",
  "concepts",
  "fonctionnalites",
  "cli",
  "reference",
  "guides",
  "versions",
] as const;

export type SectionId = (typeof SECTION_ORDER)[number];

interface SectionMeta {
  title: string;
  description?: string;
}

const SECTION_META: Record<Locale, Record<SectionId, SectionMeta>> = {
  fr: {
    demarrage: {
      title: "Démarrage",
      description: "Installer, créer et lancer un projet.",
    },
    concepts: {
      title: "Concepts",
      description: "Les briques du framework et leur cycle de vie.",
    },
    fonctionnalites: {
      title: "Fonctionnalités",
      description: "Les capacités prêtes à l'emploi de Raiton.",
    },
    cli: { title: "CLI", description: "Créer, générer, inspecter et livrer." },
    reference: {
      title: "Référence",
      description: "Décorateurs, API, configuration et types.",
    },
    guides: {
      title: "Guides",
      description: "Des parcours complets, du prototype à la production.",
    },
    versions: {
      title: "Versions",
      description: "Notes de version et politique de support.",
    },
  },
  en: {
    demarrage: {
      title: "Getting started",
      description: "Install, create and run a project.",
    },
    concepts: {
      title: "Concepts",
      description: "The framework's building blocks and their lifecycle.",
    },
    fonctionnalites: {
      title: "Features",
      description: "Raiton's ready-to-use capabilities.",
    },
    cli: { title: "CLI", description: "Create, generate, inspect and ship." },
    reference: {
      title: "Reference",
      description: "Decorators, API, configuration and types.",
    },
    guides: {
      title: "Guides",
      description: "End-to-end journeys from prototype to production.",
    },
    versions: {
      title: "Versions",
      description: "Release notes and support policy.",
    },
  },
};

export function getSectionMeta(locale: Locale = DEFAULT_LOCALE): Record<SectionId, SectionMeta> {
  return SECTION_META[locale] ?? SECTION_META[DEFAULT_LOCALE];
}

/** Client-safe section label lookup (no filesystem imports). */
export function getSectionLabel(
  section: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const meta = getSectionMeta(locale);
  return (
    meta[section as SectionId]?.title ??
    section.charAt(0).toUpperCase() + section.slice(1)
  );
}

export function getVersion(
  id: string,
  locale: Locale = DEFAULT_LOCALE,
): DocVersion | undefined {
  return getVersions(locale).find((version) => version.id === id);
}

export function getVersionOrLatest(
  id?: string,
  locale: Locale = DEFAULT_LOCALE,
): DocVersion {
  return (id && getVersion(id, locale)) || getLatestVersion(locale);
}

function toNumber(value: string): number[] {
  return value
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

/** Compare a page's `since` value with a documentation version. */
export function isSince(since: string | undefined, version: string): boolean {
  if (!since) return true;
  const a = toNumber(since);
  const b = toNumber(version);
  const size = Math.max(a.length, b.length);
  for (let i = 0; i < size; i += 1) {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;
    if (left !== right) return left <= right;
  }
  return true;
}

export function isLatest(version: string): boolean {
  return version === VERSIONS_BASE[0].id;
}
