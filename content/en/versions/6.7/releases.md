---
title: "Release notes 6.7"
description: "HTTP cache, @Cache decorator and ETag in Raiton 6.7."
section: versions
order: 70
since: "6.0"
---

## 6.7.0-beta.15

**September 9, 2026** · `v6.7.0-beta.15`

### HTTP cache

- `@Cache({ ttl, key, vary, methods, maxEntries })` decorator.
- `CacheManager` for defaults and the store.
- Invalidation per route and on HMR change.
- Bounded in-memory store.

### ETag

- `etag()` middleware with configurable hashing.
- `304 Not Modified` responses on `If-None-Match`.
- Configurable `cacheControl`.

### Migration from 6.6

No breaking changes. Cache and ETag are opt-in.

### Known limitations

- In-memory cache local to the process.
- No built-in distributed store.
