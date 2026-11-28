---
title: "Dependency injection"
description: "Declare injectable services, choose a lifecycle, inject via constructor or property and handle shutdown."
section: concepts
order: 13
since: "6.0"
---

Raiton ships with a dependency injection container. Controllers are registered
automatically; services, repositories and adapters must be marked with
`@Injectable()`.

```ts
import { Injectable } from "raiton/framework"

@Injectable()
export class UsersService {
  private users = [{ id: "1", name: "Alice" }]

  findAll() {
    return this.users
  }
}
```

## Lifecycles

`@Injectable(lifetime?, name?, scope?)` accepts a `LifetimeEnum` imported from
`@protorians/core`:

| Lifecycle | Behavior |
|---|---|
| `LifetimeEnum.TRANSIENT` | A new instance on each resolution. **Default.** |
| `LifetimeEnum.SINGLETON` | One instance shared per scope. |

```ts
import { LifetimeEnum } from "@protorians/core"
import { Injectable } from "raiton/framework"

@Injectable(LifetimeEnum.SINGLETON)
export class DatabaseService {
  private connection?: Connection

  onMount() {
    this.connection = connect(process.env.DATABASE_URL!)
  }

  async onUnmount() {
    await this.connection?.close()
  }
}
```

:::warning
The default for `@Injectable()` is **transient**, not singleton. For a service
that opens a connection, a pool or a cache, explicitly declare
`LifetimeEnum.SINGLETON`.
:::

## Inject a dependency

```ts
import { Controllable, Get, Inject } from "raiton/framework"

@Controllable("/users")
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  @Get("/")
  list() {
    return this.users.findAll()
  }
}
```

`@Inject()` with no argument infers the type from `design:paramtypes`
(constructor) or `design:type` (property). Use an explicit token when the type
is an interface, a generic or a configurable value.

```ts
export const DATABASE = Symbol("database")

@Injectable()
export class UserRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
}
```

Property injection:

```ts
@Injectable()
export class ReportService {
  @Inject() private readonly users!: UsersService
}
```

## Register manually

```ts
import { Injection } from "raiton/core"
import { LifetimeEnum } from "@protorians/core"

Injection.registry("mailer", MailService, LifetimeEnum.SINGLETON)
Injection.registry("request-scope", RequestService, LifetimeEnum.TRANSIENT)

const mailer = Injection.get<MailService>("mailer")
```

| Method | Role |
|---|---|
| `registry(name, construct, lifetime?, scope?)` | Register a class |
| `get(name, scope?)` | Resolve an instance |
| `has(name)` | Check existence |
| `resolve(construct)` | Resolve from a constructor |
| `clear()` | Empty the container |
| `shutdown()` | Call `onUnmount()` then empty |

## Composition root: guarantee registration

The scanner mounts controllers, but it only evaluates files that are actually
imported. A concrete implementation decorated with `@Injectable()` but never
referenced does not register itself, and resolution fails:

```text
Dependency PrismaUserRepository not registered
```

On a modular API, create a composition module that imports the concrete
implementations, then import it first in `main.ts`:

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
import { Application } from "raiton/core"
```

A few rules:

- import the composition root **before** creating the `Application`;
- when a service resolves a dependency at startup, import the adapter
  before the service;
- put no logic in the composition root, only imports;
- keep a commented block per domain to find the implementation.

### Start a service at boot

`Application.container` points to `Injection`. Use `resolve()` to explicitly
start a scheduler or a worker:

```ts
try {
  await Application.container.resolve(ReminderSchedulerService)
} catch (error) {
  console.error("Scheduler indisponible", error)
}
```

A background service failure must not prevent the server from listening, unless
that service carries a security guarantee.

## Instance lifecycle

If an instance exposes these methods, the container calls them:

| Method | Timing |
|---|---|
| `onInit()` | After creation |
| `onMount()` | After property injection |
| `onUnmount()` | When the thread stops |

```ts
@Injectable(LifetimeEnum.SINGLETON)
export class CacheService {
  onInit() {
    console.log("cache initialisé")
  }

  onMount() {
    this.warmup()
  }

  async onUnmount() {
    await this.flush()
  }
}
```

## Circular dependencies

The container detects cycles and throws an explicit error:

```text
Circular dependency detected: a -> b -> a
```

Fix the cycle by introducing a third dependency, going through an event, or
resolving one of the two sides on demand with `Injection.get()`.

## Best practices

- One service = one business responsibility.
- Controllers stay thin: they orchestrate, they do not compute.
- Repositories encapsulate persistence.
- Services that carry state use `SINGLETON`.
- Stateless services can remain `TRANSIENT`.

## See also

- [Application and lifecycle](/docs/application)
- [Plugins](/docs/plugins)
- [Tests](/docs/testing)
