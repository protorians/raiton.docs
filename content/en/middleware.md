---
title: "Middleware and guards"
description: "Intercept requests with Koa-style middleware, attach them to a controller or a route, and protect access with @Guard."
section: concepts
order: 14
since: "6.0"
---

A middleware receives the request context and a `next()` function. It can read
the request, enrich `context.state`, send a response or let the chain continue.

```ts
app.use(async ({ context, next }) => {
  const startedAt = Date.now()
  await next()
  context.reply.header("x-response-time", `${Date.now() - startedAt}ms`)
})
```

## Signature

```ts
interface MiddlewareParametersInterface {
  context: RequestContext
  next: () => Promise<void>
}
```

A middleware **must** call `await next()` to pass the request along. If it sends
a response without calling `next()`, the chain stops.

## Execution order

```text
1. body parser (hook preParsing)
2. plugins de sécurité (enregistrés au démarrage)
3. middlewares des plugins
4. app.use(...)
5. @Middleware sur le contrôleur
6. @Middleware sur la méthode
7. handler de la route
8. onSend / onResponse
```

The registration order matters: an authentication middleware must be added
before a middleware that reads `context.state.user`.

## Global middleware

```ts
app.use(async ({ context, next }) => {
  context.state.requestStartedAt = performance.now()
  await next()
})
```

## Controller middleware

```ts
import { Controllable, Get, Middleware } from "raiton/framework"

const auth = async ({ context, next }) => {
  const token = context.req.headers.get("authorization")
  if (!token) {
    context.reply.status(401)
    return context.reply.send({
      statusCode: 401,
      error: true,
      message: "Unauthorized",
      data: null,
    })
  }
  context.state.user = { id: "1", role: "admin" }
  await next()
}

@Controllable("/admin")
@Middleware(auth)
export class AdminController {
  @Get("/dashboard")
  dashboard() {
    return { ok: true }
  }
}
```

## Route middleware

```ts
const rateLimited = async ({ context, next }) => {
  if (isAbused(context.req)) {
    context.reply.status(429)
    return context.reply.send({ error: true, message: "Too many requests" })
  }
  await next()
}

@Get("/expensive")
@Middleware(rateLimited)
compute() {
  return { ok: true }
}
```

## Guards

`@Guard()` attaches a named guard. The guard returns `true` to allow the
request; otherwise, Raiton responds with `403 Forbidden`.

```ts
import { Controllable, Get, Guard } from "raiton/framework"

@Controllable("/billing")
export class BillingController {
  @Get("/invoices")
  @Guard({
    name: "billing:read",
    handler: async ({ context }) => {
      return context.state.user?.role === "admin"
    },
  })
  invoices() {
    return []
  }
}
```

The name identifies the guard in the registry. The same guard can be reused
across several routes. Guards are implemented as middleware: they therefore run
in the order described above.

### Compose a business guard

When several middleware need to chain together (session, activity, current
organization), expose a single decorator rather than stacking decorators on the
controller:

```ts
import { Middleware } from "raiton/framework"

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

```ts
@Controllable("/access-control")
@UserAccessGuard({ organization: true })
export default class GetMyPermissionsController {
  @Get("/me/permissions")
  handle(@Req() req: any) {
    return { userId: req.user.id, organizationId: req.organizationId }
  }
}
```

:::warning
The order of decorators matters. Raiton runs the decorator stack from the one
closest to the method to the furthest away. A decorator placed above
`@UserAccessGuard()` may therefore run before the session is resolved. Compose
the order in a single decorator and cover it with an integration test.
:::

## Lifecycle hooks

Plugins can register hooks that are more fine-grained than middleware:

| Hook | Timing |
|---|---|
| `onRequest` | Request received, before parsing |
| `preParsing` | Before reading the body |
| `preHandler` | Before the handler, after parsing |
| `onSend` | Before sending the response |
| `onResponse` | After sending |

```ts
scope.addHook("onResponse", async (ctx) => {
  metrics.observe(ctx.state.duration)
})
```

## Handling errors

An exception thrown in a middleware is caught by `Application` and converted
into a JSON response. For full control, send the response yourself:

```ts
app.use(async ({ context, next }) => {
  try {
    await next()
  } catch (error) {
    context.reply.status(500)
    context.reply.send({
      statusCode: 500,
      error: true,
      message: error instanceof Error ? error.message : "Internal error",
      data: null,
    })
  }
})
```

## Best practices

- Keep middleware short and focused.
- Use `context.state` rather than global variables.
- Do not put business logic in a middleware.
- Prefer a named guard for reusable access rules.
- Check the registration order when several middleware depend on each other.

## See also

- [Plugins](/docs/plugins)
- [Security](/docs/security)
- [Responses and errors](/docs/responses)
