---
title: "Installation"
description: "Install Raiton with Bun, npm, pnpm or Deno, configure TypeScript and verify that the server starts."
section: demarrage
order: 2
since: "6.0"
---

## Prerequisites

- **Bun 1.2+** (recommended), **Node.js 22+** or **Deno 2+**
- **TypeScript 5+**
- A project with `experimentalDecorators` and `emitDecoratorMetadata` enabled

## Create a project

The fastest path is still the CLI, which generates the bootstrapper, the
configuration, a sample controller and a test:

```bash
bun raiton new my-api --template api --runtime bun --yes
cd my-api
bun raiton dev
```

`--template` accepts `api`, `minimal` and `mcp-agent`. See the
[quickstart](/docs/quickstart) and [`raiton new`](/docs/cli-new) for the
details of the options.

## Install in an existing project

```bash
# Bun (recommandé)
bun add raiton reflect-metadata

# npm
npm install raiton reflect-metadata

# pnpm
pnpm add raiton reflect-metadata

# Deno
deno add npm:raiton npm:reflect-metadata
```

`reflect-metadata` is **mandatory**: Raiton decorators rely on TypeScript
metadata. Import it once, at the very beginning of the application entry point,
before any other Raiton import.

```ts
import "reflect-metadata"
```

## Configure TypeScript

The `tsconfig.json` file must enable decorators and type metadata:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["bun"]
  },
  "include": ["source", "tests"]
}
```

Adapt `types` to the target runtime: `bun`, `node` or `deno`.

:::warning
Without `emitDecoratorMetadata`, `@Inject()` cannot infer the type of a
constructor parameter and injection fails silently. Without
`experimentalDecorators`, the code does not compile at all.
:::

## Describe the project

Place a `raiton.config.ts` file at the root to describe the project. It is
loaded and validated before the port is opened:

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  version: "0.1.0",
  port: 5711,
  hostname: "0.0.0.0",
  prefix: "/api",
  pathname: "/",
  artifacts: {
    types: ["controller", "service", "repository", "dto", "mcp"],
  },
})
```

`rootDir` indicates where the scanner looks for sources and the bootstrapper.
If your code lives in `src/`, simply change that value. See
[Configuration](/docs/configuration) for all the options.

## Create the entry point

Raiton expects a bootstrapper in `source/main.ts` (or in the configured
`rootDir`):

```ts
import "reflect-metadata"
import { Application } from "raiton/core"
import { RuntimeType } from "raiton/framework"
import type { ThreadInterface } from "raiton/types"

export default async function main(thread: ThreadInterface) {
  const app = new Application({
    port: 5711,
    prefix: "/api",
  })

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
```

The bootstrapper receives an already initialized `RaitonThread`.
`thread.setup()` registers the body parser, chooses the runtime adapter and
prepares the server. `thread.run()` scans the artifacts, mounts the routes and
then listens on the port.

## Start

```bash
# Bun
bun raiton dev

# Node.js
npx raiton dev

# Deno
deno task dev
```

On Bun and Node.js, the generated project also exposes the `dev`, `build` and
`start` scripts (`bun run dev` or `npm run dev`). On Deno, use the
`deno task dev`, `deno task build` and `deno task start` tasks.

You should see the local and network URLs:

```text
[INFO] Local access: http://localhost:5711/api
[INFO] LAN access: http://192.168.1.42:5711/api
```

## Verify the installation

Create a minimal controller:

```ts
// source/controllers/hello.controller.ts
import { Controllable, Get } from "raiton/framework"

@Controllable("/hello")
export class HelloController {
  @Get("/")
  index() {
    return { message: "Bonjour de Raiton" }
  }
}
```

Then:

```bash
curl http://localhost:5711/api/hello
# {"message":"Bonjour de Raiton"}
```

## Troubleshooting

| Symptom | Probable cause | Solution |
|---|---|---|
| `Reflect.getMetadata is not a function` | `reflect-metadata` missing | Import it first |
| `Cannot read properties of undefined (reading 'name')` | metadata disabled | Enable `emitDecoratorMetadata` |
| The controller is not mounted | file named incorrectly | Use the `.controller.ts` suffix |
| Unexpected `401` | global middleware | Check the registration order |
| Port already in use | another process | Change `port` or kill the process |

For an automatic diagnostic:

```bash
bun raiton doctor
```

## Next steps

- [Quickstart](/docs/quickstart)
- [Project structure](/docs/project-structure)
- [Configuration](/docs/configuration)
