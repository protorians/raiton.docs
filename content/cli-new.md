---
title: "raiton new"
description: "Créer un projet Raiton complet avec un template, un runtime et une installation optionnelle."
section: cli
order: 41
since: "6.9"
---

`raiton new` crée un projet prêt à démarrer : structure, configuration,
contrôleur d'exemple, scripts, test et dépendances.

```bash
bunx raiton new my-api --template api --runtime bun --yes
cd my-api
bun raiton dev
```

Dans un projet qui possède déjà `raiton` en dépendance, `bun raiton …` suffit.
Depuis un répertoire vide, utilisez `bunx raiton …` (ou `npx raiton …`).

## Options

| Option | Défaut | Rôle |
|---|---|---|
| `--template <template>` | `api` | `api`, `minimal`, `mcp-agent` |
| `--runtime <runtime>` | détecté | `bun`, `node`, `deno` |
| `--dir <directory>` | `./<name>` | Répertoire cible |
| `--yes` | `false` | Mode non interactif |
| `--offline` | `false` | Ne pas accéder au réseau |
| `--no-install` | `false` | Ne pas installer les dépendances |
| `--force` | `false` | Écraser des fichiers existants |
| `--dry-run` | `false` | Afficher le plan sans écrire |
| `--json` | `false` | Sortie machine |

## Templates

### `api`

Le template complet :

```text
my-api/
├── source/
│   ├── controllers/users.controller.ts
│   ├── services/users.service.ts
│   ├── repositories/users.repository.ts
│   ├── dtos/create-user.dto.ts
│   └── main.ts
├── tests/users.test.ts
├── raiton.config.ts
├── tsconfig.json
└── package.json
```

Il inclut un health check, un contrat d'exemple et un test.

### `minimal`

Un bootstrapper et une route `hello`. Idéal pour comprendre le cycle de vie sans
code superflu.

### `mcp-agent`

Un serveur MCP avec un outil d'exemple, un prompt et une ressource. Le template
est prêt pour `raiton mcp serve`.

## Exemples

```bash
# Projet Bun complet
bun raiton new billing-api --template api --runtime bun --yes

# Projet minimal Node
bun raiton new demo --template minimal --runtime node --yes

# Agent MCP
bun raiton new tools --template mcp-agent --yes

# Vérifier le plan en CI
bun raiton new demo --dry-run --json
```

## Comportement

1. Résout le répertoire cible et vérifie les conflits.
2. Écrit les fichiers du template.
3. Adapte `raiton.config.ts` et les scripts au runtime.
4. Installe les dépendances (`bun`, `npm`, `pnpm` ou `deno` selon le runtime).
5. Affiche les commandes suivantes.

Avec `--no-install`, l'étape 4 est ignorée. Avec `--offline`, aucune requête
réseau n'est effectuée.

## En CI

```bash
bun raiton new fixture --template api --runtime bun --yes --no-install --json
```

La sortie JSON contient le répertoire, les fichiers créés, le runtime et le
template.

## Voir aussi

- [Installation](/docs/installation)
- [Structure du projet](/docs/project-structure)
- [raiton generate](/docs/cli-generate)
