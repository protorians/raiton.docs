---
title: "Architecture of a production API"
description: "Modular monolith, composition root, HTTP boundary and background tasks: the decisions behind a Raiton API actually running in production."
section: guides
order: 59
since: "6.0"
---

This page does not start from a toy example. It synthesizes the architecture of
a Raiton API actually running in production: a central multi-tenant API that
covers identity, organizations, permissions, billing, payment, messaging and
about ten business modules.

The technical context is as follows:

- Bun and TypeScript, PostgreSQL via Prisma;
- about fifty modules, several hundred routes;
- `class-validator` DTOs and ViewModels for output;
- signed webhooks, application schedulers and job queues;
- a containerized deployment behind a reverse proxy.

Raiton does not impose this organization. However, as soon as the project
exceeds a few dozen routes, three constraints come back systematically:
**separate the modules**, **control the container's evaluation order** and
**keep the HTTP boundary thin**.

## 1. A modular monolith, not folders by type

The `controllers/`, `services/`, `repositories/` structure remains readable for
a small API. On a production API, it scatters a single domain across four
folders and blurs the boundaries. The real API therefore groups each domain into
a module, then splits the module into layers:

```text
source/
├── main.ts
├── modules/
│   ├── identity/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/        # interfaces (ports)
│   │   │   └── enums/
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   ├── infrastructure/
│   │   │   ├── persistence/         # implémentations Prisma
│   │   │   ├── gateways/            # clients HTTP, e-mail, stockage
│   │   │   ├── security/
│   │   │   └── schedulers/
│   │   └── presentation/
│   │       ├── controllers/
│   │       ├── vm/                  # ViewModels de sortie
│   │       └── middlewares/
│   ├── organization/
│   ├── access-control/
│   └── billing/
└── shared/
    ├── infrastructure/
    │   ├── database/
    │   ├── di/                      # composition root
    │   ├── cors/
    │   ├── scheduling/
    │   └── webhooks/
    └── presentation/
        ├── decorators/
        ├── middlewares/
        ├── plugins/
        └── responses/
```

The dependency rule matters more than the tree structure:

| Layer | May depend on | Must not depend on |
|---|---|---|
| `domain` | TypeScript, domain types | Raiton, Prisma, HTTP |
| `application` | `domain`, ports, injectable services | Controllers, `Request`, `Reply` |
| `infrastructure` | `domain`, `application`, external SDKs | `presentation` |
| `presentation` | `application`, `domain` (types) | concrete `infrastructure` |

A use case must not know about HTTP. It receives values, applies the business
rule and throws a business error. The controller translates that error into an
HTTP status. This separation makes it possible to test the business logic
without a server, and to change transport without rewriting the rules.

:::tip
A module = a business context, not a technical folder. If two modules share a
rule, place it in `shared` only when it is truly cross-cutting (time, money,
identifiers, audit).
:::

## 2. The composition root: container evaluation order

Raiton scans controllers and runs decorators when modules are loaded. A file
that is never imported is never evaluated: its `@Injectable()` is not
registered, and resolution fails with a message such as:

```text
Dependency PrismaUserRepository not registered
```

This is not a scanner bug: the framework cannot guess that a concrete
implementation exists if no module references it. The real API therefore
centralizes imports in a **composition root** imported before everything else:

```ts
// source/shared/infrastructure/di/composition-root.ts
// Ce module importe les implémentations concrètes pour que leurs décorateurs
// s'exécutent avant la compilation des contrôleurs.
import "@/modules/identity/infrastructure/persistence/prisma-user.repository"
import "@/modules/identity/application/session-refresh-token.service"
import "@/modules/organization/infrastructure/persistence/prisma-organization.repository"
import "@/modules/access-control/infrastructure/persistence/prisma-role.repository"
import "@/shared/infrastructure/database/prisma.service"
import "@/shared/infrastructure/scheduling/module-scheduler-gate.service"
```

```ts
// source/main.ts
import "reflect-metadata"
import "@/shared/infrastructure/di/composition-root"
import { Application } from "raiton/core/application"
```

A few rules that avoid ordering errors:

- import the composition root **before** creating the `Application`;
- import adapters before the services that consume them when a service resolves
  a dependency at startup;
- keep one file per module or one commented block per domain;
- do not put logic in the composition root: imports only.

Controllers, for their part, are detected by the scanner thanks to the
`.controller.ts` suffix. Their dependencies must be registered by the
composition root, even if the controller is never explicitly imported.

