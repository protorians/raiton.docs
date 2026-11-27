---
title: "Structure du projet"
description: "Organiser une application Raiton par domaine, nommer les artifacts et garder un bootstrapper lisible."
section: demarrage
order: 4
since: "6.0"
---

Raiton ne vous impose pas une architecture. Il impose seulement deux conventions
utiles au scanner :

1. un bootstrapper `source/main.ts` (ou le fichier défini par `rootDir`) ;
2. des **artifacts** identifiables par leur suffixe (`*.controller.ts`,
   `*.service.ts`, …).

La séparation attendue reste simple :

- `raiton.config.ts` décrit le projet ;
- `source/main.ts` crée et démarre le serveur ;
- `source/modules/`, `source/controllers/`, `source/services/` et
  `source/repositories/` contiennent la logique applicative.

Le reste doit rester lisible par votre équipe.

## Structure recommandée

```text
my-api/
├── raiton.config.ts
├── package.json
├── tsconfig.json
└── source/
    ├── main.ts
    ├── controllers/
    │   └── tasks.controller.ts
    ├── services/
    │   └── tasks.service.ts
    ├── repositories/
    │   └── tasks.repository.ts
    ├── dtos/
    │   └── create-task.dto.ts
    ├── middleware/
    │   └── auth.middleware.ts
    ├── plugins/
    │   └── telemetry.plugin.ts
    ├── schedulers/
    │   └── cleanup.scheduler.ts
    ├── mcp/
    │   └── billing.mcp.ts
    └── sockets/
        └── chat.socket.ts
```

## Les couches

| Couche | Rôle | Ne doit pas |
|---|---|---|
| Contrôleur | Lire la requête, appeler un service, renvoyer une réponse | Accéder directement à la base |
| Service | Appliquer les règles métier | Connaître HTTP |
| Dépôt | Parler à la base ou à une API externe | Prendre des décisions métier |
| DTO / contrat | Décrire la forme des entrées | Contenir de la logique |
| Middleware | Traiter une règle transverse | Devenir un mini-service |
| Plugin | Enregistrer des routes, hooks et middlewares | Dépendre d'un contrôleur précis |

## Les artifacts

Le scanner de Raiton reconnaît les fichiers par leur type. Les suffixes
principaux :

| Suffixe | Type | Compilé au démarrage |
|---|---|---|
| `*.controller.ts` | Contrôleur HTTP | Oui |
| `*.socket.ts` | Contrôleur temps réel | Oui |
| `*.mcp.ts` | Serveur MCP | Oui |
| `*.scheduler.ts`, `*.task.ts`, `*.cron.ts`, `*.job.ts` | Jobs planifiés | Oui |
| `*.service.ts` | Service injectable | Via DI |
| `*.repository.ts` | Dépôt | Via DI |
| `*.use-case.ts` | Cas d'usage métier | Via DI |
| `*.dto.ts` | DTO d'entrée | Via DI / import |
| `*.entity.ts`, `*.model.ts` | Entités et modèles | Via DI / import |
| `*.middleware.ts` | Middleware | Import manuel |
| `*.command.ts` | Commande CLI projet | Au chargement du CLI |

Vous pouvez enregistrer des types supplémentaires :

```ts
import { Artifacts } from "raiton/framework"

Artifacts.registerMany("command", "event", "listener")
```

## Organiser par domaine

Quand l'application grossit, regroupez par domaine plutôt que par type :

```text
source/
└── modules/
    ├── users/
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── users.repository.ts
    │   └── users.contract.ts
    ├── billing/
    │   ├── billing.controller.ts
    │   ├── billing.service.ts
    │   ├── billing.mcp.ts
    │   └── billing.scheduler.ts
    └── shared/
        ├── database.service.ts
        └── auth.middleware.ts
```

Le scanner est récursif : l'emplacement des fichiers n'a pas d'importance, seul
le suffixe compte. Une organisation par domaine réduit les allers-retours entre
dossiers.

## Monolithe modulaire : quand un module grossit

Sur une API de production, un module plat finit par mélanger la règle métier, la
persistance et HTTP. Découpez alors chaque module en quatre couches :

