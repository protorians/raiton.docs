---
title: "Deployment"
description: "Prepare and deploy a Raiton application on Bun, Node.js or Deno, with Docker, TLS and observability."
section: guides
order: 62
since: "6.0"
---

## Build

```bash
bun raiton build
```

The build compiles the bootstrapper to `.raiton/server/main.mjs` and checks the
types. On Node.js, `start` runs that file; on Bun and Deno, the TypeScript
bootstrapper runs directly. Add `tsc --noEmit` in CI to block type errors.

## Start

```bash
# Bun
bun raiton start

# Node.js
node build/bin/index.mjs start

# Deno
deno task start
# ou un binaire autonome
deno task compile && ./build/bin/raiton start
```

## Environment variables

```bash
NODE_ENV=production
PORT=5711
RAITON_OBSERVABILITY=metrics
RAITON_SHUTDOWN_TIMEOUT_MS=10000
```

Never commit secrets to version control. Validate the required variables at
startup.

## Docker (Bun)

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun raiton build

ENV NODE_ENV=production
EXPOSE 5711

HEALTHCHECK --interval=30s --timeout=3s \
  CMD bun -e "fetch('http://localhost:5711/api/health').then(r=>process.exit(r.ok?0:1))"

CMD ["bun", "raiton", "start"]
```

## Docker (Node.js)

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.raiton ./.raiton
COPY --from=build /app/package.json ./
ENV NODE_ENV=production
EXPOSE 5711
CMD ["node", ".raiton/server/main.mjs"]
```

## Reverse proxy and TLS

Terminate TLS at the proxy level (Caddy, Nginx, load balancer) or enable
`defineHttps()` if Raiton exposes the port directly.

```caddyfile
api.example.com {
  reverse_proxy localhost:5711
  encode zstd gzip
}
```

## Health checks

- **Liveness**: the process responds.
- **Readiness**: `/health` returns `200` and `status: "healthy"`.
- During a shutdown, `/health` returns `503`.

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5711/api/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```

## Observability

```bash
RAITON_OBSERVABILITY=all
RAITON_OTEL_ENDPOINT=http://otel-collector:4318
RAITON_ACCESS_LOG=1
```

- `/metrics` for Prometheus;
- OTLP traces to the collector;
- `x-request-id` propagated in the logs.

## Graceful shutdown

The container must receive `SIGTERM` and allow time for requests to finish.
Configure `shutdown.timeoutMs` below the orchestrator's
`terminationGracePeriodSeconds`.

```yaml
terminationGracePeriodSeconds: 30
```

## Scheduler with multiple instances

By default, the queue is in memory: each instance has its own jobs.
For a multi-instance deployment:

- use Redis or RabbitMQ;
- define `singleton` to avoid duplicates;
- or run the scheduler in a dedicated process.

## Checklist

- [ ] `bun raiton build` passes in CI
- [ ] `/health` responds and readiness is wired up
- [ ] Database migrations have been run
- [ ] Secrets come from the environment
- [ ] CORS and rate limiting configured
- [ ] HTTPS enabled
- [ ] Metrics and logs collected
- [ ] `SIGTERM` handled and grace period sufficient
- [ ] The scheduler is aware of the number of instances

## See also

- [Runtimes](/docs/runtimes)
- [Health checks](/docs/health-checks)
- [Observability](/docs/observability)
- [Security](/docs/security)
