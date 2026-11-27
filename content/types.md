---
title: "Types"
description: "Les interfaces publiques de raiton/types pour typer le bootstrap, les contrôleurs, les middlewares, les plugins et les jobs."
section: reference
order: 53
since: "6.0"
---

`raiton/types` regroupe les interfaces utilisées dans le code applicatif. Importez
les types avec `import type` pour éviter les imports runtime inutiles.

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

Utilisez-le dans `source/main.ts` :

```ts
export default async function main(thread: ThreadInterface) {
  return await thread.setup({ application: app }).run()
}
```

## ApplicationInterface

Décrit l'application HTTP : `config`, `setOption`, `register`, `use`, `route`,
les raccourcis HTTP et `handle`.

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

| Membre | Rôle |
|---|---|
| `req` | Requête normalisée |
| `reply` | Réponse normalisée |
| `state` | Données partagées |
| `decorate` | Valeur immuable |
| `get` | Lire `state` ou une décoration |
| `send` | Envoyer une réponse |

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

Correspond à `raiton.config.ts`. Voir [Configuration](/docs/configuration) pour
la table des champs.

## RuntimeType

```ts
enum RuntimeType {
  Bun = "bun",
  Node = "node",
  Deno = "deno",
}
```

## Types de contrats

```ts
import type { Infer, TSchema, ContractSchema, ContractIssue } from "raiton/contracts"

type User = Infer<typeof UserSchema>
```

## Bonnes pratiques

- `import type` pour tout ce qui n'existe qu'à la compilation.
- Typer les handlers avec `ContextInterface` quand vous n'utilisez pas les
  décorateurs de paramètres.
- Typer les plugins avec `PluginInterface`.
- Typer les tâches avec `TaskContextInterface<Payload>`.

## Voir aussi

- [API core](/docs/core-api)
- [Décorateurs](/docs/decorators)
- [Contrats](/docs/contracts)