## 3. One controller = one HTTP intention

The real API often uses **one controller per route** rather than a large CRUD
controller. This may be surprising, but it is consistent with OpenAPI, tests and
code review: each file carries an intention, its documentation decorators and
its test.

```ts
// source/modules/identity/presentation/controllers/sign-in.controller.ts
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  Body,
  Controllable,
  HttpStatus,
  Post,
  RaitonResponses,
  Req,
  RouteInteraction,
} from "raiton/framework"
import { plainToInstance } from "class-transformer"
import { SignInDto } from "@/modules/identity/application/dtos/sign-in.dto"
import SignInUseCase from "@/modules/identity/application/use-cases/sign-in.use-case"
import { UserVm } from "@/modules/identity/presentation/vm/user.vm"
import { fail } from "@/shared/presentation/responses/http-error.response"

@ApiTags("Authentication")
@Controllable("/auth/sign-in")
export default class SignInController {
  constructor(private readonly service: SignInUseCase) {}

  @Post("/")
  @RouteInteraction("[username] est désormais connecté")
  @ApiOperation({
    summary: "Authenticate user",
    description: "Valide les identifiants et retourne une session.",
  })
  @ApiBody(SignInDto)
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  @ApiResponse({ status: 429, description: "Trop de tentatives" })
  async login(@Body() body: SignInDto, @Req() req: Request) {
    try {
      const userAgent = req.headers.get("user-agent")
      if (!userAgent) throw new Error("Appareil non supporté")

      const result = await this.service.login(userAgent, body, req)
      result.user = plainToInstance(UserVm, result.user, {
        excludeExtraneousValues: true,
      })

      return RaitonResponses("Connexion réussie", result, HttpStatus.OK)
    } catch (error) {
      // Lève une HttpException : le statut HTTP réel est posé par Raiton.
      fail(error)
    }
  }
}
```

Key points:

- `@Controllable("/auth/sign-in")` sets the prefix; `@Post("/")` adds the final
  route. The file name does not influence the URL.
- The default export is optional, but it makes the file easy to import in a test
  or a composition root. The scanner mounts the exported class.
- Constructor injection works without `@Inject()` when `emitDecoratorMetadata`
  is enabled: the parameter type is enough.
- `@RouteInteraction()` does not change routing; it describes the action in the
  logs and the manifest.
- The controller does not compute the business rule. It validates the HTTP
  boundary, calls the use case, formats the output and translates errors.

:::note
One controller per route is a choice, not an obligation. For a homogeneous CRUD,
one controller per resource remains more readable. The useful criterion is the
**cohesion of intention**: if the routes share the same dependencies and the
same documentation, keep them together.
:::

## 4. The use case carries the business rule

The use case receives dependencies through the constructor, applies the rules
and throws explicit exceptions. It never returns an HTTP response object.

```ts
// source/modules/identity/application/use-cases/sign-in.use-case.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  PasswordAlgoEnum,
} from "raiton/framework"
import { UserRepository } from "@/modules/identity/domain/repositories/user.repository"
import { AuthRateLimiterService } from "@/modules/identity/infrastructure/security/auth-rate-limiter.service"
import { PasswordService } from "@/shared/infrastructure/security/password.service"
import { SessionRefreshTokenService } from "@/modules/identity/application/session-refresh-token.service"

@Injectable()
export default class SignInUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
    private readonly rateLimiter: AuthRateLimiterService,
    private readonly refreshTokens: SessionRefreshTokenService,
  ) {}

  async login(userAgent: string, data: SignInDto, req: any) {
    const keys = [this.rateLimiter.ipKey(req.ip), this.rateLimiter.identityKey(data.email)]

    const lockedFor = this.rateLimiter.lockRemainingSeconds(keys)
    if (lockedFor) {
      throw new HttpException(
        `Trop de tentatives. Réessayez dans ${lockedFor} secondes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    const user = await this.users.findByAnyIdentifier(data)
    if (!user?.passwordHashed) {
      this.rateLimiter.registerFailure(keys)
      throw new HttpException("Identifiants invalides", HttpStatus.UNAUTHORIZED)
    }

    const valid = await this.passwords.verify(
      data.password,
      user.passwordHashed,
      user.passwordEncryption as PasswordAlgoEnum,
    )
    if (!valid) {
      this.rateLimiter.registerFailure(keys)
      throw new HttpException("Identifiants invalides", HttpStatus.UNAUTHORIZED)
    }

    this.rateLimiter.clear(keys)
    return this.refreshTokens.openSession(user, userAgent, req)
  }
}
```

Three habits that pay off:

- **one exception, one status**: `HttpException` carries the status and an
  optional business code; the controller does not have to guess;
- **side effects are explicit**: audit, notification, idempotency and
  transaction are visible in the use case;
- **expected errors are not 500s**: an unknown identifier, a quota reached or a
  conflict has a dedicated status.

See [Responses and errors](/docs/responses) and
[Validation and DTO](/docs/validation).

## 5. The HTTP status trap with `RaitonResponses`

`RaitonResponses()` builds a response **body**. In versions 6.8 and earlier, it
does not set the HTTP status: a call that returns
`RaitonResponses("Erreur", null, 500)` returns `200 OK` with `statusCode: 500`
in the body. A client that relies on the status therefore considers the failure
a success.

The real API's rule is simple:

| Situation | Mechanism |
|---|---|
| Success | `RaitonResponses(message, data, HttpStatus.OK)` |
| Expected business error | `throw new HttpException(message, status)` |
| Unexpected error | let it bubble up, or `fail(error)` |
| Raw response (file, CSV) | `@Reply()` and `reply.send(...)` |

```ts
// source/shared/presentation/responses/http-error.response.ts
import { HttpException, HttpStatus } from "raiton/framework"

