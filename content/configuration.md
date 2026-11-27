---
title: "Configuration"
description: "Référence de raiton.config.ts : chargement, validation, options globales, observabilité, validation, shutdown, MCP et page de développement."
section: reference
order: 52
since: "6.0"
---

`raiton.config.ts` décrit le projet. Il est chargé avant l'ouverture du port et
validé champ par champ.

## Ordre de chargement

```text
raiton.config.ts → .mts → .cts → .js → .mjs → .cjs → .json
```

Le premier fichier trouvé est utilisé. Une erreur de syntaxe dans un fichier
JavaScript ou JSON bloque le démarrage ; un échec d'import TypeScript sur Node
passe au format suivant.

## Exemple complet

```ts
export default {
  rootDir: "./source",
  version: "1.0.0",

  port: 5711,
  hostname: "0.0.0.0",
  protocole: "http",
  pathname: "/",
  prefix: "/api",

  develop: false,
  verbose: false,

  artifacts: {
    types: ["controller", "socket", "service", "scheduler"],
  },

  observability: {
    mode: "metrics",
    metricsPath: "/metrics",
    otelEndpoint: "http://localhost:4318",
    requestIdHeader: "x-request-id",
    serviceName: "users-api",
  },

  validation: {
    responses: "auto",
  },

  shutdown: {
    timeoutMs: 10_000,
  },

  devPage: {
    enabled: true,
    path: "/__dev",
  },

  mcp: {
    exposeDestructive: false,
    rateLimitPerMinute: 60,
  },

  docs: {
    dir: "docs",
    lang: "fr",
  },
}
```

## Champs

| Champ | Type | Défaut | Description |
|---|---|---|---|
| `rootDir` | `string` | `"."` | Racine des sources |
| `version` | `string` | `"0.0.1"` | Version exposée par l'application |
| `port` | `number` | `5712` | Port d'écoute |
| `hostname` | `string` | `localhost` | Interface d'écoute |
| `protocole` | `"http" \| "https"` | `http` | Protocole |
| `pathname` | `string` | `/` | Chemin racine |
| `prefix` | `string` | — | Préfixe des routes |
| `develop` | `boolean` | `false` | Mode développement |
| `verbose` | `boolean` | `false` | Logs détaillés |
| `artifacts.types` | `string[]` | liste intégrée | Types d'artefacts |
| `https` | objet | — | Configuration TLS |
| `observability` | objet | `{ mode: "off" }` | Observabilité |
| `validation` | objet | `{ responses: "auto" }` | Validation de sortie |
| `shutdown` | objet | `{ timeoutMs: 10_000 }` | Arrêt gracieux |
| `devPage` | objet | `{ enabled: true, path: "/__dev" }` | Page de dev |
| `mcp` | objet | `{ exposeDestructive: false }` | Sécurité MCP |
| `docs` | objet | — | Génération de documentation |

## Validation

La configuration est validée **avant** l'ouverture du port. Une valeur invalide
produit des erreurs par champ :

```json
{
  "field": "port",
  "message": "port must be an integer between 1 and 65535",
  "expected": "integer(1..65535)",
  "received": "string"
}
```

Le schéma JSON publié est disponible via :

```bash
bun raiton inspect --config-schema
```

## Variables d'environnement

Certaines options sont surchargées par l'environnement :

| Variable | Option |
|---|---|
| `PORT` | Port applicatif (si vous l'utilisez) |
| `RAITON_OBSERVABILITY` | `observability.mode` |
| `RAITON_METRICS_PATH` | `observability.metricsPath` |
| `RAITON_OTEL_ENDPOINT` | `observability.otelEndpoint` |
| `RAITON_REQUEST_ID_HEADER` | `observability.requestIdHeader` |
| `RAITON_SHUTDOWN_TIMEOUT_MS` | `shutdown.timeoutMs` |
| `RAITON_ACCESS_LOG` | Journal d'accès (`1`) |

Voir [Variables d'environnement](/docs/environment).

## defineConfigSync

Pour un typage et une validation à la définition :

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  port: 5711,
})
```

## Erreurs fréquentes

| Erreur | Cause |
|---|---|
| `rootDir must be a non-empty string` | `rootDir: ""` |
| `port must be an integer` | Port en chaîne |
| `protocole must be 'http' or 'https'` | Faute de frappe |
| `observability.mode must be …` | Mode inconnu |
| `devPage.path must be an absolute path` | Chemin sans `/` |

## Voir aussi

- [Installation](/docs/installation)
- [Application](/docs/application)
- [Observabilité](/docs/observability)