```text
source/modules/identity/
├── domain/                 # entités, ports, enums — aucun import Raiton
│   ├── entities/
│   ├── repositories/       # interfaces
│   └── enums/
├── application/            # cas d'usage, DTO, services applicatifs
│   ├── use-cases/
│   ├── dtos/
│   └── services/
├── infrastructure/         # adaptateurs concrets
│   ├── persistence/        # Prisma, SQL, fichiers
│   ├── gateways/           # HTTP, e-mail, stockage
│   ├── security/
│   └── schedulers/
└── presentation/           # frontière HTTP
    ├── controllers/
    ├── vm/                 # ViewModels de sortie
    └── middlewares/
```

La règle de dépendance prime sur le nom des dossiers :

| Couche | Peut dépendre de | Ne doit pas dépendre de |
|---|---|---|
| `domain` | TypeScript et types du domaine | Raiton, Prisma, HTTP |
| `application` | `domain`, ports, services injectables | `Request`, `Reply`, contrôleurs |
| `infrastructure` | `domain`, SDK externes | `presentation` |
| `presentation` | `application`, types du domaine | implémentations concrètes |

Un cas d'usage ne reçoit pas `req` : il reçoit des valeurs et lève une erreur
métier. Le contrôleur traduit l'erreur en statut HTTP. Cette frontière rend le
métier testable sans serveur et permet de changer de transport sans réécrire les
règles.

### Le composition root

Le scanner monte les contrôleurs, mais il n'évalue que les fichiers importés.
Une implémentation `@Injectable()` jamais référencée n'est donc pas enregistrée
dans le conteneur, et la résolution échoue. Centralisez les imports concrets
dans un **composition root** importé au tout début de `main.ts` :

```ts
// source/shared/infrastructure/di/composition-root.ts
import "@/modules/identity/infrastructure/persistence/prisma-user.repository"
import "@/modules/identity/application/session-refresh-token.service"
import "@/modules/organization/infrastructure/persistence/prisma-organization.repository"
import "@/shared/infrastructure/database/prisma.service"
```

```ts
// source/main.ts
import "reflect-metadata"
import "@/shared/infrastructure/di/composition-root"
import { Application } from "raiton/core/application"
```

Le composition root ne contient que des imports. Il garantit que les
dépendances des contrôleurs sont connues avant la compilation des routes.

:::tip
Pour une API réelle, cette organisation est détaillée pas à pas dans
[Architecture d'une API de production](/docs/architecture-production).
:::

## Le bootstrapper reste mince

`source/main.ts` doit décrire le serveur, pas le métier :

```ts
import "reflect-metadata"
import { Application, RaitonConfig } from "raiton/core"
import { Security, RuntimeType } from "raiton/framework"
import type { ThreadInterface } from "raiton/types"

export default async (thread: ThreadInterface) => {
  const project = RaitonConfig.toObject()
  const app = new Application({
    port: project.port ?? Number(process.env.PORT ?? 5711),
    prefix: project.prefix ?? "/api",
    hostname: project.hostname,
    pathname: project.pathname,
  })

  app.use(Security.cors({ origin: "*" }))

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
```

## Configuration

Placez un fichier `raiton.config.ts` à la racine pour décrire le projet :

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  version: "0.1.0",
  port: 5711,
  hostname: "0.0.0.0",
  protocole: "http",
  pathname: "/",
  prefix: "/api",
  artifacts: {
    types: ["controller", "socket", "service", "scheduler"],
  },
})
```

Le `rootDir` est résolu depuis la racine du projet. Si votre code vit dans
`src/`, changez simplement cette valeur ; le bootstrapper attendu devient
`src/main.ts`. Le template généré relit ces valeurs avec
`RaitonConfig.toObject()` dans `source/main.ts`. Voir
[Configuration](/docs/configuration) pour toutes les options.

## Règles pratiques

- Un contrôleur = une ressource HTTP.
- Un service = un cas d'usage métier.
- Un fichier = une responsabilité.
- Les types partagés vont dans un module `shared` ou `contracts`.
- Les imports de types utilisent `import type` pour éviter les imports runtime
  inutiles avec Bun.

:::tip
`raiton generate resource users` crée le contrôleur, le service, le dépôt, le
DTO et le test dans la structure recommandée. Voir
[`raiton generate`](/docs/cli-generate).
:::

## Voir aussi

- [Application et cycle de vie](/docs/application)
- [Injection de dépendances](/docs/injection)
- [Configuration](/docs/configuration)