export function fail(
  error: unknown,
  fallbackStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): never {
  if (error instanceof HttpException) throw error

  const candidate = error as any
  const status = candidate?.status ?? candidate?.statusCode ?? fallbackStatus

  throw new HttpException(
    typeof candidate?.message === "string"
      ? candidate.message
      : "Erreur interne du service.",
    (Number.isInteger(status) && status >= 400 && status <= 599
      ? status
      : fallbackStatus) as HttpStatus,
  )
}
```

:::note
Raiton 6.9 respects the `statusCode` carried by a returned object. The
"error = `HttpException`" rule is nonetheless preferable: it is compatible with
all versions, explicit in tests and readable in the logs.
:::

## 6. Security at the boundary

The bootstrapper is where global security is configured. It must remain
readable: one constant per subject, then a chain of `use()` and `register()`.

```ts
// source/main.ts (extrait)
import { env } from "raiton/framework/env"
import {
  Application,
  openApiPlugin,
  RuntimeType,
  Security,
  httpsLan,
  HttpsGenerator,
  CSRFModeEnum,
} from "raiton/framework"
import { RawBodyPlugin } from "@/shared/presentation/plugins/raw-body.plugin"

const CORS_HEADERS = [
  "Content-Type",
  "Accept",
  "Authorization",
  "X-Device",
  "X-API-KEY",
  "X-API-TOKEN",
  "X-Organization-Id",
  "X-CSRF-Token",
  "X-Client-Type",
  "X-Request-Id",
  "Idempotency-Key",
]

const isNativeOrigin = (origin: string): boolean =>
  origin === "null" ||
  ["file:", "capacitor:", "tauri:", "ionic:", "expo:", "app:"].some((scheme) =>
    origin.startsWith(scheme),
  )

