---
title: "Introduction"
description: "Raiton is a modular TypeScript backend framework for building APIs and microservices on Bun, Node.js and Deno."
section: demarrage
order: 1
since: "6.0"
---

Raiton is a TypeScript backend framework designed to build APIs and
microservices without assembling a dozen libraries. It provides an HTTP server,
a router, a dependency injection container, decorators, plugins, schema-first
contracts, a scheduler, an MCP server and a CLI.

The framework is **Bun-first**: it uses `Bun.serve` natively and takes advantage
of direct TypeScript execution, HMR and artifacts. The same applications run on
**Node.js** and **Deno** through dedicated adapters.

:::note
Raiton is currently published as a **beta** (`6.10.0-beta.28`). The public API is
stable, but details may still change between minor versions. Check the
[versioning policy](/docs/versioning) before going to production.
:::

## The starting point

A Raiton application relies on three elements:

- `raiton.config.ts` — optional, it describes the project: source root,
  version, port, prefix and global options;
- `source/main.ts` — the bootstrapper that creates the `Application` and starts
  the thread;
- `source/controllers/`, `source/services/`, `source/repositories/` and
  `source/modules/` — the application logic, organized by domain.

The rest of the organization is up to you. The CLI generates this structure for
you with [`raiton new`](/docs/cli-new); see the [quickstart](/docs/quickstart).

## The principles

- **Explicit rather than magic.** Routes, dependencies and contracts are
  declared in the code. The framework does not scan your application to guess
  invisible conventions.
- **A single source of truth.** A TypeBox contract feeds runtime validation,
  TypeScript types, OpenAPI and the generated client.
- **Multi-runtime.** The same controller works on Bun, Node.js and Deno.
- **Everything is replaceable.** The router, the container, queue backends and
  plugins are accessible and extensible.
- **Production is not an option.** Security, health checks, observability and
  graceful shutdown are provided, but remain opt-in.

## What Raiton provides

| Area | Building blocks |
|---|---|
| HTTP | `Application`, `Router`, `@Get`, `@Post`, … decorators |
| Architecture | `@Injectable`, `@Inject`, scopes and lifecycle |
| Contracts | `raiton/contracts`, `@Input`, `@Output`, stable validation |
| Documentation | OpenAPI, Redoc interface, generated TypeScript client |
| AI | MCP HTTP and stdio server, tools, prompts, resources |
| Asynchronous | Cron scheduler, in-memory, Redis and RabbitMQ queues |
| Production | HTTP security, HTTPS, health checks, metrics, traces |
| Tooling | `new`, `generate`, `inspect`, `doctor`, `why`, `contract` |

## How a request travels through Raiton

```text
Runtime (Bun / Node / Deno)
  └─ Application.handle(req, reply)
       ├─ 1. Création du RequestContext
       ├─ 2. Hooks onRequest
       ├─ 3. Pipeline de middlewares (body parser, sécurité, app.use)
       ├─ 4. Router.match(method, pathname)
       ├─ 5. Contrôleur + paramètres + validation du contrat
       └─ 6. Réponse, hooks onResponse
```

## Package modules

Raiton is distributed with several entry points:

```ts
import { Application, RaitonThread, Injection } from "raiton/core"
import { Controllable, Get, Injectable, Security } from "raiton/framework"
import { t, Input, Output } from "raiton/contracts"
import type { ThreadInterface, ContextInterface } from "raiton/types"
```

- `raiton/core` — application, router, DI, plugins, scheduler, MCP, artifacts.
- `raiton/framework` — decorators, runtime, responses, plugins, utilities.
- `raiton/contracts` — TypeBox schemas, `@Input`, `@Output`, stable errors.
- `raiton/types` — public interfaces for typing your code.
- `raiton/manifest` — versioned inventory of the project.
- `raiton` — the CLI.

## Who Raiton is for

Raiton is a good fit if you want:

- a **strongly typed** TypeScript API without the weight of an enterprise
  framework;
- a **single server** for HTTP, real-time and AI tools;
- **contracts** that never drift between the code and the documentation;
- a **CLI** that actually diagnoses the project instead of generating code and
  then disappearing.

If you are looking for a frontend framework, Raiton is not for you. If you are
looking for a complete runtime with an ORM, messaging and a template system, you
will need to assemble those building blocks yourself.

## Next steps

- [Install Raiton](/docs/installation)
- [Create your first API](/docs/quickstart)
- [Understand the architecture](/docs/project-structure)
