---
title: "Project structure"
description: "Organize a Raiton application by domain, name artifacts, and keep a readable bootstrapper."
section: demarrage
order: 4
since: "6.0"
---

Raiton does not impose an architecture on you. It only imposes two conventions
useful to the scanner:

1. a `source/main.ts` bootstrapper (or the file defined by `rootDir`);
2. **artifacts** identifiable by their suffix (`*.controller.ts`,
   `*.service.ts`, …).

The expected separation remains simple:

- `raiton.config.ts` describes the project;
- `source/main.ts` creates and starts the server;
- `source/modules/`, `source/controllers/`, `source/services/` and
  `source/repositories/` contain the application logic.

The rest must remain readable by your team.

## Recommended structure

```text
my-api/
├── raiton.config.ts
├── package.json
├── tsconfig.json
└── source/
    ├── main.ts
    ├── controllers/
    │   └── tasks.controller.ts
    ├── services/
    │   └── tasks.service.ts
    ├── repositories/
    │   └── tasks.repository.ts
    ├── dtos/
    │   └── create-task.dto.ts
    ├── middleware/
    │   └── auth.middleware.ts
    ├── plugins/
    │   └── telemetry.plugin.ts
    ├── schedulers/
    │   └── cleanup.scheduler.ts
    ├── mcp/
    │   └── billing.mcp.ts
    └── sockets/
        └── chat.socket.ts
```

## The layers

| Layer | Role | Must not |
|---|---|---|
| Controller | Read the request, call a service, return a response | Access the database directly |
| Service | Apply business rules | Know about HTTP |
| Repository | Talk to the database or an external API | Make business decisions |
| DTO / contract | Describe the shape of inputs | Contain logic |
| Middleware | Handle a cross-cutting rule | Become a mini-service |
| Plugin | Register routes, hooks, and middlewares | Depend on a specific controller |

## The artifacts

Raiton's scanner recognizes files by their type. The main suffixes:

| Suffix | Type | Compiled at startup |
|---|---|---|
| `*.controller.ts` | HTTP controller | Yes |
| `*.socket.ts` | Real-time controller | Yes |
| `*.mcp.ts` | MCP server | Yes |
| `*.scheduler.ts`, `*.task.ts`, `*.cron.ts`, `*.job.ts` | Scheduled jobs | Yes |
| `*.service.ts` | Injectable service | Via DI |
| `*.repository.ts` | Repository | Via DI |
| `*.use-case.ts` | Business use case | Via DI |
| `*.dto.ts` | Input DTO | Via DI / import |
| `*.entity.ts`, `*.model.ts` | Entities and models | Via DI / import |
| `*.middleware.ts` | Middleware | Manual import |
| `*.command.ts` | Project CLI command | When the CLI loads |

You can register additional types:

```ts
import { Artifacts } from "raiton/framework"

Artifacts.registerMany("command", "event", "listener")
```

## Organize by domain

As the application grows, group by domain rather than by type:

```text
source/
└── modules/
    ├── users/
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── users.repository.ts
    │   └── users.contract.ts
    ├── billing/
    │   ├── billing.controller.ts
    │   ├── billing.service.ts
    │   ├── billing.mcp.ts
    │   └── billing.scheduler.ts
    └── shared/
        ├── database.service.ts
        └── auth.middleware.ts
```

The scanner is recursive: file location does not matter, only the suffix counts.
Organizing by domain reduces back-and-forth between folders.

## Modular monolith: when a module grows

On a production API, a flat module ends up mixing business rules, persistence,
and HTTP. Split each module into four layers:

```text
source/modules/identity/
├── domain/                 # entités, ports, enums — aucun import Raiton
│   ├── entities/
│   ├── repositories/       # interfaces
│   └── enums/
├── application/            # cas d'usage, DTO, services applicatifs
│   ├── use-cases/
│   ├── dtos/
│   └── services/
├── infrastructure/         # adaptateurs concrets
│   ├── persistence/        # Prisma, SQL, fichiers
│   ├── gateways/           # HTTP, e-mail, stockage
│   ├── security/
│   └── schedulers/
└── presentation/           # frontière HTTP
    ├── controllers/
    ├── vm/                 # ViewModels de sortie
    └── middlewares/
```

The dependency rule takes precedence over folder names:

| Layer | May depend on | Must not depend on |
|---|---|---|
| `domain` | TypeScript and domain types | Raiton, Prisma, HTTP |
| `application` | `domain`, ports, injectable services | `Request`, `Reply`, controllers |
| `infrastructure` | `domain`, external SDKs | `presentation` |
| `presentation` | `application`, domain types | concrete implementations |

A use case does not receive `req`: it receives values and throws a business
error. The controller translates the error into an HTTP status. This boundary
makes the business logic testable without a server and allows changing the
transport without rewriting the rules.

### The composition root

The scanner mounts controllers, but it only evaluates imported files. An
`@Injectable()` implementation that is never referenced is therefore not
registered in the container, and resolution fails. Centralize concrete imports
in a **composition root** imported at the very beginning of `main.ts`:

```ts
// source/shared/infrastructure/di/composition-root.ts
import "@/modules/identity/infrastructure/persistence/prisma-user.repository"
import "@/modules/identity/application/session-refresh-token.service"
import "@/modules/organization/infrastructure/persistence/prisma-organization.repository"
import "@/shared/infrastructure/database/prisma.service"
```

```ts
// source/main.ts
import "reflect-metadata"
import "@/shared/infrastructure/di/composition-root"
import { Application } from "raiton/core/application"
```

The composition root contains only imports. It ensures that controller
dependencies are known before the routes are compiled.

:::tip
For a real API, this organization is detailed step by step in
[Architecture of a production API](/docs/architecture-production).
:::

## The bootstrapper stays thin

`source/main.ts` should describe the server, not the business logic:

```ts
import "reflect-metadata"
import { Application, RaitonConfig } from "raiton/core"
import { Security, RuntimeType } from "raiton/framework"
import type { ThreadInterface } from "raiton/types"

export default async (thread: ThreadInterface) => {
  const project = RaitonConfig.toObject()
  const app = new Application({
    port: project.port ?? Number(process.env.PORT ?? 5711),
    prefix: project.prefix ?? "/api",
    hostname: project.hostname,
    pathname: project.pathname,
  })

  app.use(Security.cors({ origin: "*" }))

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
```

## Configuration

Place a `raiton.config.ts` file at the root to describe the project:

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  version: "0.1.0",
  port: 5711,
  hostname: "0.0.0.0",
  protocole: "http",
  pathname: "/",
  prefix: "/api",
  artifacts: {
    types: ["controller", "socket", "service", "scheduler"],
  },
})
```

`rootDir` is resolved from the project root. If your code lives in `src/`, simply
change this value; the expected bootstrapper becomes `src/main.ts`. The generated
template reads these values back with `RaitonConfig.toObject()` in
`source/main.ts`. See [Configuration](/docs/configuration) for all options.

## Practical rules

- One controller = one HTTP resource.
- One service = one business use case.
- One file = one responsibility.
- Shared types go in a `shared` or `contracts` module.
- Type imports use `import type` to avoid unnecessary runtime imports with Bun.

:::tip
`raiton generate resource users` creates the controller, service, repository,
DTO, and test in the recommended structure. See
[`raiton generate`](/docs/cli-generate).
:::

## See also

- [Application and lifecycle](/docs/application)
- [Dependency injection](/docs/injection)
- [Configuration](/docs/configuration)
