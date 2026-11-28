---
title: "Environment variables"
description: "Read environment variables with env(), load .env and avoid conversion pitfalls."
section: fonctionnalites
order: 33
since: "6.0"
---

Raiton automatically loads the `.env` file at the project root on startup
(via `dotenv`). The `env()` helper normalizes reading.

## Read a value

```ts
import { env } from "raiton/framework"

const host = env("HOST", "0.0.0.0")
const port = env<number>("PORT", 5711, "int")
const ratio = env<number>("RATIO", 0.5, "float")
```

The signature is:

```ts
env<T>(key: string, defaultValue?: T, type?: "string" | "int" | "float" | "boolean" | "bigInt"): T | undefined
```

The type is a **string**, not a constructor. `Number` or `Boolean` do not
trigger the conversion.

```ts
env("PORT", 5711, Number)   // ❌ retourne une string
env("PORT", 5711, "int")    // ✅ retourne un number
```

## Booleans

The boolean conversion is basic: any non-empty value is `true`.

```ts
env("DEBUG", false, "boolean") // "false" → true
```

For predictable behavior, compare explicitly:

```ts
const debug = env("DEBUG", "false") === "true"
const enabled = env("FEATURE_FLAG", "0") === "1"
```

## Group variables

`envGroup(prefix)` is exported by the framework, but its behavior remains
limited. For a typed and validated object, prefer a dedicated function:

```ts
export const config = {
  port: env<number>("PORT", 5711, "int"),
  databaseUrl: env("DATABASE_URL", "postgres://localhost/app"),
  redisUrl: env("REDIS_URL"),
  debug: env("DEBUG", "false") === "true",
}
```

## Use in the application

```ts
const app = new Application({
  port: env<number>("PORT", 5711, "int"),
  hostname: env("HOST", "0.0.0.0"),
  verbose: env("VERBOSE", "false") === "true",
})
```

## Reserved prefixes

| Prefix | Usage |
|---|---|
| `RAITON_` | Observability, shutdown, mode |
| `NODE_ENV` | Node environment |
| `PORT`, `HOST` | Server convention |

Avoid reusing `RAITON_` for your own variables.

## Secrets

- Never commit `.env`.
- Provide a `.env.example` without sensitive values.
- In production, inject the variables via the platform's secret manager.
- Validate the required variables at startup, before opening the port.

```ts
function required(key: string): string {
  const value = env(key)
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}
```

## See also

- [Configuration](/docs/configuration)
- [Deployment](/docs/deployment)
- [Security](/docs/security)
