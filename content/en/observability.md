---
title: "Observability"
description: "Correlation, Prometheus metrics, OTLP traces, readiness and graceful shutdown, with no overhead when disabled."
section: fonctionnalites
order: 31
since: "6.9"
---

Observability is **opt-in**. When disabled, it adds no work on the hot path.

## Enable

```bash
RAITON_OBSERVABILITY=off|metrics|traces|all
RAITON_METRICS_PATH=/metrics
RAITON_OTEL_ENDPOINT=http://localhost:4318
RAITON_REQUEST_ID_HEADER=x-request-id
RAITON_SHUTDOWN_TIMEOUT_MS=10000
RAITON_ACCESS_LOG=1
```

Or in `raiton.config.ts`:

```ts
export default {
  observability: {
    mode: "all",
    metricsPath: "/metrics",
  },
  shutdown: {
    timeoutMs: 10_000,
  },
}
```

## Correlation

Each request receives an identifier:

- taken from `x-request-id` if it is valid;
- otherwise generated;
- present in the response, the logs and `ctx.state.requestId`.

Error logs always carry the identifier. `RAITON_ACCESS_LOG=1` adds one line per
request with the correlation identifier and the trace identifier.

## Metrics

`GET /metrics` exposes the Prometheus text format:

```text
http_requests_total{method,route,status}
http_request_duration_seconds (histogramme)
http_errors_total{method,route,status}
```

The path is relative to the application prefix.

## Traces

- Incoming spans use `traceparent` when it is provided.
- Outgoing calls must use `tracedFetch` to share the trace.

```ts
import { tracedFetch } from "raiton/framework"

const response = await tracedFetch("https://api.example.com/users")
```

OTLP/HTTP JSON export to `RAITON_OTEL_ENDPOINT`.

## Errors

All public HTTP errors follow the catalogue
`code → status → message → docsUrl`. In production, no stack trace is returned.

```json
{
  "error": true,
  "code": "NOT_FOUND",
  "statusCode": 404,
  "message": "Route not found",
  "docsUrl": "https://…"
}
```

## Graceful shutdown

On `SIGINT` / `SIGTERM`:

1. readiness switches to `false` (`/health` responds with `503`);
2. new connections are refused;
3. in-flight requests are drained until `shutdown.timeoutMs`;
4. the process exits with `0`.

## Budgets

| Mode | Target overhead p50 |
|---|---|
| `off` | 0 measurable |
| `metrics` | ≤ 5 % |
| `traces` | ≤ 10 % |

## Best practices

- Enable `metrics` by default in production, `traces` as needed.
- Propagate `traceparent` between services.
- Do not add personal identifiers in Prometheus labels.
- Monitor `http_errors_total` and p95 latency, not just p50.
- Use `/health` for readiness, not `/metrics`.

## See also

- [Health checks](/docs/health-checks)
- [Deployment](/docs/deployment)
- [Error codes](/docs/errors)
