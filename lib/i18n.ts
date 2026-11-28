export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_STORAGE_KEY = "raiton-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

const APP_BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** usePathname may or may not include the deployment basePath depending on the host. */
function stripBasePath(pathname: string): string {
  if (!APP_BASE_PATH) return pathname;
  if (pathname === APP_BASE_PATH) return "/";
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) {
    return pathname.slice(APP_BASE_PATH.length) || "/";
  }
  return pathname;
}

/** Normalise a browser language tag (`en-GB`, `fr-CA`, …) to a supported locale. */
export function normalizeLocale(value?: string | null): Locale | null {
  if (!value) return null;
  const language = value.toLowerCase().split(/[-_]/)[0];
  return isLocale(language) ? language : null;
}

/** Resolve the locale from a pathname. English lives under `/en`. */
export function getLocaleFromPathname(pathname: string | null | undefined): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  return /^\/en(?:\/|$)/.test(stripBasePath(pathname)) ? "en" : "fr";
}

/** Remove the deployment basePath and the `/en` prefix from a pathname. */
export function stripLocale(pathname: string): string {
  const appPath = stripBasePath(pathname);
  if (appPath === "/en") return "/";
  if (appPath.startsWith("/en/")) return appPath.slice(3) || "/";
  return appPath;
}

/** Prefix an app pathname with the locale segment. French is unprefixed. */
export function localizePath(locale: Locale, pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const unprefixed = stripLocale(clean);
  if (locale === DEFAULT_LOCALE) return unprefixed;
  return unprefixed === "/" ? "/en/" : `/en${unprefixed}`;
}

/** Build the equivalent pathname in another locale. */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localizePath(target, stripLocale(pathname));
}

/** Best supported locale for the given browser language list. */
export function detectLocale(languages?: readonly string[]): Locale {
  const candidates =
    languages && languages.length > 0
      ? languages
      : typeof navigator !== "undefined"
        ? navigator.languages.length > 0
          ? navigator.languages
          : [navigator.language]
        : [];

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }

  return DEFAULT_LOCALE;
}

