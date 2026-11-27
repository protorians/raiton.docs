---
title: "Notes de version 6.7"
description: "Cache HTTP, décorateur @Cache et ETag dans Raiton 6.7."
section: versions
order: 70
since: "6.0"
---

## 6.7.0-beta.15

**9 septembre 2026** · `v6.7.0-beta.15`

### Cache HTTP

- Décorateur `@Cache({ ttl, key, vary, methods, maxEntries })`.
- `CacheManager` pour les défauts et le store.
- Invalidation par route et par changement HMR.
- Store mémoire borné.

### ETag

- Middleware `etag()` avec hachage configurable.
- Réponses `304 Not Modified` sur `If-None-Match`.
- `cacheControl` configurable.

### Migration depuis 6.6

Aucun changement cassant. Le cache et ETag sont opt-in.

### Limites connues

- Cache mémoire local au processus.
- Pas de store distribué intégré.
