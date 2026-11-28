---
title: "Release notes 6.6"
description: "Health checks, CSRF and DI artifact loading in Raiton 6.6."
section: versions
order: 70
since: "6.0"
---

## 6.6.0-beta.14

**September 4, 2026** · `v6.6.0-beta.14`

### Health checks

- `GET /health` endpoint by default.
- `@HealthCheck()` decorator.
- `HealthCheckManager`: path, response, custom checks.
- `healthy`, `degraded`, `unhealthy` statuses.

### CSRF

- Double-submit mode (stateless).
- Synchronizer mode (stateful with TTL).
- Mobile/desktop client detection.
- `@CsrfToken()` and `@CsrfGuard()` decorators.

### Dependency injection

- DI artifact loading with classification.
- Timestamp-based cache.
- Improved traces when a dependency is missing.

### Migration from 6.5

No breaking changes. Health checks and CSRF are opt-in, except
for the default `/health`.

### Known limitations

- Health checks run on every call; keep them lightweight.
- CSRF rate limiting depends on server storage in synchronizer mode.
