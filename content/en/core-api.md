---
title: "Core API"
description: "Reference for the classes and functions of raiton/core: Application, RaitonThread, Router, Injection, PluginScope and managers."
section: reference
order: 51
since: "6.0"
---

The classes in `raiton/core` form the foundation of the framework. Most are used
indirectly, but they remain accessible for advanced cases.

:::note
`CacheManager` appeared in 6.7, `SchedulerManager` in 6.8. The
`HealthCheckManager` and `SchedulerManager` managers share the same `configure()` API.
:::

## Application

```ts
import { Application } from "raiton/core"

const app = new Application({ port: 5711, prefix: "/api" })
```

| Member | Role |
|---|---|
| `config` | Effective configuration |
| `version` | Project version |
| `hostname` | Computed full URL |
| `setOption(key, value)` | Change an option |
| `setOptions(options)` | Change several options |
| `register(plugin)` | Register a plugin |
| `use(mw)` | Add a middleware |
| `route(method, path, handler, version?)` | Add a route |
| `get/post/put/patch/delete/options/head/trace` | Shortcuts |
| `handle(req, reply)` | Internal entry point |

`Application.container` points to `Injection`.

## RaitonThread

```ts
import { RaitonThread } from "raiton/core"
```

| Member | Role |
|---|---|
| `RaitonThread.current` | Active instance |
| `application` | Associated application |
| `runtime` | Runtime adapter |
| `runtimeServer` | Current server |
| `setup({ application, runtime })` | Prepare the thread |
| `run()` | Scan and start |
| `stop()` | Graceful shutdown |
| `restart()` | Restart the process |
| `sleep(ms)` / `wait(condition)` | Wait utilities |

## Router

```ts
import { Router, RouteMatcher, createHandler } from "raiton/core"

const router = new Router()
router.add("GET", "/users/:id", handler)
const match = router.match("GET", "/users/42")
// { route, parameters: { "0": "42" } }
```

| Method | Role |
|---|---|
| `add(method, path, handler, version?)` | Add a route |
| `match(method, path)` | Find a route |
| `getRoutes()` | All routes |

The `RouteMatcher` gives priority to static segments over parameters.

## Injection

```ts
import { Injection } from "raiton/core"
import { LifetimeEnum } from "@protorians/core"

Injection.registry("users", UsersService, LifetimeEnum.SINGLETON)
Injection.get<UsersService>("users")
```

| Method | Role |
|---|---|
| `registry(name, construct, lifetime?, scope?)` | Register |
| `get(name, scope?)` | Resolve |
| `has(name)` | Check |
| `resolve(construct)` | Resolve a constructor |
| `clear()` | Empty |
| `shutdown()` | `onUnmount()` then empty |
| `getDependents(name)` | Direct dependents |
| `registerArtifactPath(name, path)` | Artifact path |

## PluginScope

```ts
import { PluginScope, definePlugin } from "raiton/core"
```

| Member | Role |
|---|---|
| `router` | Shared router |
| `middleware` | Shared pipeline |
| `hooks` | Shared hooks |
| `use(mw)` | Middleware or plugin |
| `register(plugin)` | Plugin with child scope |
| `route(...)` | Add a route |
| `addHook(name, fn)` | Add a hook |

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

Backends: `MemoryQueueBackend`, `RedisQueueBackend`, `RabbitMqQueueBackend`.

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

Default types: `service`, `provider`, `type`, `interface`, `repository`,
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

## See also

- [Application and lifecycle](/docs/application)
- [Injection](/docs/injection)
- [Plugins](/docs/plugins)
- [Types](/docs/types)
