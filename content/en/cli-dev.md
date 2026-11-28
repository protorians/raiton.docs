---
title: "Develop, build, start"
description: "Use dev, build and start, understand HMR, reloaded artifacts and production behavior."
section: cli
order: 43
since: "6.0"
---

The local cycle relies on three commands: `dev`, `build` and `start`.

## `dev`

```bash
bun raiton dev
```

- starts the server;
- enables HMR;
- watches the source folder recursively;
- reloads controllers, services, middlewares, hooks, sockets, MCP and jobs;
- displays the local and LAN URLs.

```text
[HMR] activated
[INFO] Local access: http://localhost:5711/api
[INFO] LAN access: http://192.168.1.42:5711/api
```

Reloaded artifacts are determined by their suffix. A file without a known
suffix is not hot-reloaded.

## `build`

```bash
bun raiton build
bun raiton build --develop   # inclut les stacks de debug
```

`build` checks the types and then compiles the bootstrapper with esbuild to
`.raiton/server/main.mjs`. On Node.js, `start` uses this compiled file; on Bun
and Deno, the TypeScript bootstrapper keeps running directly.

The build's typecheck **reports** errors without always blocking. For a strict
guarantee, run `tsc --noEmit` in your CI.

## `start`

```bash
bun raiton start
```

- no HMR;
- optimal performance;
- uses the previous build;
- starts the scheduler and the configured observability.

On Node.js:

```bash
node build/bin/index.mjs start
# ou
node .raiton/server/main.mjs
```

## npm scripts

```json
{
  "scripts": {
    "dev": "bun raiton dev",
    "build": "bun raiton build",
    "start": "bun raiton start",
    "test": "bun test"
  }
}
```

## Development mode vs production mode

| Aspect | `dev` | `start` |
|---|---|---|
| HMR | Yes | No |
| Error stacks | Yes | No |
| `/__dev` page | Yes | No |
| Output validation | Yes (`auto`) | No |
| Scheduler | Yes | Yes |
| Observability | Depending on config | Depending on config |

## HMR in detail

The watcher observes `rootDir` and dispatches an `hmr:artifact` signal for each
modified file. The framework:

1. re-imports the module;
2. updates the constructor in the container;
3. recompiles the affected routes or jobs;
4. keeps the other instances.

Middlewares and hooks are replaced cleanly; modified controllers are recompiled
without restarting the process.

## Troubleshooting

| Problem | Solution |
|---|---|
| HMR reloads nothing | Check the file suffix |
| Port already in use | Change `port` or kill the process |
| `start` fails after a change | Run `build` again |
| Incomplete Node build | Check `.raiton/server/main.mjs` |

## See also

- [CLI: inspect](/docs/cli-inspect)
- [Runtimes](/docs/runtimes)
- [Deployment](/docs/deployment)
