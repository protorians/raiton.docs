---
title: "Inspecter et diagnostiquer"
description: "Utiliser routes, inspect, why, doctor et artifact pour comprendre l'état réel d'un projet Raiton."
section: cli
order: 44
since: "6.9"
---

Ces commandes répondent à une question simple : **qu'est-ce que le framework a
réellement monté ?**

## `routes`

```bash
bun raiton routes
bun raiton routes --json
bun raiton routes --method GET
bun raiton routes --path users
```

Affiche la méthode, le chemin, le contrôleur et le handler de chaque route
montée.

## `inspect`

```bash
bun raiton inspect --json
bun raiton inspect --out manifest.json
bun raiton inspect --schema
bun raiton inspect --config-schema
bun raiton inspect --check
```

| Option | Rôle |
|---|---|
| `--json` | Manifeste sur stdout |
| `--out` | Écrire dans un fichier |
| `--schema` | Schéma JSON du manifeste |
| `--config-schema` | Schéma JSON de la configuration |
| `--check` | Valider le manifeste |
| `--force` | Écraser la sortie |

Le manifeste contient les routes, le graphe d'injection, les artefacts, la
configuration, les variables d'environnement et les serveurs MCP. Voir
[Manifeste](/docs/manifest).

## `why`

```bash
bun raiton why GET /api/users/:id
bun raiton why GET /api/users/:id --json
```

Répond à « pourquoi cette route existe-t-elle ? » :

- fichier et ligne ;
- contrôleur et méthode ;
- décorateur de route ;
- contrat d'entrée/sortie ;
- artefact associé.

C'est la commande à utiliser quand une route apparaît dans OpenAPI mais pas
dans vos tests, ou l'inverse.

## `doctor`

```bash
bun raiton doctor
bun raiton doctor --json
bun raiton doctor --fix
```

Vérifie :

- runtime et version ;
- configuration (champs invalides, `rootDir`, ports) ;
- métadonnées de décorateurs ;
- versions des dépendances ;
- variables d'environnement ;
- ports occupés.

`--fix` applique uniquement des corrections sûres et non destructives.

## `artifact`

```bash
bun raiton artifact --dump
bun raiton artifact --dump --json
```

Liste les artefacts détectés par le scanner (contrôleurs, services, sockets,
MCP, schedulers). Utile pour vérifier qu'un fichier est bien reconnu.

## Codes de sortie

| Code | Signification |
|---|---|
| `0` | Succès |
| `1` | Erreur d'usage |
| `2` | Prérequis manquant |
| `3` | Conflit de fichiers |
| `4` | Diagnostic en échec |

## En CI

```bash
bun raiton inspect --check
bun raiton doctor --json
bun raiton why GET /api/health
```

Ces commandes échouent avec un code non nul en cas de problème, ce qui suffit à
bloquer une pipeline.

## Voir aussi

- [Manifeste](/docs/manifest)
- [CLI OpenAPI](/docs/cli-openapi)
- [Développer](/docs/cli-dev)
