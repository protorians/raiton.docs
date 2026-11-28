---
title: "Testing"
description: "Test services, controllers, contracts and MCP servers with bun test."
section: guides
order: 63
since: "6.0"
---

Raiton relies on standard tools: `bun test`, `node:test` or any
compatible runner. The framework does not impose a mocking library.

## Running the tests

```bash
bun test
bun test --watch
bun test tests/users.test.ts
```

## Testing a service

```ts
import { describe, expect, it } from "bun:test"
import { TasksService } from "../source/tasks/tasks.service"
import { TasksRepository } from "../source/tasks/tasks.repository"

describe("TasksService", () => {
  it("crée une tâche", () => {
    const service = new TasksService(new TasksRepository())
    const task = service.create({ title: "Test" })

    expect(task.id).toBeString()
    expect(task.done).toBe(false)
  })
})
```

Services receive their dependencies through the constructor: you can pass
a fake repository without a container.

## Testing a controller

Two approaches:

### Via `Application.handle`

`handle()` expects a normalized request and a response that exposes `status()`,
`header()` and `send()`. Create a small mock and mount the controller with
`compileController`:

```ts
import { Application, compileController } from "raiton/core"
import { TasksController } from "../source/tasks/tasks.controller"

class MockReply {
  statusCode = 200
  headers = new Headers()
  body: any

  status(code: number) {
    this.statusCode = code
  }

  header(name: string, value: string) {
    this.headers.set(name, value)
  }

  send(body: any) {
    this.body = body
  }
}

const app = new Application({ prefix: "/api" })
compileController(TasksController, app)

const reply = new MockReply()
await app.handle(
  {
    method: "POST",
    url: "/api/tasks",
    headers: new Headers({ "content-type": "application/json" }),
    body: { title: "Test" },
  },
  reply,
)

expect(reply.statusCode).toBe(200)
```

This is the closest approach to production: body parser, middlewares and
validation are executed.

### By calling the method

To test an isolated rule, instantiate the controller with its dependencies and
call the method. The decorators do not intervene.

## Testing contracts

```ts
import { validateContract } from "raiton/contracts"
import { CreateTaskSchema } from "../source/tasks/tasks.contract"

it("rejette un titre vide", async () => {
  const result = await validateContract(CreateTaskSchema, { title: "" })
  expect(result.success).toBe(false)
  expect(result.issues[0].path).toBe("title")
})
```

Also test the full route to verify the `VALIDATION_ERROR` payload.

```ts
const reply = new MockReply()

await app.handle(
  {
    method: "POST",
    url: "/api/tasks",
    headers: new Headers({ "content-type": "application/json" }),
    body: { title: "" },
  },
  reply,
)

expect(reply.statusCode).toBe(400)
expect(reply.body.code).toBe("VALIDATION_ERROR")
expect(reply.body.details[0].path).toBe("title")
```

## Testing sockets and MCP

- **Sockets**: open a connection to a test server and verify the
  messages. Support varies by runtime.
- **MCP**: use the CLI conformance suite.

```bash
bun raiton mcp conformance --json
```

## Mocking time

For schedulers, avoid actually waiting. Test the business function
directly, then verify the job configuration via
`SchedulerManager.getJobs()`.

## CI

```yaml
- run: bun install --frozen-lockfile
- run: bun raiton doctor --json
- run: bun test
- run: bun raiton openapi export --out openapi.json
- run: bun raiton contract check --baseline contracts.baseline.json
```

## Good practices

- Test invalid cases as much as valid ones.
- One integration test per critical route.
- No real network in unit tests.
- Isolate environment variables.
- Check error codes, not just messages.

## See also

- [Contracts](/docs/contracts)
- [Error codes](/docs/errors)
- [Contracts CLI](/docs/cli-openapi)
