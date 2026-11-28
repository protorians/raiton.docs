---
title: "Cache and ETag"
description: "Speed up responses with the @Cache route cache and conditional ETag validation."
section: fonctionnalites
order: 27
since: "6.7"
---

Raiton provides two complementary mechanisms:

- **ETag** — validation: the client checks its copy and receives `304 Not Modified`.
- **Route cache** — expiration: the handler is not re-executed as long as the
  response is fresh.

## ETag

Wire up the `etag()` middleware:

```ts
import { Application } from "raiton/core"
import { etag } from "raiton/framework"

const app = new Application({ port: 5711 })

app.use(etag({
  weak: false,
  cacheControl: { maxAge: 60, public: true },
}))
```

The middleware computes an ETag for each response, sets the `ETag` header and
returns `304` if the client sends `If-None-Match`.

Options:

```ts
app.use(etag({
  weak: true,
  algorithm: async (body) =>
    crypto.createHash("sha1").update(body).digest("hex"),
  skip: (ctx) => ctx.req.method !== "GET",
}))
```

| Option | Role |
|---|---|
| `weak` | `W/` marker |
| `algorithm` | Custom hash function |
| `headerName` | Header name (default `ETag`) |
| `cacheControl` | `maxAge`, `public`, `private`, `noCache` |
| `skip` | Exclusion predicate |

## Route cache

```ts
import { Cache, Controllable, Get } from "raiton/framework"

@Controllable("/products")
export class ProductController {
  @Get("/featured")
  @Cache({ ttl: 60_000, vary: ["accept-language"] })
  featured() {
    return this.catalogue.featured()
  }
}
```

As long as the entry is fresh, the handler is not executed.

| Option | Default | Role |
|---|---|---|
| `ttl` | `60_000` | Validity duration (ms) |
| `enabled` | `true` | Disable the route |
| `key` | auto | Custom key `(context, route) => string` |
| `vary` | `[]` | Headers that participate in the key |
| `methods` | `GET`, `HEAD` | Cached methods |
| `maxEntries` | `1000` | Size of the in-memory store |

## Global configuration

```ts
import { CacheManager } from "raiton/framework"

CacheManager.configure({
  ttl: 30_000,
  maxEntries: 5_000,
})
```

For a distributed cache, implement `CacheStore` (a synchronous interface) and
provide it:

```ts
import { CacheManager, type CacheStore } from "raiton/framework"

const store: CacheStore = {
  get: (key) => memory.get(key),
  set: (key, entry) => memory.set(key, entry),
  has: (key) => memory.has(key),
  delete: (key) => memory.delete(key),
  clear: () => memory.clear(),
  size: () => memory.size,
}

CacheManager.setStore(store)
```

Because the interface is synchronous, a network backend must maintain a local
cache populated in the background rather than blocking the request.

## Both together

A `@Cache()` reduces the handler's work, and `etag()` lets the client validate
its copy — including responses served from the cache.

## Invalidation

```ts
CacheManager.invalidateRoute("/api/products")
CacheManager.clear()
```

The cache is automatically invalidated for a route when its code changes under
HMR. For business data, trigger invalidation after a write.

## Limitations

- The in-memory cache is local to the process.
- A TTL that is too long serves stale data.
- Personalized responses (user, permissions) must include a `vary` or a suitable
  key.

## See also

- [Security](/docs/security)
- [Observability](/docs/observability)
- [Core reference](/docs/core-api)
