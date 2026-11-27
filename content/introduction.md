---
title: "Introduction"
description: "Raiton est un framework backend TypeScript modulaire pour construire des API et des microservices sur Bun, Node.js et Deno."
section: demarrage
order: 1
since: "6.0"
---

Raiton est un framework backend TypeScript conçu pour construire des API et des
microservices sans assembler une dizaine de bibliothèques. Il fournit un serveur
HTTP, un routeur, un conteneur d'injection de dépendances, des décorateurs, des
plugins, des contrats schema-first, un scheduler, un serveur MCP et une CLI.

Le framework est **Bun-first** : il utilise `Bun.serve` nativement et tire parti
de l'exécution TypeScript directe, du HMR et des artifacts. Les mêmes
applications tournent sur **Node.js** et **Deno** via des adaptateurs dédiés.

:::note
Raiton est actuellement publié en **beta** (`6.9.0-beta.26`). L'API publique est
stable, mais des détails peuvent encore évoluer entre deux versions mineures.
Consultez la [politique de versions](/docs/versioning) avant une mise en production.
:::

## Le point de départ

Une application Raiton repose sur trois éléments :

- `raiton.config.ts` — optionnel, il décrit le projet : racine des sources,
  version, port, préfixe et options globales ;
- `source/main.ts` — le bootstrapper qui crée l'`Application` et démarre le
  thread ;
- `source/controllers/`, `source/services/`, `source/repositories/` et
  `source/modules/` — la logique applicative, organisée par domaine.

Le reste de l'organisation est libre. La CLI génère cette structure pour vous
avec [`raiton new`](/docs/cli-new) ; voir le [démarrage rapide](/docs/quickstart).

## Les principes

- **Explicite plutôt que magique.** Les routes, les dépendances et les contrats
  sont déclarés dans le code. Le framework ne scanne pas votre application pour
  deviner des conventions invisibles.
- **Une seule source de vérité.** Un contrat TypeBox alimente la validation
  runtime, les types TypeScript, OpenAPI et le client généré.
- **Multi-runtime.** Le même contrôleur fonctionne sur Bun, Node.js et Deno.
- **Tout est remplaçable.** Le routeur, le conteneur, les backends de file et les
  plugins sont accessibles et extensibles.
- **La production n'est pas une option.** Sécurité, health checks, observabilité
  et arrêt gracieux sont fournis, mais restent opt-in.

## Ce que Raiton fournit

| Domaine | Briques |
|---|---|
| HTTP | `Application`, `Router`, décorateurs `@Get`, `@Post`, … |
| Architecture | `@Injectable`, `@Inject`, scopes et cycle de vie |
| Contrats | `raiton/contracts`, `@Input`, `@Output`, validation stable |
| Documentation | OpenAPI, interface Redoc, client TypeScript généré |
| IA | Serveur MCP HTTP et stdio, outils, prompts, ressources |
| Asynchrone | Scheduler cron, files mémoire, Redis et RabbitMQ |
| Production | Sécurité HTTP, HTTPS, health checks, métriques, traces |
| Outillage | `new`, `generate`, `inspect`, `doctor`, `why`, `contract` |

## Comment une requête traverse Raiton

```text
Runtime (Bun / Node / Deno)
  └─ Application.handle(req, reply)
       ├─ 1. Création du RequestContext
       ├─ 2. Hooks onRequest
       ├─ 3. Pipeline de middlewares (body parser, sécurité, app.use)
       ├─ 4. Router.match(method, pathname)
       ├─ 5. Contrôleur + paramètres + validation du contrat
       └─ 6. Réponse, hooks onResponse
```

## Les modules du package

Raiton est distribué avec plusieurs points d'entrée :

```ts
import { Application, RaitonThread, Injection } from "raiton/core"
import { Controllable, Get, Injectable, Security } from "raiton/framework"
import { t, Input, Output } from "raiton/contracts"
import type { ThreadInterface, ContextInterface } from "raiton/types"
```

- `raiton/core` — application, routeur, DI, plugins, scheduler, MCP, artifacts.
- `raiton/framework` — décorateurs, runtime, réponses, plugins, utilitaires.
- `raiton/contracts` — schémas TypeBox, `@Input`, `@Output`, erreurs stables.
- `raiton/types` — interfaces publiques pour typer votre code.
- `raiton/manifest` — inventaire versionné du projet.
- `raiton` — le CLI.

## À qui s'adresse Raiton

Raiton convient si vous voulez :

- une API TypeScript **fortement typée** sans la lourdeur d'un framework
  d'entreprise ;
- un **serveur unique** pour HTTP, temps réel et outils IA ;
- des **contrats** qui ne divergent jamais entre le code et la documentation ;
- une **CLI** qui diagnostique réellement le projet au lieu de générer du code
  puis disparaître.

Si vous cherchez un framework frontend, Raiton n'est pas fait pour vous. Si vous
cherchez un runtime complet avec ORM, messagerie et système de templates, il
faudra assembler ces briques vous-même.

## Prochaines étapes

- [Installer Raiton](/docs/installation)
- [Créer votre première API](/docs/quickstart)
- [Comprendre l'architecture](/docs/project-structure)
