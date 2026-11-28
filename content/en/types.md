---
title: "Types"
description: "The public interfaces of raiton/types for typing the bootstrap, controllers, middlewares, plugins and jobs."
section: reference
order: 53
since: "6.0"
---

`raiton/types` groups the interfaces used in application code. Import
the types with `import type` to avoid unnecessary runtime imports.

```ts
import type {
  ThreadInterface,
  ApplicationInterface,
  ContextInterface,
  MiddlewareParametersInterface,
  PluginInterface,
  TaskContextInterface,
  QueueBackendInterface,
} from "raiton/types"
```

## ThreadInterface

```ts
interface ThreadInterface {
  application: ApplicationInterface | null
  runtime: RuntimeAdapterInterface | null
  runtimeServer: RuntimeServerInterface | null
  readonly appDir: string

  setup(options: { application: ApplicationInterface; runtime?: RuntimeType }): this
  run(): Promise<this>
  stop(): Promise<void>
  restart(): void
  sleep(ms: number): Promise<void>
  wait(condition: () => boolean, interval?: number): Promise<void>
}
```

Use it in `source/main.ts`:

```ts
export default async function main(thread: ThreadInterface) {
  return await thread.setup({ application: app }).run()
}
```

## ApplicationInterface

Describes the HTTP application: `config`, `setOption`, `register`, `use`, `route`,
the HTTP shortcuts and `handle`.

## ContextInterface

```ts
interface ContextInterface {
  req: RuntimeRequestInterface
  reply: RuntimeReplyInterface
  state: Record<string, any>

  decorate<T>(key: string, value: T): void
  get<T>(key: string): T
  send(body: any): void
}
```

| Member | Role |
|---|---|
| `req` | Normalized request |
| `reply` | Normalized response |
| `state` | Shared data |
| `decorate` | Immutable value |
| `get` | Read `state` or a decoration |
| `send` | Send a response |

## MiddlewareParametersInterface

```ts
interface MiddlewareParametersInterface {
  context: RequestContext
  next: () => Promise<void>
}
```

## PluginInterface

```ts
interface PluginInterface {
  name?: string
  setup(scope: PluginScope): void
}
```

## RouteHandlerCallable

```ts
type RouteHandlerCallable = (context: ContextInterface) => any | Promise<any>
```

## TaskContextInterface

```ts
interface TaskContextInterface<T = any> {
  id: string
  name: string
  queue?: string
  payload?: T
  data?: any
  trigger: "cron" | "interval" | "timeout" | "task"
  attempt: number
  scheduledAt: Date
  startedAt: Date
  scheduler: SchedulerControlInterface
}
```

## QueueBackendInterface

```ts
interface QueueBackendInterface {
  readonly name: string
  connect(): Promise<void>
  disconnect(): Promise<void>
  enqueue(queue: string, message: any): Promise<string>
  dequeue(queue: string, options?: any): Promise<QueueMessageInterface[]>
  acknowledge(queue: string, receipt: string): Promise<void>
  reject(queue: string, receipt: string, requeue?: boolean): Promise<void>
  length(queue: string): Promise<number>
  purge(queue: string): Promise<void>
}
```

## ConfigurableInterface

Corresponds to `raiton.config.ts`. See [Configuration](/docs/configuration) for
the field table.

## RuntimeType

```ts
enum RuntimeType {
  Bun = "bun",
  Node = "node",
  Deno = "deno",
}
```

## Contract types

```ts
import type { Infer, TSchema, ContractSchema, ContractIssue } from "raiton/contracts"

type User = Infer<typeof UserSchema>
```

## Good practices

- `import type` for anything that only exists at compile time.
- Type handlers with `ContextInterface` when you are not using the parameter
  decorators.
- Type plugins with `PluginInterface`.
- Type tasks with `TaskContextInterface<Payload>`.

## See also

- [Core API](/docs/core-api)
- [Decorators](/docs/decorators)
- [Contracts](/docs/contracts)
