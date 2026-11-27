---
title: "Plugins"
description: "Étendre Raiton avec des plugins, comprendre PluginScope, les scopes enfants et la différence entre register et use."
section: concepts
order: 15
since: "6.0"
---

Un plugin regroupe des routes, des middlewares et des hooks réutilisables. Il
reçoit un `PluginScope` qui donne accès au routeur, au pipeline de middlewares
et aux hooks de l'application.

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

`setup` doit accepter **exactement un paramètre**. C'est ce qui distingue un
plugin d'un middleware aux yeux de `scope.use()`.

## PluginScope

| Membre | Rôle |
|---|---|
| `scope.router` | Routeur partagé |
| `scope.middleware` | Pipeline de middlewares |
| `scope.hooks` | Hooks `onRequest`, `onResponse`, … |
| `scope.use(mw)` | Ajouter un middleware ou un plugin |
| `scope.route(method, path, handler, version?)` | Ajouter une route |
| `scope.get/post/put/patch/delete/options/head/trace(...)` | Raccourcis |
| `scope.register(plugin)` | Enregistrer un enfant |
| `scope.addHook(name, fn)` | Ajouter un hook |

```ts
export const health = definePlugin((scope) => {
  scope.get("/health", () => ({ status: "ok", uptime: process.uptime() }))
  scope.addHook("onRequest", async (ctx) => {
    ctx.state.startedAt = Date.now()
  })
}, "health")
```

## Enregistrer un plugin

```ts
app.register(health)
```

`register()` crée un **scope enfant** : le plugin peut ajouter des éléments
sans polluer un éventuel plugin voisin. Les scopes enfants partagent néanmoins
le routeur, le pipeline et les hooks du parent.

```ts
const parent = new PluginScope()
const child = new PluginScope(parent)

parent.router === child.router // true
parent.hooks === child.hooks   // true
```

## `register()` ou `use()` ?

| Appel | Comportement |
|---|---|
| `app.register(plugin)` | Crée un scope enfant et exécute `setup(child)` |
| `app.use(plugin)` | Exécute `setup(scope)` sur le scope courant |
| `app.use(middleware)` | Ajoute le middleware au pipeline |

En pratique :

- `register()` pour un plugin autonome (sécurité, OpenAPI, santé) ;
- `use()` pour un middleware ;
- `use()` avec un plugin quand vous voulez explicitement partager le scope.

## Composer des plugins

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
et `Security.methodGuard` sont des **plugins**. `Security.cors()` retourne un
**middleware**, à enregistrer avec `app.use()`.
:::

## Sous-plugins

```ts
const admin = definePlugin((scope) => {
  scope.get("/admin", () => ({ ok: true }))

  scope.register(definePlugin((child) => {
    child.get("/admin/audit", () => [])
  }))
})
```

Un sous-plugin reçoit un scope enfant mais partage le routeur : ses routes sont
montées au même niveau que celles du parent.

## Hooks

```ts
scope.addHook("onSend", async (ctx) => {
  ctx.reply.header("x-powered-by", "raiton")
})
```

Les hooks sont exécutés dans l'ordre d'ajout. `onResponse` s'exécute après
l'envoi et ne peut plus modifier la réponse.

## Plugins intégrés

| Plugin | Enregistrement |
|---|---|
| Body parser | Automatique via `thread.setup()` |
| Sécurité des en-têtes | Automatique au démarrage (`Security.headers`) |
| CORS | `app.use(Security.cors(options))` |
| Rate limit | `app.register(Security.rateLimit(options))` |
| Body limit | `app.register(Security.bodyLimit(bytes))` |
| CSRF | `app.register(Security.csrf(options))` |
| Method guard | `app.register(Security.methodGuard(methods))` |
| OpenAPI | `app.register(openApiPlugin(options))` |
| MCP | automatique ou `mcpPlugin()` |
| Page de développement | Automatique en dev (`/__dev`) |
| Observabilité | Automatique si `observability.mode` est défini |

## Voir aussi

- [Middleware et guards](/docs/middleware)
- [Sécurité](/docs/security)
- [OpenAPI](/docs/openapi)