/** Replace `{key}` placeholders in a message. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const fr = {
  localeName: "Français",
  common: {
    home: "Accueil",
    documentation: "Documentation",
    version: "Version",
    latest: "latest",
    github: "GitHub",
    language: "Langue",
    close: "Fermer",
    copy: "Copier",
    copied: "Copié",
    skipToContent: "Aller au contenu",
    skipIntro: "Passer l'animation d'accueil",
    translationNotice:
      "Cette page n'est pas encore disponible en anglais. Le contenu original en français est affiché ci-dessous.",
    readIn: "Lire en {language}",
  },
  header: {
    homeAria: "Raiton, accueil",
    mainNavAria: "Navigation principale",
    mobileNavAria: "Navigation mobile",
    githubAria: "Raiton sur GitHub",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    changeLanguage: "Changer de langue",
    themeToggle: "Basculer le thème clair/sombre",
    themeTitle: "Thème clair / sombre",
    links: {
      documentation: "Documentation",
      quickstart: "Démarrage",
      reference: "Référence",
      versions: "Versions",
    },
  },
  footer: {
    taglineSuffix: "Optimisé pour Bun, compatible Node.js et Deno.",
    license: "Licence {license}.",
    designedWith: "Conçu avec",
    by: "par",
    columns: {
      documentation: "Documentation",
      reference: "Référence",
      resources: "Ressources",
    },
    links: {
      overview: "Vue d’ensemble",
      quickstart: "Démarrage rapide",
      contracts: "Contrats",
      mcp: "MCP",
      cli: "CLI",
      decorators: "Décorateurs",
      coreApi: "API core",
      configuration: "Configuration",
      types: "Types",
      errors: "Erreurs",
      releases: "Notes {version}",
      versioning: "Politique de versions",
      deployment: "Déploiement",
      testing: "Tests",
      contributing: "Contribuer",
    },
  },
  search: {
    buttonAria: "Rechercher dans la documentation",
    buttonLabel: "Rechercher…",
    dialogAria: "Recherche dans la documentation",
    closeAria: "Fermer la recherche",
    placeholder: "Rechercher dans la documentation {version}…",
    loading: "Chargement de l’index…",
    noResults: "Aucun résultat pour « {query} ».",
    results: "Résultats",
    suggested: "Pages suggérées",
    navigate: "naviguer",
    open: "ouvrir",
  },
  docs: {
    indexDescription:
      "Documentation officielle de Raiton : démarrage, concepts, contrats, MCP, scheduler, CLI et référence API.",
    breadcrumbAria: "Fil d'Ariane",
    since: "Depuis {version}",
    readingTime: "{minutes} min de lecture",
    archivedNotice:
      "Documentation archivée de Raiton {version}. Certaines fonctionnalités récentes peuvent être absentes.",
    currentVersion: "Voir la version actuelle →",
    onThisPage: "Sur cette page",
    edit: "Modifier cette page sur GitHub",
    updatedWith: "Mis à jour avec {version}",
    previous: "Précédent",
    next: "Suivant",
    pageNavAria: "Navigation entre les pages",
    menu: "Menu",
    docsVersion: "Documentation {version}",
    issueTitle: "Une question, un bug ?",
    issueBody:
      "Ouvrez une issue sur GitHub, le framework est développé en public.",
    openIssue: "Ouvrir une issue",
  },
  landing: {
    eyebrow: "Documentation",
    latestSuffix: "latest",
    archiveSuffix: "archive",
    titleBefore: "Construisez avec",
    titleAccent: "Raiton",
    titleEnd: ".",
    descriptionLatest:
      "Des contrôleurs lisibles, une injection de dépendances explicite, des contrats qui alimentent la validation, OpenAPI et le client typé. Tout le nécessaire pour livrer une API TypeScript sans assembler dix bibliothèques.",
    descriptionArchived:
      "Retrouvez les concepts, le CLI, les fonctionnalités et la référence API tels qu'ils existaient dans Raiton {version}. Les pages introduites plus tard ne figurent pas dans cette archive.",
    startCta: "Démarrer en 5 minutes",
    exploreCli: "Explorer le CLI",
    pagesCount: "{count} pages · {version}",
    archiveNotice:
      "Vous consultez la documentation archivée de Raiton {version}. Les nouvelles fonctionnalités peuvent ne pas y figurer.",
    currentDocs: "Lire la documentation actuelle →",
    startHereTitle: "Commencer ici",
    startHereDescription: "Le parcours recommandé pour une première API.",
    startHere: {
      quickstart: "Démarrage rapide",
      application: "Application & cycle de vie",
      contracts: "Contrats schema-first",
      cli: "Le CLI en 5 minutes",
    },
    browseTitle: "Parcourir la documentation",
    viewAll: "Voir les {count} pages",
    whatsNew: "Nouveautés {version}",
    releaseNotes: "Lire les notes de version",
    allVersions: "Toutes les versions",
    policy: "Politique de versions",
    latestWord: "latest",
  },
  home: {
    metaTitle: "Raiton · Le framework backend TypeScript",
    metaDescription:
      "Raiton est un framework backend TypeScript modulaire : injection de dépendances, contrôleurs, contrats schema-first, MCP, scheduler et observabilité. Optimisé pour Bun, compatible Node.js et Deno.",
    hero: {
      beta: "beta",
      titleFirst: "Le backend TypeScript,",
      titleSecond: "sans cérémonie.",
      lede: "Contrôleurs, injection de dépendances, contrats, MCP et scheduler. Un seul framework, trois runtimes, zéro magie inutile.",
      start: "Commencer",
      github: "Voir sur GitHub",
      installNote: "Fonctionne aussi avec npm, pnpm et Deno. TypeScript 5+.",
    },
    proof: [
      {
        value: "1",
        label: "contrat · 4 artefacts",
        detail: "validation, types, OpenAPI, SDK",
      },
      { value: "3", label: "runtimes", detail: "Bun, Node.js et Deno" },
      {
        value: "15",
        label: "commandes CLI",
        detail: "du scaffold au diagnostic",
      },
      {
        value: "0",
        label: "coût par défaut",
        detail: "observabilité opt-in",
      },
    ],
    featuresSection: {
      eyebrow: "Pourquoi Raiton",
      title: "Tout ce qu’une API attend. Rien de plus.",
      lede: "Raiton assemble les briques indispensables d’un backend TypeScript derrière une API cohérente, typée et documentée. Vous gardez le contrôle sur chaque couche.",
      cta: "Lire la documentation",
    },
    features: [
      {
        key: "runtimes",
        title: "Bun-first, trois runtimes",
        description:
          "Bun.serve natif en production, adaptateurs Node.js et Deno complets. Le même contrôleur, le même bootstrap, le même comportement.",
        tag: "Runtime",
        pills: ["Bun", "Node.js", "Deno"],
        wide: true,
      },
      {
        key: "injection",
        title: "Injection explicite",
        description:
          "Singletons, transients, cycles onInit/onMount/onUnmount et détection des dépendances circulaires. Rien d’implicite.",
        tag: "Architecture",
      },
      {
        key: "contracts",
        title: "Contrats schema-first",
        description:
          "Une définition TypeBox alimente la validation runtime, les types TypeScript, OpenAPI et le client généré. Une seule source de vérité.",
        tag: "Contrats",
      },
      {
        key: "mcp",
        title: "MCP HTTP + stdio",
        description:
          "Exposez outils, prompts et ressources aux agents IA, sur le même port que votre API. Schémas, scopes, audit et limitation de débit.",
        tag: "IA",
        pills: ["tools", "prompts", "resources"],
        wide: true,
      },
      {
        key: "scheduler",
        title: "Scheduler et files",
        description:
          "Cron, intervalles, tâches nommées et backends mémoire, Redis ou RabbitMQ. HMR et injection de dépendances inclus.",
        tag: "Jobs",
      },
      {
        key: "observability",
        title: "Observabilité opt-in",
        description:
          "Corrélation, métriques Prometheus, traces OTLP et arrêt gracieux. Désactivée, elle n’ajoute aucun coût sur le chemin chaud.",
        tag: "Production",
        pills: ["Prometheus", "OTLP", "health"],
        wide: true,
      },
    ],
    codeSection: {
      title: "Déclaratif, typé, sans surprise.",
      lede: "Un contrôleur se lit comme la route qu’il décrit. Le contrat alimente la validation et la documentation sans duplication.",
      cta: "Construire une API complète",
      local: "Puis, en local :",
      hmr: "HMR sur les contrôleurs, services, sockets, MCP et jobs.",
    },
    lifecycle: {
      eyebrow: "Le cycle complet",
      title: "Du premier fichier au premier déploiement.",
      lede: "Le CLI couvre l’onboarding, la génération de code, le diagnostic, les contrats et la génération de client. Les commandes machine renvoient un JSON stable, les erreurs un code de sortie prévisible.",
      cta: "Explorer le CLI",
      items: [
        {
          key: "create",
          title: "Créer",
          description:
            "Un projet complet, testé et prêt à démarrer, en une commande.",
          code: "bun raiton new my-api --template api",
        },
        {
          key: "develop",
          title: "Développer",
          description: "HMR sur les contrôleurs, services, sockets, MCP et jobs.",
          code: "bun raiton dev",
        },
        {
          key: "ship",
          title: "Livrer",
          description: "Build, diagnostic, contrat OpenAPI et client typé.",
          code: "bun raiton build && bun raiton start",
        },
      ],
    },
    startSection: {
      eyebrow: "Documentation",
      title: "Par où commencer ?",
      cta: "Toute la documentation",
      items: [
        {
          key: "quickstart",
          slug: "quickstart",
          title: "Démarrage rapide",
          detail: "Serveur en 5 minutes",
        },
        {
          key: "application",
          slug: "application",
          title: "Application & cycle de vie",
          detail: "Application, routes, DI",
        },
        {
          key: "contracts",
          slug: "contracts",
          title: "Contrats",
          detail: "Validation, OpenAPI, SDK",
        },
        {
          key: "decorators",
          slug: "decorators",
          title: "Référence",
          detail: "Décorateurs et API core",
        },
      ],
      wallFooter: "{count} pages · {version} · une seule source",
    },
    release: {
      readNotes: "Lire les notes de version",
      readyEyebrow: "Prêt à construire ?",
      readyTitle: "Votre première API tourne avant la pause café.",
      readyBody:
        "Un projet complet, un serveur qui répond, des tests qui passent. Ensuite, vous décidez de la base de données.",
      start: "Démarrer",
      command: "bun raiton new my-api --yes",
    },
  },
  notFound: {
    code: "Erreur 404",
    title: "Cette page n’existe pas.",
    body: "Le lien est peut-être obsolète, ou la page n’existe pas dans cette version de la documentation.",
    back: "Retour à la documentation",
    home: "Accueil",
  },
  markdown: {
    headingAnchor: "Lien vers cette section",
    callouts: {
      note: "Note",
      tip: "Astuce",
      warning: "Attention",
      danger: "Danger",
      info: "Info",
      important: "Important",
    },
  },
};

export type Messages = typeof fr;

const en: Messages = {
  localeName: "English",
  common: {
    home: "Home",
    documentation: "Documentation",
    version: "Version",
    latest: "latest",
    github: "GitHub",
    language: "Language",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
    skipToContent: "Skip to content",
    skipIntro: "Skip the intro animation",
    translationNotice:
      "This page is not yet available in English. The original French content is shown below.",
    readIn: "Read in {language}",
  },
  header: {
    homeAria: "Raiton, home",
    mainNavAria: "Main navigation",
    mobileNavAria: "Mobile navigation",
    githubAria: "Raiton on GitHub",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    changeLanguage: "Change language",
    themeToggle: "Toggle light/dark theme",
    themeTitle: "Light / dark theme",
    links: {
      documentation: "Documentation",
      quickstart: "Getting started",
      reference: "Reference",
      versions: "Versions",
    },
  },
  footer: {
    taglineSuffix: "Optimized for Bun, compatible with Node.js and Deno.",
    license: "{license} License.",
    designedWith: "Designed with",
    by: "by",
    columns: {
      documentation: "Documentation",
      reference: "Reference",
      resources: "Resources",
    },
    links: {
      overview: "Overview",
      quickstart: "Quick start",
      contracts: "Contracts",
      mcp: "MCP",
      cli: "CLI",
      decorators: "Decorators",
      coreApi: "Core API",
      configuration: "Configuration",
      types: "Types",
      errors: "Errors",
      releases: "Release notes {version}",
      versioning: "Versioning policy",
      deployment: "Deployment",
      testing: "Testing",
      contributing: "Contributing",
    },
  },
  search: {
    buttonAria: "Search the documentation",
    buttonLabel: "Search…",
    dialogAria: "Search the documentation",
    closeAria: "Close search",
    placeholder: "Search the {version} documentation…",
    loading: "Loading the index…",
    noResults: "No results for “{query}”.",
    results: "Results",
    suggested: "Suggested pages",
    navigate: "navigate",
    open: "open",
  },
  docs: {
    indexDescription:
      "Official Raiton documentation: getting started, concepts, contracts, MCP, scheduler, CLI and API reference.",
    breadcrumbAria: "Breadcrumb",
    since: "Since {version}",
    readingTime: "{minutes} min read",
    archivedNotice:
      "Archived documentation for Raiton {version}. Some recent features may be missing.",
    currentVersion: "View the current version →",
    onThisPage: "On this page",
    edit: "Edit this page on GitHub",
    updatedWith: "Updated with {version}",
    previous: "Previous",
    next: "Next",
    pageNavAria: "Page navigation",
    menu: "Menu",
    docsVersion: "Documentation {version}",
    issueTitle: "A question, a bug?",
    issueBody:
      "Open an issue on GitHub. The framework is developed in public.",
    openIssue: "Open an issue",
  },
  landing: {
    eyebrow: "Documentation",
    latestSuffix: "latest",
    archiveSuffix: "archive",
    titleBefore: "Build with",
    titleAccent: "Raiton",
    titleEnd: ".",
    descriptionLatest:
      "Readable controllers, explicit dependency injection, and contracts that power validation, OpenAPI and the typed client. Everything you need to ship a TypeScript API without assembling ten libraries.",
    descriptionArchived:
      "Explore the concepts, CLI, features and API reference as they existed in Raiton {version}. Pages introduced later are not part of this archive.",
    startCta: "Get started in 5 minutes",
    exploreCli: "Explore the CLI",
    pagesCount: "{count} pages · {version}",
    archiveNotice:
      "You are viewing the archived Raiton {version} documentation. New features may not be included.",
    currentDocs: "Read the current documentation →",
    startHereTitle: "Start here",
    startHereDescription: "The recommended path for your first API.",
    startHere: {
      quickstart: "Quick start",
      application: "Application & lifecycle",
      contracts: "Schema-first contracts",
      cli: "The CLI in 5 minutes",
    },
    browseTitle: "Browse the documentation",
    viewAll: "View all {count} pages",
    whatsNew: "What’s new in {version}",
    releaseNotes: "Read the release notes",
    allVersions: "All versions",
    policy: "Versioning policy",
    latestWord: "latest",
  },
  home: {
    metaTitle: "Raiton · The TypeScript backend framework",
    metaDescription:
      "Raiton is a modular TypeScript backend framework: dependency injection, controllers, schema-first contracts, MCP, scheduler and observability. Optimized for Bun, compatible with Node.js and Deno.",
    hero: {
      beta: "beta",
      titleFirst: "The TypeScript backend,",
      titleSecond: "without the ceremony.",
      lede: "Controllers, dependency injection, contracts, MCP and a scheduler. One framework, three runtimes, zero unnecessary magic.",
      start: "Get started",
      github: "View on GitHub",
      installNote: "Also works with npm, pnpm and Deno. TypeScript 5+.",
    },
    proof: [
      {
        value: "1",
        label: "contract · 4 artifacts",
        detail: "validation, types, OpenAPI, SDK",
      },
      { value: "3", label: "runtimes", detail: "Bun, Node.js and Deno" },
      {
        value: "15",
        label: "CLI commands",
        detail: "from scaffolding to diagnostics",
      },
      {
        value: "0",
        label: "default cost",
        detail: "opt-in observability",
      },
    ],
    featuresSection: {
      eyebrow: "Why Raiton",
      title: "Everything an API expects. Nothing more.",
      lede: "Raiton brings the essential building blocks of a TypeScript backend together behind one coherent, typed and documented API. You stay in control of every layer.",
      cta: "Read the documentation",
    },
    features: [
      {
        key: "runtimes",
        title: "Bun-first, three runtimes",
        description:
          "Native Bun.serve in production, complete Node.js and Deno adapters. The same controller, the same bootstrap, the same behaviour.",
        tag: "Runtime",
        pills: ["Bun", "Node.js", "Deno"],
        wide: true,
      },
      {
        key: "injection",
        title: "Explicit injection",
        description:
          "Singletons, transients, onInit/onMount/onUnmount cycles and circular dependency detection. Nothing implicit.",
        tag: "Architecture",
      },
      {
        key: "contracts",
        title: "Schema-first contracts",
        description:
          "A single TypeBox definition powers runtime validation, TypeScript types, OpenAPI and the generated client. One source of truth.",
        tag: "Contracts",
      },
      {
        key: "mcp",
        title: "MCP HTTP + stdio",
        description:
          "Expose tools, prompts and resources to AI agents on the same port as your API. Schemas, scopes, audit and rate limiting.",
        tag: "AI",
        pills: ["tools", "prompts", "resources"],
        wide: true,
      },
      {
        key: "scheduler",
        title: "Scheduler and queues",
        description:
          "Cron, intervals, named tasks and in-memory, Redis or RabbitMQ backends. HMR and dependency injection included.",
        tag: "Jobs",
      },
      {
        key: "observability",
        title: "Opt-in observability",
        description:
          "Correlation, Prometheus metrics, OTLP traces and graceful shutdown. Disabled by default, it adds no cost to the hot path.",
        tag: "Production",
        pills: ["Prometheus", "OTLP", "health"],
        wide: true,
      },
    ],
    codeSection: {
      title: "Declarative, typed, no surprises.",
      lede: "A controller reads like the route it describes. The contract drives validation and documentation without duplication.",
      cta: "Build a complete API",
      local: "Then, locally:",
      hmr: "HMR across controllers, services, sockets, MCP and jobs.",
    },
    lifecycle: {
      eyebrow: "The full cycle",
      title: "From the first file to the first deployment.",
      lede: "The CLI covers onboarding, code generation, diagnostics, contracts and client generation. Machine commands return stable JSON, and errors return predictable exit codes.",
      cta: "Explore the CLI",
      items: [
        {
          key: "create",
          title: "Create",
          description:
            "A complete, tested and ready-to-run project in one command.",
          code: "bun raiton new my-api --template api",
        },
        {
          key: "develop",
          title: "Develop",
          description: "HMR across controllers, services, sockets, MCP and jobs.",
          code: "bun raiton dev",
        },
        {
          key: "ship",
          title: "Ship",
          description: "Build, diagnostics, OpenAPI contract and typed client.",
          code: "bun raiton build && bun raiton start",
        },
      ],
    },
    startSection: {
      eyebrow: "Documentation",
      title: "Where should you start?",
      cta: "All documentation",
      items: [
        {
          key: "quickstart",
          slug: "quickstart",
          title: "Quick start",
          detail: "A server in 5 minutes",
        },
        {
          key: "application",
          slug: "application",
          title: "Application & lifecycle",
          detail: "Application, routes, DI",
        },
        {
          key: "contracts",
          slug: "contracts",
          title: "Contracts",
          detail: "Validation, OpenAPI, SDK",
        },
        {
          key: "decorators",
          slug: "decorators",
          title: "Reference",
          detail: "Decorators and core API",
        },
      ],
      wallFooter: "{count} pages · {version} · a single source",
    },
    release: {
      readNotes: "Read the release notes",
      readyEyebrow: "Ready to build?",
      readyTitle: "Your first API runs before the coffee break.",
      readyBody:
        "A complete project, a server that responds, passing tests. Then you decide on the database.",
      start: "Get started",
      command: "bun raiton new my-api --yes",
    },
  },
  notFound: {
    code: "Error 404",
    title: "This page does not exist.",
    body: "The link may be outdated, or the page may not exist in this version of the documentation.",
    back: "Back to the documentation",
    home: "Home",
  },
  markdown: {
    headingAnchor: "Link to this section",
    callouts: {
      note: "Note",
      tip: "Tip",
      warning: "Warning",
      danger: "Danger",
      info: "Info",
      important: "Important",
    },
  },
};

export const MESSAGES: Record<Locale, Messages> = { fr, en };

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
