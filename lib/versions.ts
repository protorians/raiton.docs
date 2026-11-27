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

export const VERSIONS: DocVersion[] = [
  {
    id: "6.10",
    label: "v6.10",
    tag: "v6.10.0-beta.28",
    status: "latest",
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
  {
    id: "6.9",
    label: "v6.9",
    tag: "v6.9.0-beta.26",
    status: "archived",
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
  {
    id: "6.8",
    label: "v6.8",
    tag: "v6.8.9-beta.25",
    status: "archived",
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
  {
    id: "6.7",
    label: "v6.7",
    tag: "v6.7.0-beta.15",
    status: "archived",
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
  {
    id: "6.6",
    label: "v6.6",
    tag: "v6.6.0-beta.14",
    status: "archived",
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
];

export const LATEST_VERSION = VERSIONS[0];

export const SECTION_ORDER = [
  "demarrage",
  "concepts",
  "fonctionnalites",
  "cli",
  "reference",
  "guides",
  "versions",
] as const;

export const SECTION_META: Record<
  (typeof SECTION_ORDER)[number],
  { title: string; description?: string }
> = {
  demarrage: { title: "Démarrage", description: "Installer, créer et lancer un projet." },
  concepts: { title: "Concepts", description: "Les briques du framework et leur cycle de vie." },
  fonctionnalites: {
    title: "Fonctionnalités",
    description: "Les capacités prêtes à l'emploi de Raiton.",
  },
  cli: { title: "CLI", description: "Créer, générer, inspecter et livrer." },
  reference: { title: "Référence", description: "Décorateurs, API, configuration et types." },
  guides: { title: "Guides", description: "Des parcours complets, du prototype à la production." },
  versions: { title: "Versions", description: "Notes de version et politique de support." },
};

export function getVersion(id: string): DocVersion | undefined {
  return VERSIONS.find((version) => version.id === id);
}

export function getVersionOrLatest(id?: string): DocVersion {
  return (id && getVersion(id)) || LATEST_VERSION;
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
  return version === LATEST_VERSION.id;
}
