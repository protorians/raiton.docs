---
title: "Manifeste et introspection"
description: "Explorer les routes, le graphe d'injection, les artefacts et la configuration avec le manifeste versionné."
section: fonctionnalites
order: 34
since: "6.9"
---

Raiton produit un **manifeste** versionné qui décrit l'état réel du projet :
routes, artefacts, graphe d'injection, configuration, variables
d'environnement et serveurs MCP.

```bash
bun raiton inspect --json
```

## Structure

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-11-27T10:00:00.000Z",
  "framework": { "name": "raiton", "version": "6.10.0-beta.28" },
  "runtime": "bun",
  "project": {
    "rootDir": "./source",
    "entry": "source/main.ts",
    "configFile": "raiton.config.ts"
  },
  "routes": [
    {
      "method": "GET",
      "path": "/users/:id",
      "controller": "UsersController",
      "handler": "getOne",
      "file": "source/controllers/users.controller.ts",
      "line": 24,
      "input": "object",
      "output": "User"
    }
  ],
  "injection": {
    "UsersController": ["UsersService"],
    "UsersService": ["UsersRepository"]
  },
  "artifacts": ["UsersController", "UsersService"],
  "config": { "port": "5711" },
  "env": ["PORT", "DATABASE_URL"],
  "mcp": []
}
```

Le schéma JSON est publié et validable
(`docs/generated/manifest-schema.json` dans le framework). Le manifeste est mis
en cache et invalidé par le HMR.

## Explorer les routes

```bash
bun raiton routes
bun raiton routes --json
```

## Retrouver l'origine d'une route

```bash
bun raiton why GET /api/users/:id
```

Affiche le fichier, la ligne, le contrôleur, le handler, le décorateur et
l'artefact associé.

## Diagnostic

```bash
bun raiton doctor
bun raiton doctor --json
bun raiton doctor --fix
```

`doctor` vérifie :

- runtime et version ;
- configuration et champs invalides ;
- décorateurs et métadonnées ;
- versions des dépendances ;
- ports occupés ;
- variables d'environnement manquantes.

Les codes de sortie sont stables :

| Code | Signification |
|---|---|
| `0` | Succès |
| `1` | Erreur d'usage |
| `2` | Prérequis manquant |
| `3` | Conflit de fichiers |
| `4` | Échec de diagnostic |

## Page de développement

En mode `dev`, Raiton expose une page de découverte sur `/__dev` :

- routes montées et fichiers sources ;
- graphe d'injection ;
- artefacts détectés ;
- jobs planifiés ;
- événements HMR récents ;
- état de santé.

Le chemin est configurable :

```ts
export default {
  devPage: {
    enabled: true,
    path: "/__dev",
  },
}
```

## Suggestions de routes

En développement, une requête 404 peut suggérer la route la plus proche. Cette
aide est calculée à partir du manifeste et n'est jamais active en production.

## Cas d'usage

- **CI** : vérifier qu'aucune route n'a disparu.
- **Documentation** : générer un inventaire lisible.
- **Débogage** : comprendre pourquoi une route n'est pas montée.
- **IA** : fournir un contexte structuré aux agents (`llms.txt`, manifeste).

## Voir aussi

- [CLI : inspecter et diagnostiquer](/docs/cli-inspect)
- [OpenAPI](/docs/openapi)
- [Client typé](/docs/client)
