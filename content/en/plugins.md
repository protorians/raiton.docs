---
title: "Plugins"
description: "Extend Raiton with plugins, understand PluginScope, child scopes, and the difference between register and use."
section: concepts
order: 15
since: "6.0"
---

A plugin groups reusable routes, middlewares, and hooks. It receives a
`PluginScope` that provides access to the router, the middleware pipeline, and
the application's hooks.

```ts
import { definePlugin } from "raiton/core"

export const telemetry = definePlugin((scope) => {
  scope.use(async ({ context, next }) => {
    const start = performance.now()
    await next()
    console.log(`${context.req.method} ${context.req.url} ${performance.now() - start}ms`)
  })
}, "telemetry")
```

## Interface

```ts
interface PluginInterface {
  name?: string
  setup(scope: PluginScope): void
}
```

`setup` must accept **exactly one parameter**. This is what distinguishes a
plugin from a middleware in the eyes of `scope.use()`.

## PluginScope

| Member | Role |
|---|---|
| `scope.router` | Shared router |
| `scope.middleware` | Middleware pipeline |
| `scope.hooks` | `onRequest`, `onResponse`, … hooks |
| `scope.use(mw)` | Add a middleware or plugin |
| `scope.route(method, path, handler, version?)` | Add a route |
| `scope.get/post/put/patch/delete/options/head/trace(...)` | Shortcuts |
| `scope.register(plugin)` | Register a child |
| `scope.addHook(name, fn)` | Add a hook |

```ts
export const health = definePlugin((scope) => {
  scope.get("/health", () => ({ status: "ok", uptime: process.uptime() }))
  scope.addHook("onRequest", async (ctx) => {
    ctx.state.startedAt = Date.now()
  })
}, "health")
```

## Registering a plugin

```ts
app.register(health)
```

`register()` creates a **child scope**: the plugin can add elements without
polluting a neighboring plugin. Child scopes nevertheless share the parent's
router, pipeline, and hooks.

```ts
const parent = new PluginScope()
const child = new PluginScope(parent)

parent.router === child.router // true
parent.hooks === child.hooks   // true
```

## `register()` or `use()`?

| Call | Behavior |
|---|---|
| `app.register(plugin)` | Creates a child scope and runs `setup(child)` |
| `app.use(plugin)` | Runs `setup(scope)` on the current scope |
| `app.use(middleware)` | Adds the middleware to the pipeline |

In practice:

- `register()` for a standalone plugin (security, OpenAPI, health);
- `use()` for a middleware;
- `use()` with a plugin when you explicitly want to share the scope.

## Composing plugins

```ts
import { Security, bodyParserPlugin, openApiPlugin } from "raiton/framework"

app.register(Security.rateLimit({ max: 100, windowMs: 60_000 }))
app.use(Security.cors({ origin: "https://app.example.com" }))

app.register(openApiPlugin({
  route: "/docs",
  endpoint: "/docs/json",
  title: "Users API",
  version: "1.0.0",
}))
```

:::note
`Security.headers`, `Security.rateLimit`, `Security.csrf`, `Security.bodyLimit`
and `Security.methodGuard` are **plugins**. `Security.cors()` returns a
**middleware**, to be registered with `app.use()`.
:::

## Sub-plugins

```ts
const admin = definePlugin((scope) => {
  scope.get("/admin", () => ({ ok: true }))

  scope.register(definePlugin((child) => {
    child.get("/admin/audit", () => [])
  }))
})
```

A sub-plugin receives a child scope but shares the router: its routes are
mounted at the same level as the parent's.

## Hooks

```ts
scope.addHook("onSend", async (ctx) => {
  ctx.reply.header("x-powered-by", "raiton")
})
```

Hooks run in the order they were added. `onResponse` runs after the response is
sent and can no longer modify it.

## Built-in plugins

| Plugin | Registration |
|---|---|
| Body parser | Automatic via `thread.setup()` |
| Security headers | Automatic at startup (`Security.headers`) |
| CORS | `app.use(Security.cors(options))` |
| Rate limit | `app.register(Security.rateLimit(options))` |
| Body limit | `app.register(Security.bodyLimit(bytes))` |
| CSRF | `app.register(Security.csrf(options))` |
| Method guard | `app.register(Security.methodGuard(methods))` |
| OpenAPI | `app.register(openApiPlugin(options))` |
| MCP | automatic or `mcpPlugin()` |
| Development page | Automatic in dev (`/__dev`) |
| Observability | Automatic if `observability.mode` is set |

## See also

- [Middleware and guards](/docs/middleware)
- [Security](/docs/security)
- [OpenAPI](/docs/openapi)
