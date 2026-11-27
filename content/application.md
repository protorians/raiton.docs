---
title: "Application et cycle de vie"
description: "Comprendre Application, RaitonThread, le démarrage du serveur, le flux d'une requête et l'arrêt gracieux."
section: concepts
order: 10
since: "6.0"
---

Une application Raiton est composée de deux objets principaux :

- **`Application`** — la configuration HTTP, le routeur, les middlewares, les
  plugins et les hooks.
- **`RaitonThread`** — le cycle de vie du processus : scan des artifacts,
  démarrage du serveur, scheduler, signaux et arrêt.

## Créer une application

```ts
import { Application } from "raiton/core"

const app = new Application({
  port: 5711,
  hostname: "0.0.0.0",
  prefix: "/api",
})
```

| Option | Type | Défaut | Description |
|---|---|---|---|
| `port` | `number` | `5712` | Port d'écoute |
| `hostname` | `string` | `localhost` | Interface d'écoute |
| `protocole` | `"http" \| "https"` | `http` | Protocole |
| `pathname` | `string` | `/` | Chemin racine de l'application |
| `prefix` | `string` | — | Préfixe ajouté à toutes les routes |
| `develop` | `boolean` | `false` | Mode développement (stacks) |
| `verbose` | `boolean` | `false` | Journalisation détaillée |
| `workdir` | `string` | `process.cwd()` | Répertoire de travail |
| `https` | objet | — | Certificats et options TLS |

`app.version` provient de `raiton.config.ts`. `app.hostname` retourne l'URL
complète calculée à partir du protocole, de l'hôte et du port.

## Modifier la configuration

```ts
app.setOption("port", 4000)
app.setOptions({ port: 4000, verbose: true })
```

## Enregistrer des plugins et middlewares

```ts
import { Security } from "raiton/framework"

app.register(Security.rateLimit({ max: 100 }))  // plugin
app.use(Security.cors({ origin: "*" }))         // middleware
app.use(async ({ context, next }) => {          // middleware personnalisé
  context.state.startedAt = Date.now()
  await next()
})
```

`register()` accepte un plugin (`setup(scope)`), `use()` accepte un middleware
(`({ context, next })`) ou un plugin. Voir [Plugins](/docs/plugins) et
[Middleware](/docs/middleware).

## Déclarer des routes manuellement

```ts
app.get("/ping", () => ({ pong: true }))
app.post("/echo", (ctx) => ctx.req.body)
app.put("/items/:id", (ctx) => ({ id: ctx.params?.id }))
```

Chaque méthode (`get`, `post`, `put`, `patch`, `delete`, `options`, `head`,
`trace`) accepte un troisième argument `version` optionnel.

## Le démarrage

```ts
export default async function main(thread: ThreadInterface) {
  const app = new Application({ port: 5711, prefix: "/api" })

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
```

Ce qui se passe :

1. `builder.boot()` importe `source/main.ts` et crée un `RaitonThread`.
2. `thread.setup()` choisit le runtime, enregistre le body parser et conserve
   l'application.
3. `thread.run()` scanne les artifacts (`ControllerBuilder.scan`), compile les
   contrôleurs, sockets, serveurs MCP et schedulers.
4. Le serveur écoute sur `port` / `hostname`.
5. Le scheduler démarre et l'observabilité s'active si elle est configurée.

## Flux d'une requête

```text
Runtime
  └─ Application.handle(req, reply)
       ├─ RequestContext { req, reply, state }
       ├─ hook onRequest
       ├─ preParsing → body parser
       ├─ preHandler → middlewares
       ├─ Router.match(method, pathname)
       │    └─ handler du contrôleur
       │         ├─ arguments (@Param, @Query, @Body…)
       │         ├─ validation @Input
       │         └─ réponse
       ├─ hook onSend
       └─ hook onResponse
```

Le `RequestContext` traverse toute la chaîne. Utilisez `context.state` pour
partager des données entre middlewares et handlers.

## Arrêt

Sur `SIGINT` ou `SIGTERM`, `thread.stop()` :

1. passe la readiness à `false` ;
2. refuse les nouvelles connexions ;
3. draine les requêtes en cours jusqu'à `shutdown.timeoutMs` ;
4. appelle `onUnmount()` sur les instances injectées ;
5. quitte le processus.

```ts
await app.handle(request, reply) // usage interne, appelé par le runtime
```

## Accès au conteneur

```ts
Application.container === Injection // true

const service = Application.container.get<MyService>("MyService")
```

## Voir aussi

- [Routage et contrôleurs](/docs/routing)
- [Runtimes](/docs/runtimes)
- [Observabilité](/docs/observability)
