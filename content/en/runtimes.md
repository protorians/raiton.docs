---
title: "Runtimes"
description: "Run the same application on Bun, Node.js, and Deno, force a runtime, and understand the adapters."
section: concepts
order: 17
since: "6.0"
---

Raiton abstracts the HTTP server behind an adapter. The same controller works on
Bun, Node.js, and Deno; only startup and some optimizations change.

## Choosing a runtime

```ts
import { RuntimeType } from "raiton/framework"

return await thread
  .setup({
    application: app,
    runtime: RuntimeType.Bun,
  })
  .run()
```

If `runtime` is omitted, Raiton detects the environment:

1. Bun if `globalThis.Bun` exists;
2. Deno if `globalThis.Deno` exists;
3. Node.js otherwise.

| Runtime | Server | TS execution | Recommendation |
|---|---|---|---|
| Bun | `Bun.serve` | Native | **Production and development** |
| Node.js | `node:http` | Via bundler | Compatibility and ecosystem |
| Deno | `Deno.serve` | Native | Deno production |

## Commands per runtime

```bash
# Bun
bun raiton dev
bun raiton start

# Node.js (CLI précompilée)
node build/bin/index.mjs dev
node build/bin/index.mjs start

# Deno
deno task dev
deno task start
deno task compile   # binaire autonome
```

## Bun

- Native `Bun.serve()`;
- Standard `Request` / `Response`;
- HMR and direct TypeScript imports;
- sockets via the Bun API;
- recommended for performance.

```ts
import { Runtime, RuntimeType } from "raiton/framework"

const runtime = new Runtime(RuntimeType.Bun)
const server = runtime.createServer(handler)
await server.listen(5711, "0.0.0.0")
```

## Node.js

The Node adapter wraps `IncomingMessage` and `ServerResponse` to expose the same
interface as Web runtimes:

```text
node/
├── server.ts   → node:http.createServer
├── request.ts  → NodeRequest
└── reply.ts    → NodeReply
```

In production, the CLI compiles the application with esbuild to
`.raiton/server/main.mjs`, then runs it. This makes it possible to use Node
without a TypeScript runtime.

## Deno

- `Deno.serve()`;
- `Deno.upgradeWebSocket()` for sockets;
- native permissions;
- compilation to a standalone binary possible.

```bash
deno task compile
./build/bin/raiton start
```

## Differences to know

| Topic | Bun | Node.js | Deno |
|---|---|---|---|
| Direct TS import | Yes | No | Yes |
| HMR | Yes | Yes (CLI) | Yes (`--watch`) |
| Sockets | Yes | Limited | Yes |
| Standalone binary | Yes | No | Yes |
| `process.env` | Yes | Yes | Via `Deno.env` / compat |

Raiton normalizes environment variables with `env()`; use this helper rather than
`process.env` directly if you target Deno.

```ts
import { env } from "raiton/framework"

const port = env("PORT", 5711, Number)
```

## Checking the runtime

```ts
import { Runtime, RuntimeType } from "raiton/framework"

const runtime = new Runtime(RuntimeType.Bun)
runtime.isBun   // true
runtime.isNode  // false
runtime.isDeno  // false
```

## Best practices

- Develop on Bun, ship on your infrastructure's runtime.
- Test at least once on the production runtime: file APIs, sockets, and
  permissions differ.
- Use `env()` for environment variables.
- Avoid runtime-specific APIs in business services.

## See also

- [Installation](/docs/installation)
- [Deployment](/docs/deployment)
- [Environment variables](/docs/environment)
