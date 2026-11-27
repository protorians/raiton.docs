---
title: "API core"
description: "Référence des classes et fonctions de raiton/core : Application, RaitonThread, Router, Injection, PluginScope et managers."
section: reference
order: 51
since: "6.0"
---

Les classes de `raiton/core` forment le socle du framework. La plupart sont
utilisées indirectement, mais elles restent accessibles pour les cas avancés.

:::note
`CacheManager` est apparu en 6.7, `SchedulerManager` en 6.8. Les managers
`HealthCheckManager` et `SchedulerManager` partagent la même API `configure()`.
:::

## Application

```ts
import { Application } from "raiton/core"

const app = new Application({ port: 5711, prefix: "/api" })
```

| Membre | Rôle |
|---|---|
| `config` | Configuration effective |
| `version` | Version du projet |
| `hostname` | URL complète calculée |
| `setOption(key, value)` | Modifier une option |
| `setOptions(options)` | Modifier plusieurs options |
| `register(plugin)` | Enregistrer un plugin |
| `use(mw)` | Ajouter un middleware |
| `route(method, path, handler, version?)` | Ajouter une route |
| `get/post/put/patch/delete/options/head/trace` | Raccourcis |
| `handle(req, reply)` | Point d'entrée interne |

`Application.container` pointe vers `Injection`.

## RaitonThread

```ts
import { RaitonThread } from "raiton/core"
```

| Membre | Rôle |
|---|---|
| `RaitonThread.current` | Instance active |
| `application` | Application associée |
| `runtime` | Adaptateur runtime |
| `runtimeServer` | Serveur en cours |
| `setup({ application, runtime })` | Préparer le thread |
| `run()` | Scanner et démarrer |
| `stop()` | Arrêt gracieux |
| `restart()` | Redémarrer le processus |
| `sleep(ms)` / `wait(condition)` | Utilitaires d'attente |

## Router

```ts
import { Router, RouteMatcher, createHandler } from "raiton/core"

const router = new Router()
router.add("GET", "/users/:id", handler)
const match = router.match("GET", "/users/42")
// { route, parameters: { "0": "42" } }
```

| Méthode | Rôle |
|---|---|
| `add(method, path, handler, version?)` | Ajouter une route |
| `match(method, path)` | Trouver une route |
| `getRoutes()` | Toutes les routes |

Le `RouteMatcher` donne la priorité aux segments statiques sur les paramètres.

## Injection

```ts
import { Injection } from "raiton/core"
import { LifetimeEnum } from "@protorians/core"

Injection.registry("users", UsersService, LifetimeEnum.SINGLETON)
Injection.get<UsersService>("users")
```

| Méthode | Rôle |
|---|---|
| `registry(name, construct, lifetime?, scope?)` | Enregistrer |
| `get(name, scope?)` | Résoudre |
| `has(name)` | Vérifier |
| `resolve(construct)` | Résoudre un constructeur |
| `clear()` | Vider |
| `shutdown()` | `onUnmount()` puis vider |
| `getDependents(name)` | Dépendants directs |
| `registerArtifactPath(name, path)` | Chemin d'artefact |

## PluginScope

```ts
import { PluginScope, definePlugin } from "raiton/core"
```

| Membre | Rôle |
|---|---|
| `router` | Routeur partagé |
| `middleware` | Pipeline partagé |
| `hooks` | Hooks partagés |
| `use(mw)` | Middleware ou plugin |
| `register(plugin)` | Plugin avec scope enfant |
| `route(...)` | Ajouter une route |
| `addHook(name, fn)` | Ajouter un hook |

```ts
export const plugin = definePlugin((scope) => {
  scope.get("/status", () => ({ ok: true }))
  scope.addHook("onResponse", async (ctx) => {})
}, "status")
```

## SchedulerManager

```ts
import { SchedulerManager } from "raiton/core"

const scheduler = SchedulerManager.current

scheduler.dispatch("email:welcome", { to: "a@b.c" })
scheduler.enqueue("email:welcome", { to: "a@b.c" })
scheduler.pause("job")
scheduler.resume("job")
scheduler.cancel("job")
scheduler.getJobs()
```

Backends : `MemoryQueueBackend`, `RedisQueueBackend`, `RabbitMqQueueBackend`.

## CacheManager

```ts
import { CacheManager } from "raiton/framework"

CacheManager.configure({ ttl: 30_000, maxEntries: 5_000 })
CacheManager.invalidateRoute("/api/users")
CacheManager.clear()
```

## HealthCheckManager

```ts
import { HealthCheckManager } from "raiton/framework"

HealthCheckManager.configure({ checks: [] })
HealthCheckManager.registerCustomHandler((ctx) => ({ ok: true }))
```

## Artifacts

```ts
import { Artifacts } from "raiton/framework"

Artifacts.registerMany("command", "event")
Artifacts.is("users.controller.ts") // true
Artifacts.reload(module, filename)
```

Types par défaut : `service`, `provider`, `type`, `interface`, `repository`,
`database`, `util`, `source`, `controller`, `socket`, `middleware`, `hook`,
`event`, `listener`, `validator`, `strategy`, `use-case`, `dto`, `entity`,
`model`, `schema`, `mcp`, `scheduler`.

## Runtime

```ts
import { Runtime, RuntimeType } from "raiton/framework"

const runtime = new Runtime(RuntimeType.Bun)
runtime.isBun // true
runtime.createServer(handler).listen(5711)
```

## Voir aussi

- [Application et cycle de vie](/docs/application)
- [Injection](/docs/injection)
- [Plugins](/docs/plugins)
- [Types](/docs/types)
