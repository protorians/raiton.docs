---
title: "Cache et ETag"
description: "Accélérer les réponses avec le cache de routes @Cache et la validation conditionnelle ETag."
section: fonctionnalites
order: 27
since: "6.7"
---

Raiton fournit deux mécanismes complémentaires :

- **ETag** — validation : le client vérifie sa copie et reçoit `304 Not Modified`.
- **Cache de routes** — expiration : le handler n'est pas ré-exécuté tant que la
  réponse est fraîche.

## ETag

Branchez le middleware `etag()` :

```ts
import { Application } from "raiton/core"
import { etag } from "raiton/framework"

const app = new Application({ port: 5711 })

app.use(etag({
  weak: false,
  cacheControl: { maxAge: 60, public: true },
}))
```

Le middleware calcule un ETag pour chaque réponse, pose l'en-tête `ETag` et
répond `304` si le client envoie `If-None-Match`.

Options :

```ts
app.use(etag({
  weak: true,
  algorithm: async (body) =>
    crypto.createHash("sha1").update(body).digest("hex"),
  skip: (ctx) => ctx.req.method !== "GET",
}))
```

| Option | Rôle |
|---|---|
| `weak` | Marqueur `W/` |
| `algorithm` | Fonction de hachage personnalisée |
| `headerName` | Nom de l'en-tête (défaut `ETag`) |
| `cacheControl` | `maxAge`, `public`, `private`, `noCache` |
| `skip` | Prédicat d'exclusion |

## Cache de routes

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

Tant que l'entrée est fraîche, le handler n'est pas exécuté.

| Option | Défaut | Rôle |
|---|---|---|
| `ttl` | `60_000` | Durée de validité (ms) |
| `enabled` | `true` | Désactiver la route |
| `key` | auto | Clé personnalisée `(context, route) => string` |
| `vary` | `[]` | En-têtes participant à la clé |
| `methods` | `GET`, `HEAD` | Méthodes mises en cache |
| `maxEntries` | `1000` | Taille du store mémoire |

## Configuration globale

```ts
import { CacheManager } from "raiton/framework"

CacheManager.configure({
  ttl: 30_000,
  maxEntries: 5_000,
})
```

Pour un cache distribué, implémentez `CacheStore` (interface synchrone) et
fournissez-le :

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

L'interface étant synchrone, un backend réseau doit maintenir un cache local
alimenté en arrière-plan plutôt que bloquer la requête.

## Les deux ensemble

Un `@Cache()` réduit le travail du handler, et `etag()` permet au client de
valider sa copie — y compris les réponses servies depuis le cache.

## Invalidation

```ts
CacheManager.invalidateRoute("/api/products")
CacheManager.clear()
```

Le cache est invalidé automatiquement pour une route quand son code change en
HMR. Pour les données métier, déclenchez l'invalidation après une écriture.

## Limites

- Le cache mémoire est local au processus.
- Un TTL trop long sert des données obsolètes.
- Les réponses personnalisées (utilisateur, permissions) doivent inclure un
  `vary` ou une clé adaptée.

## Voir aussi

- [Sécurité](/docs/security)
- [Observabilité](/docs/observability)
- [Référence core](/docs/core-api)
