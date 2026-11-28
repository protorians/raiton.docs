---
title: "Application and lifecycle"
description: "Understand Application, RaitonThread, server startup, the request flow and graceful shutdown."
section: concepts
order: 10
since: "6.0"
---

A Raiton application is made up of two main objects:

- **`Application`** — the HTTP configuration, the router, the middlewares, the
  plugins and the hooks.
- **`RaitonThread`** — the process lifecycle: artifact scanning, server startup,
  scheduler, signals and shutdown.

## Creating an application

```ts
import { Application } from "raiton/core"

const app = new Application({
  port: 5711,
  hostname: "0.0.0.0",
  prefix: "/api",
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `port` | `number` | `5712` | Listening port |
| `hostname` | `string` | `localhost` | Listening interface |
| `protocole` | `"http" \| "https"` | `http` | Protocol |
| `pathname` | `string` | `/` | Application root path |
| `prefix` | `string` | — | Prefix added to all routes |
| `develop` | `boolean` | `false` | Development mode (stacks) |
| `verbose` | `boolean` | `false` | Verbose logging |
| `workdir` | `string` | `process.cwd()` | Working directory |
| `https` | object | — | TLS certificates and options |

`app.version` comes from `raiton.config.ts`. `app.hostname` returns the full URL
computed from the protocol, the host and the port.

## Changing the configuration

```ts
app.setOption("port", 4000)
app.setOptions({ port: 4000, verbose: true })
```

## Registering plugins and middlewares

```ts
import { Security } from "raiton/framework"

app.register(Security.rateLimit({ max: 100 }))  // plugin
app.use(Security.cors({ origin: "*" }))         // middleware
app.use(async ({ context, next }) => {          // middleware personnalisé
  context.state.startedAt = Date.now()
  await next()
})
```

`register()` accepts a plugin (`setup(scope)`), `use()` accepts a middleware
(`({ context, next })`) or a plugin. See [Plugins](/docs/plugins) and
[Middleware](/docs/middleware).

## Declaring routes manually

```ts
app.get("/ping", () => ({ pong: true }))
app.post("/echo", (ctx) => ctx.req.body)
app.put("/items/:id", (ctx) => ({ id: ctx.params?.id }))
```

Each method (`get`, `post`, `put`, `patch`, `delete`, `options`, `head`,
`trace`) accepts an optional third `version` argument.

## Startup

```ts
export default async function main(thread: ThreadInterface) {
  const app = new Application({ port: 5711, prefix: "/api" })

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
```

What happens:

1. `builder.boot()` imports `source/main.ts` and creates a `RaitonThread`.
2. `thread.setup()` chooses the runtime, registers the body parser and keeps
   the application.
3. `thread.run()` scans the artifacts (`ControllerBuilder.scan`), compiles the
   controllers, sockets, MCP servers and schedulers.
4. The server listens on `port` / `hostname`.
5. The scheduler starts and observability is enabled if it is configured.

## Production bootstrapper

On a real API, `main.ts` also carries global security, the DI composition root
and the startup of background services. Keep it linear: one constant per
subject, then a chain of `use()` / `register()`.

```ts
import "reflect-metadata"
import "@/shared/infrastructure/di/composition-root"
import { env } from "raiton/framework/env"
import { Application, Security, RuntimeType, openApiPlugin } from "raiton/framework"
import type { ThreadInterface } from "raiton/types"
import { ReminderSchedulerService } from "@/modules/crm/infrastructure/schedulers/reminder-scheduler.service"

export default async (thread: ThreadInterface) => {
  const isDevelopment = env("NODE_ENV") === "development"

  const app = new Application({
    port: env<number>("APP_PORT", 5711, "int"),
    prefix: "/api",
  })
    .use(Security.headers)
    .use(Security.cors({ origin: env("CORS_ORIGIN", "")!.split(","), credentials: true }))
    .use(Security.rateLimit({ windowMs: 60_000, max: 300 }))
    .use(Security.bodyLimit(100 * 1024 * 1024))
    .use(openApiPlugin({ title: "Users API", version: "1.0.0", endpoint: "/docs/json" }))

  // Démarrage explicite d'un service de fond (échec non bloquant).
  try {
    await Application.container.resolve(ReminderSchedulerService)
  } catch (error) {
    console.error("Scheduler indisponible", error)
  }

  return await thread.setup({ application: app, runtime: RuntimeType.Bun }).run()
}
```

`Application.container` is identical to `Injection`. `resolve(Class)` resolves a
constructor already registered by `@Injectable()`, which is the natural entry
point for starting a scheduler or an application worker.

:::tip
The details of a production bootstrapper (CORS with credentials, targeted CSRF,
signed webhooks, composition root) are covered in
[Architecture of a production API](/docs/architecture-production).
:::

## Request flow

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

The `RequestContext` travels through the entire chain. Use `context.state` to
share data between middlewares and handlers.

## Shutdown

On `SIGINT` or `SIGTERM`, `thread.stop()`:

1. sets readiness to `false`;
2. refuses new connections;
3. drains in-flight requests until `shutdown.timeoutMs`;
4. calls `onUnmount()` on the injected instances;
5. exits the process.

```ts
await app.handle(request, reply) // usage interne, appelé par le runtime
```

## Accessing the container

```ts
Application.container === Injection // true

const service = Application.container.get<MyService>("MyService")
```

## See also

- [Routing and controllers](/docs/routing)
- [Runtimes](/docs/runtimes)
- [Observability](/docs/observability)
