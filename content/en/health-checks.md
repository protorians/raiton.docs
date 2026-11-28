---
title: "Health checks"
description: "Expose a health endpoint, add dependency checks and manage readiness."
section: fonctionnalites
order: 29
since: "6.6"
---

Raiton automatically registers `GET /health` if no health check is defined. The
endpoint is used by liveness and readiness probes.

## Default endpoint

```json
{
  "statusCode": 200,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2026-09-03T12:00:00.000Z",
    "uptime": 42.1,
    "version": "0.0.0"
  }
}
```

As soon as you declare a health check, the default is replaced.

## Custom health check

```ts
import { Controllable, Get, HealthCheck, HttpStatus, RaitonResponses } from "raiton/framework"

@Controllable()
export class HealthController {
  @Get("/health")
  @HealthCheck({ summary: "État de l'application" })
  check() {
    return RaitonResponses(
      "Service is healthy",
      { status: "healthy" },
      HttpStatus.OK,
      { error: false },
    )
  }
}
```

| Option | Default | Role |
|---|---|---|
| `path` | `/health` | Documented path |
| `tags` | `["Health"]` | OpenAPI tags |
| `summary` | — | Summary |
| `description` | — | Description |
| `excludeFromDocs` | `false` | Hide in OpenAPI |

## Dependency checks

```ts
import { HealthCheckManager } from "raiton/framework"

HealthCheckManager.configure({
  checks: [
    {
      name: "database",
      check: async () => {
        await db.ping()
        return { status: "healthy" }
      },
    },
    {
      name: "cache",
      check: async () => ({ status: "degraded", message: "latence élevée" }),
    },
  ],
})
```

The results are aggregated into `data.checks`. The overall status is:

| Status | HTTP code |
|---|---|
| `healthy` | `200` |
| `degraded` | `200` (or the configured code) |
| `unhealthy` | `503` |

## Fully custom handler

```ts
HealthCheckManager.registerCustomHandler(() => ({
  ok: true,
  memory: process.memoryUsage(),
}))
```

## Readiness and graceful shutdown

During a shutdown, readiness switches to `false` and `/health` responds `503`
with the reason. New connections are refused and in-flight requests are
drained until `shutdown.timeoutMs`.

```ts
export default {
  shutdown: { timeoutMs: 10_000 },
}
```

## Best practices

- Keep `/health` lightweight: no heavy network call on every probe.
- Separate liveness (`process alive`) and readiness (`ready to serve`) if your
  orchestrator allows it.
- Only check critical dependencies.
- Do not expose `/health` publicly if you put internal details in it.

## See also

- [Observability](/docs/observability)
- [Deployment](/docs/deployment)
- [Security](/docs/security)
