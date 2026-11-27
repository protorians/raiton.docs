---
title: "Vue d'ensemble du CLI"
description: "Installer et utiliser la CLI Raiton : commandes, conventions de sortie, codes de sortie et commandes de projet."
section: cli
order: 40
since: "6.0"
---

La CLI Raiton couvre l'onboarding, la génération de code, le développement, le
diagnostic, les contrats et les outils IA.

```bash
bun raiton --help
bun raiton --version
```

## Commandes

| Commande | Rôle |
|---|---|
| [`new`](/docs/cli-new) | Créer un projet |
| [`generate`](/docs/cli-generate) | Générer un artefact |
| [`dev`](/docs/cli-dev) | Développer avec HMR |
| [`build`](/docs/cli-dev) | Compiler le projet |
| [`start`](/docs/cli-dev) | Démarrer en production |
| [`routes`](/docs/cli-inspect) | Lister les routes |
| [`inspect`](/docs/cli-inspect) | Émettre le manifeste |
| [`why`](/docs/cli-inspect) | Expliquer une route |
| [`doctor`](/docs/cli-inspect) | Diagnostiquer le projet |
| [`artifact`](/docs/cli-inspect) | Lister les artefacts |
| [`openapi export`](/docs/cli-openapi) | Exporter OpenAPI |
| [`client`](/docs/cli-openapi) | Générer un client typé |
| [`contract check/snapshot`](/docs/cli-openapi) | Vérifier les ruptures |
| [`mcp`](/docs/cli-mcp) | Outils MCP |
| [`docs agents`](/docs/cli-mcp) | Générer `llms.txt`, `AGENTS.md`, … |

:::note
Les commandes `new`, `generate`, `inspect`, `why`, `doctor`, `openapi`, `client`,
`contract`, `mcp` et `docs agents` ont été généralisées en **6.9**. Dans les
versions antérieures, le CLI se concentre sur `dev`, `build`, `start` et
`artifact`.
:::

## Conventions

### Sortie JSON

Toute commande machine accepte `--json` et écrit **un seul document JSON** sur
`stdout`. Les logs et avertissements vont sur `stderr`, ce qui permet de parser
la sortie sans filtrage.

```bash
bun raiton inspect --json | jq '.routes | length'
bun raiton routes --json > routes.json
```

### Codes de sortie

| Code | Signification |
|---|---|
| `0` | Succès |
| `1` | Erreur d'usage |
| `2` | Prérequis manquant |
| `3` | Conflit de fichiers |
| `4` | Échec de diagnostic |

### Erreurs

Les erreurs JSON exposent :

```json
{
  "code": "MISSING_RUNTIME",
  "message": "Bun is required for this command",
  "hint": "Install Bun or use the Node CLI",
  "docsUrl": "https://…",
  "location": { "file": "…", "line": 0 }
}
```

### Mode non interactif

`new` et les générateurs acceptent `--yes`, `--dry-run` et `--force`. En CI,
utilisez toujours `--yes` et vérifiez le plan avec `--dry-run`.

## Runtimes

```bash
# Bun
bun raiton dev
bun raiton build
bun raiton start

# Node.js (CLI précompilée)
node build/bin/index.mjs dev
node build/bin/index.mjs start

# Deno
deno task dev
deno task start
```

## Commandes de projet

Ajoutez vos propres commandes dans `commands/*.command.ts` :

```ts
// commands/seed.command.ts
export default {
  name: "seed",
  description: "Peuple la base de données",
  run: async () => {
    console.log("Seeding…")
  },
}
```

Elles sont détectées automatiquement par `RaitonCommands.harvest()`.

## Déboguer la CLI

```bash
bun raiton doctor --json
bun raiton inspect --check
DEBUG=raiton:* bun raiton dev
```

## Voir aussi

- [Créer un projet](/docs/cli-new)
- [Générer du code](/docs/cli-generate)
- [Inspecter](/docs/cli-inspect)
