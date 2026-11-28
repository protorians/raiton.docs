---
title: "Configuration"
description: "Reference for raiton.config.ts: loading, validation, global options, observability, validation, shutdown, MCP and the development page."
section: reference
order: 52
since: "6.0"
---

`raiton.config.ts` describes the project. It is loaded before the port is opened
and validated field by field.

## Load order

```text
raiton.config.ts → .mts → .cts → .js → .mjs → .cjs → .json
```

The first file found is used. A syntax error in a JavaScript or JSON file
blocks startup; a TypeScript import failure on Node falls through to the next
format.

## Full example

```ts
export default {
  rootDir: "./source",
  version: "1.0.0",

  port: 5711,
  hostname: "0.0.0.0",
  protocole: "http",
  pathname: "/",
  prefix: "/api",

  develop: false,
  verbose: false,

  artifacts: {
    types: ["controller", "socket", "service", "scheduler"],
  },

  observability: {
    mode: "metrics",
    metricsPath: "/metrics",
    otelEndpoint: "http://localhost:4318",
    requestIdHeader: "x-request-id",
    serviceName: "users-api",
  },

  validation: {
    responses: "auto",
  },

  shutdown: {
    timeoutMs: 10_000,
  },

  devPage: {
    enabled: true,
    path: "/__dev",
  },

  mcp: {
    exposeDestructive: false,
    rateLimitPerMinute: 60,
  },

  docs: {
    dir: "docs",
    lang: "fr",
  },
}
```

## Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `rootDir` | `string` | `"."` | Source root |
| `version` | `string` | `"0.0.1"` | Version exposed by the application |
| `port` | `number` | `5712` | Listening port |
| `hostname` | `string` | `localhost` | Listening interface |
| `protocole` | `"http" \| "https"` | `http` | Protocol |
| `pathname` | `string` | `/` | Root path |
| `prefix` | `string` | — | Route prefix |
| `develop` | `boolean` | `false` | Development mode |
| `verbose` | `boolean` | `false` | Detailed logs |
| `artifacts.types` | `string[]` | built-in list | Artifact types |
| `https` | object | — | TLS configuration |
| `observability` | object | `{ mode: "off" }` | Observability |
| `validation` | object | `{ responses: "auto" }` | Output validation |
| `shutdown` | object | `{ timeoutMs: 10_000 }` | Graceful shutdown |
| `devPage` | object | `{ enabled: true, path: "/__dev" }` | Dev page |
| `mcp` | object | `{ exposeDestructive: false }` | MCP security |
| `docs` | object | — | Documentation generation |

## Validation

The configuration is validated **before** the port is opened. An invalid value
produces per-field errors:

```json
{
  "field": "port",
  "message": "port must be an integer between 1 and 65535",
  "expected": "integer(1..65535)",
  "received": "string"
}
```

The published JSON schema is available via:

```bash
bun raiton inspect --config-schema
```

## Environment variables

Some options are overridden by the environment:

| Variable | Option |
|---|---|
| `PORT` | Application port (if you use it) |
| `RAITON_OBSERVABILITY` | `observability.mode` |
| `RAITON_METRICS_PATH` | `observability.metricsPath` |
| `RAITON_OTEL_ENDPOINT` | `observability.otelEndpoint` |
| `RAITON_REQUEST_ID_HEADER` | `observability.requestIdHeader` |
| `RAITON_SHUTDOWN_TIMEOUT_MS` | `shutdown.timeoutMs` |
| `RAITON_ACCESS_LOG` | Access log (`1`) |

See [Environment variables](/docs/environment).

## defineConfigSync

For typing and validation at definition time:

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  port: 5711,
})
```

## Common errors

| Error | Cause |
|---|---|
| `rootDir must be a non-empty string` | `rootDir: ""` |
| `port must be an integer` | Port as a string |
| `protocole must be 'http' or 'https'` | Typo |
| `observability.mode must be …` | Unknown mode |
| `devPage.path must be an absolute path` | Path without `/` |

## See also

- [Installation](/docs/installation)
- [Application](/docs/application)
- [Observability](/docs/observability)