export default async (thread: ThreadInterface) => {
  const isDevelopment = env("NODE_ENV") === "development"
  const allowedOrigins = (env("CORS_ORIGIN", "") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  const app = new Application({
    port: env<number>("APP_PORT", 5711, "int"),
    prefix: "/api",
    https: isDevelopment ? httpsLan({ generator: HttpsGenerator.Mkcert }) : undefined,
  })
    .use(Security.headers)
    .use(RawBodyPlugin)
    .use(
      Security.cors({
        origin: (origin) =>
          allowedOrigins.includes(origin) || isNativeOrigin(origin),
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        headers: CORS_HEADERS,
        credentials: true,
        exposeHeaders: ["X-Request-Id"],
      }),
    )
    .use(
      Security.csrf({
        mode: CSRFModeEnum.DOUBLE_SUBMIT,
        secret: env("CSRF_SECRET", ""),
        cookieName: "_csrf",
        headerName: "X-CSRF-Token",
        ttl: 86_400_000,
        methods: ["POST", "PUT", "PATCH", "DELETE"],
        // Webhook serveur-à-serveur : ni session ni cookie CSRF.
        // La requête est authentifiée par la signature HMAC du corps.
        skip: ["/api/kyc/webhooks"],
        cookieOptions: {
          httpOnly: false,
          secure: !isDevelopment,
          sameSite: "lax",
          path: "/",
        },
        client: {
          headerName: "X-Client-Type",
          skipClients: ["mobile", "desktop"],
        },
      }),
    )
    .use(Security.rateLimit({ windowMs: 60_000, max: 300 }))
    .use(Security.bodyLimit(Number(env("APP_BODY_LIMIT_MB", "100")) * 1024 * 1024))
    .use(
      openApiPlugin({
        title: "@liorian/api-core",
        version: "0.149.0",
        endpoint: "/docs/json",
      }),
    )

  return await thread.setup({ application: app, runtime: RuntimeType.Bun }).run()
}
```

Why these choices:

- **CORS with credentials**: `origin: "*"` is forbidden as soon as
  `credentials: true`. Use a function that compares an explicit list and accepts
  the native origins of mobile/desktop webviews.
- **Explicit headers**: the browser preflight rejects a header that is not
  listed. Add `Idempotency-Key` or `X-Request-Id` as soon as a client sends them.
- **Targeted CSRF**: signed webhooks have no cookie. Exempt only the exact path,
  then verify the signature in the use case.
- **Native clients**: `skipClients` avoids requiring a CSRF token from mobile
  and desktop applications that do not use a cookie.
- **Body limit**: keep the limit below `Bun.serve`'s internal ceiling (128 MB).
  A higher application ceiling is never reached.

See [Security](/docs/security) for the details of the options.

### Capturing the raw body of a signed webhook

An HMAC webhook signs the **exact bytes** of the body. If the body parser
deserializes and then you re-serialize, the key order or the numbers may change
and the signature fails. The real API adds an `onRequest` plugin that stores the
raw body before parsing, only on the relevant paths:

```ts
// source/shared/presentation/plugins/raw-body.plugin.ts (principe)
export const RawBodyPlugin = {
  name: "raw-body-plugin",
  setup(scope) {
    scope.addHook("onRequest", async (ctx) => {
      const pathname = new URL(ctx.req.url, "http://localhost").pathname
      if (!pathname.startsWith("/api/kyc/webhooks")) return

      const bytes = new Uint8Array(await new Response(ctx.req.body).arrayBuffer())
      ctx.req.rawBody = new TextDecoder().decode(bytes)
      ctx.req.body = bytes // le body parser retrouve un corps exploitable
    })
  },
}
```

The plugin is mounted with `.use(RawBodyPlugin)` before the body parser. It
never duplicates a 100 MB upload: capture is limited to the declared prefixes.

## 7. Authentication and composed permissions

The real API's guards are not isolated decorators: a `@UserAccessGuard()`
decorator composes several middlewares in the right order.

```ts
export function UserAccessGuard(options: { organization?: boolean } = {}) {
  return (target: any, key?: string, descriptor?: any) => {
    Middleware(SessionGuard)(target, key, descriptor)
    Middleware(UserActivityMiddleware)(target, key, descriptor)

    if (options.organization) {
      // Lit `context.state.user`, publié par SessionGuard juste avant.
      Middleware(CurrentOrganizationMiddleware)(target, key, descriptor)
    }
  }
}
```

Usage:

```ts
@ApiTags("Access Control")
@Controllable("/access-control")
@UserAccessGuard({ organization: true })
export default class GetMyPermissionsController {
  constructor(private readonly useCase: GetMyPermissionsUseCase) {}

  @Get("/me/permissions")
  @ReadOnlyPermission("Role")
  async handle(@Req() req: any) {
    return RaitonResponses(
      "Permissions effectives",
      await this.useCase.execute(req.user.id, req.organizationId),
      HttpStatus.OK,
    )
  }
}
```

:::warning
The order of middleware decorators matters. Raiton executes the decorator stack
from the one closest to the method to the farthest. A custom decorator placed
**above** `@UserAccessGuard()` may therefore run before the session is resolved
and fail. Compose the guards into a single decorator, or verify the order with
an integration test.
:::

Permissions must not be deduced from the role on the controller side. The
permission middleware queries the role registry and fails with `403` and a
stable message. The controller remains readable: it declares the intention
(`@ReadOnlyPermission("Role")`) and calls the use case.

## 8. Background tasks and startup

A declarative scheduler is handy for cron jobs. Long-running or database-driven
processing (reminders, synchronizations, GC) are often
`@Injectable(SINGLETON)` services started explicitly by the bootstrapper:

```ts
try {
  const bootstrap = await Application.container.resolve(NativeDeploymentBootstrapService)
  await bootstrap.bootstrap()
} catch (error) {
  Logger.error("Échec de l'amorçage du profil de déploiement.", error)
}

try {
  await Application.container.resolve(ReminderSchedulerService)
} catch (error) {
  Logger.error("Échec du démarrage du scheduler de rappels.", error)
}
```

Three rules:

- **a background task failure does not block the server**: log it and continue,
  unless the task is essential to security;
- **disable tasks during the build**: `LIORIAN_RUN_BACKGROUND=false` prevents a
  `raiton build` from opening connections and consuming the database;
- **check the module's eligibility** before arming a job: a scheduler for an
  inactive module must not run.

See [Scheduler and queues](/docs/scheduler).

## 9. Configuration and secrets

Production configuration is validated before the port is opened. Secrets have
no default value:

```ts
import { env } from "raiton/framework/env"

function required(key: string): string {
  const value = env<string>(key)
  if (!value) throw new Error(`Variable d'environnement obligatoire : ${key}`)
  return value
}

const config = {
  port: env<number>("APP_PORT", 5711, "int"),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  csrfSecret: required("CSRF_SECRET"),
  corsOrigin: required("CORS_ORIGIN"),
  bodyLimitMb: env<number>("APP_BODY_LIMIT_MB", 100, "int"),
}
```

:::warning
`env()` converts booleans in a basic way: the string `"false"` is considered
true. Compare `env("FLAG", "false") === "true"` explicitly. See
[Environment variables](/docs/environment).
:::

The categories to separate in the environment file:

- **identity and secrets**: `JWT_SECRET`, `CSRF_SECRET`, encryption keys;
- **infrastructure**: `DATABASE_URL`, `REDIS_URL`, `S3_*`;
- **HTTP boundary**: `CORS_ORIGIN`, `CORS_HEADERS`, `APP_BODY_LIMIT_MB`;
- **business**: quotas, delays, alert addresses;
- **deployment**: `PORT`, `NODE_ENV`, bootstrap flags.

## 10. Test without a server, then with the server

Two levels are enough in most cases.

**Unit test of the use case**: instantiate it with fake repositories. No
container, no port, no database.

```ts
import { describe, expect, it } from "bun:test"
import SignInUseCase from "../sign-in.use-case"

describe("SignInUseCase", () => {
  it("refuse un mot de passe invalide", async () => {
    const useCase = new SignInUseCase(
      fakeUsers({ passwordHashed: "hash" }),
      fakePasswords({ verify: async () => false }),
      fakeRateLimiter(),
      fakeRefreshTokens(),
    )

    await expect(useCase.login("test-agent", dto, req)).rejects.toMatchObject({
      statusCode: 401,
    })
  })
})
```

**HTTP test**: mount the controller with `compileController` and check both the
status and the body. A test that only checks `reply.body` lets the `200 OK` trap
described above slip through.

```ts
const app = new Application({ prefix: "/api" })
compileController(SignInController, app)

const reply = new MockReply()
await app.handle(
  {
    method: "POST",
    url: "/api/auth/sign-in",
    headers: new Headers({ "content-type": "application/json" }),
    body: { email: "a@b.c", password: "wrong" },
  },
  reply,
)

expect(reply.statusCode).toBe(401)
expect(reply.body.error).toBe(true)
```

See [Tests](/docs/testing) for response mocks and contracts.

## Production readiness checklist

- [ ] Each module has separate `domain`, `application`, `infrastructure` and
  `presentation`.
- [ ] Concrete implementations are imported by the composition root.
- [ ] Controllers contain no business rule.
- [ ] Expected errors throw an `HttpException` with the right status.
- [ ] Success responses go through `RaitonResponses`.
- [ ] CORS, CSRF, rate limit and body limit are configured in `main.ts`.
- [ ] Signed webhooks capture the raw body before parsing.
- [ ] Schedulers are resolved at startup and fail without blocking.
- [ ] Mandatory secrets are validated before the port is opened.
- [ ] HTTP tests check the status **and** the body.
- [ ] `bun raiton doctor` and `bun test` pass in CI.

## See also

- [Project structure](/docs/project-structure)
- [Application and lifecycle](/docs/application)
- [Dependency injection](/docs/injection)
- [Security](/docs/security)
- [Responses and errors](/docs/responses)
- [Deployment](/docs/deployment)
