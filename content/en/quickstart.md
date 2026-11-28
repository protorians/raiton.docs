---
title: "Quick start"
description: "Create a Raiton project, write a controller, start the server, and call your first route in under five minutes."
section: demarrage
order: 3
since: "6.0"
---

The expected entry point is a `main.ts` file placed in the `rootDir` configured
by `raiton.config.ts` (or `raiton.config.js`). This file exports a default
function that connects your `Application` to the Raiton thread. Application code
lives in `source/controllers`, `source/services`, `source/repositories`, and
`source/modules`.

## 1. Create the project

The CLI generates a complete project, with configuration, an example controller,
scripts, and a test:

```bash
bun raiton new my-api --template api --runtime bun --yes
cd my-api
bun raiton dev
bun test
```

`bun raiton` uses the local version of the CLI. If the `raiton` command is not
available, `bunx raiton new …` downloads and runs the same CLI without a global
install.

Available templates:

| Template | Contents |
|---|---|
| `api` | Bootstrapper, example controller, service, and test |
| `minimal` | Bootstrapper, example service, and test |
| `mcp-agent` | Example MCP server with the `add` tool and a test |

The `api` and `mcp-agent` templates also expose `GET /api/health`.
`--dry-run` prints the plan without writing, `--offline` and `--no-install`
disable dependency installation. See [`raiton new`](/docs/cli-new) for all
options.

### Generated configuration

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

`rootDir` is the root read by the scanner: it contains `main.ts` and the
artifacts. On Node.js, the template generates `raiton.config.js` instead. See
[Configuration](/docs/configuration) to adjust the port, prefix, or observability
options.

## 2. Bootstrap the framework

The `main.ts` file must be located in the `rootDir` defined by the configuration.
It exports a default function that binds your `Application` to the Raiton thread:

```ts
import "reflect-metadata"
import { ThreadInterface } from "raiton/types"
import { Application } from "raiton/core"
import { RuntimeType } from "raiton/framework"

export default async (thread: ThreadInterface) => {
  const app = new Application({
    port: 5711,
    prefix: "/api"
  })

  return await thread.setup({
    application: app,
    runtime: RuntimeType.Bun
  }).run()
}
```

- `thread.setup({ application, runtime })` registers the body parser, selects the
  runtime adapter, and prepares the server;
- `thread.run()` scans the `rootDir`, mounts the routes, then listens on the port;
- with the default `rootDir` (`./source`), this file is therefore
  `source/main.ts`.

## 3. Write a controller

The `api` template already contains an example controller. Here is how to write
your own:

```ts
// source/controllers/tasks.controller.ts
import { Body, Controllable, Delete, Get, Param, Post } from "raiton/framework"
import { Input, Output, t, type Infer } from "raiton/contracts"

const TaskSchema = t.object({
  id: t.string(),
  title: t.string().min(1),
  done: t.boolean(),
})
type Task = Infer<typeof TaskSchema>

const CreateTaskSchema = t.object({
  title: t.string().min(1),
})
type CreateTask = Infer<typeof CreateTaskSchema>

@Controllable("/tasks")
export class TasksController {
  private tasks = new Map<string, Task>()

  @Get("/")
  @Output(t.array(TaskSchema))
  list() {
    return [...this.tasks.values()]
  }

  @Get("/:id")
  @Output(TaskSchema)
  get(@Param("id") id: string) {
    return this.tasks.get(id) ?? { id, title: "inconnue", done: false }
  }

  @Post("/")
  @Input(CreateTaskSchema)
  @Output(TaskSchema)
  create(@Body() input: CreateTask) {
    const task: Task = { id: crypto.randomUUID(), title: input.title, done: false }
    this.tasks.set(task.id, task)
    return task
  }

  @Delete("/:id")
  remove(@Param("id") id: string) {
    this.tasks.delete(id)
    return { removed: id }
  }
}
```

The file is detected automatically thanks to the `.controller.ts` suffix. The
scanner reads decorator metadata and mounts the routes under the global `/api`
prefix.

## 4. Call the API

```bash
curl http://localhost:5711/api/health
curl http://localhost:5711/api/tasks

curl -X POST http://localhost:5711/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Écrire la documentation"}'

curl http://localhost:5711/api/tasks/<id>
```

An invalid input is rejected **before** the handler:

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "statusCode": 400,
  "details": [
    {
      "path": "title",
      "code": "too_small",
      "message": "Expected string to have >=1 characters"
    }
  ]
}
```

## 5. Explore

```bash
bun raiton routes                 # routes montées
bun raiton inspect --json         # manifeste du projet
bun raiton why GET /api/tasks     # fichier et ligne d'une route
bun raiton generate resource users # contrôleur, service, dépôt, DTO et test
bun raiton openapi export         # contrat OpenAPI
bun raiton doctor                 # diagnostic
```

In development, a discovery page is available at `/api/__dev`: routes,
artifacts, the injection graph, jobs, and HMR events.

## 6. Test

```bash
bun test
```

The `api` template includes a service test. To test without opening a port,
mount the controller with `compileController` and provide a mock reply:

```ts
import { Application, compileController } from "raiton/core"
import { TasksController } from "./controllers/tasks.controller"

class MockReply {
  statusCode = 200
  body: unknown

  status(code: number) {
    this.statusCode = code
  }

  header() {}

  send(body: unknown) {
    this.body = body
  }
}

const app = new Application({ prefix: "/api" })
compileController(TasksController, app)

const reply = new MockReply()
await app.handle(
  { method: "GET", url: "/api/tasks", headers: new Headers() },
  reply,
)

console.log(reply.statusCode, reply.body)
```

See [Testing](/docs/testing) for POST requests and contracts.

## What's next?

- Add a database in an injected service:
  [Dependency injection](/docs/injection)
- Document the API: [OpenAPI](/docs/openapi)
- Expose AI tools: [MCP](/docs/mcp)
- Schedule tasks: [Scheduler](/docs/scheduler)
- Follow the full tutorial: [Building an API](/docs/tutorial)
