---
title: "Routing and controllers"
description: "Declare controllers with @Controllable, use HTTP decorators, URL parameters, and manual routing."
section: concepts
order: 11
since: "6.0"
---

A Raiton controller is a class decorated with `@Controllable(prefix)`. Each
method decorated with `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`,
`@Head`, or `@Trace` becomes a route.

```ts
import { Controllable, Get, Post, Param, Body } from "raiton/framework"

@Controllable("/users")
export class UsersController {
  @Get("/")
  list() {
    return []
  }

  @Get("/:id")
  getOne(@Param("id") id: string) {
    return { id }
  }

  @Post("/")
  create(@Body() payload: { name: string }) {
    return payload
  }
}
```

With `prefix: "/api"`, these routes are exposed at:

| Method | Path |
|---|---|
| `GET` | `/api/users` |
| `GET` | `/api/users/:id` |
| `POST` | `/api/users` |

## Naming convention

The scanner recognizes `*.controller.ts` (or `.js`) files. The file name does not
dictate the URL: only the `@Controllable` prefix matters.

```text
source/controllers/users.controller.ts  →  @Controllable("/users")
```

An empty prefix is valid for root routes:

```ts
@Controllable()
export class HealthController {
  @Get("/health")
  check() {
    return { status: "healthy" }
  }
}
```

## Thin controller, injected use case

On a real API, the controller does not contain the business rule. It receives a
use case via its constructor, validates the HTTP boundary, and formats the
response. Type-based injection works without `@Inject()` if
`emitDecoratorMetadata` is enabled.

```ts
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  Body,
  Controllable,
  HttpStatus,
  Post,
  RaitonResponses,
  RouteInteraction,
} from "raiton/framework"
import { SignInDto } from "@/modules/identity/application/dtos/sign-in.dto"
import SignInUseCase from "@/modules/identity/application/use-cases/sign-in.use-case"

@ApiTags("Authentication")
@Controllable("/auth/sign-in")
export default class SignInController {
  constructor(private readonly service: SignInUseCase) {}

  @Post("/")
  @RouteInteraction("[username] est désormais connecté")
  @ApiOperation({ summary: "Authentifier un utilisateur" })
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  async login(@Body() body: SignInDto) {
    const session = await this.service.login(body)
    return RaitonResponses("Connexion réussie", session, HttpStatus.OK)
  }
}
```

- `@RouteInteraction()` describes the action in the manifest and logs; it does
  not modify the route.
- The default export is optional. It makes imports easier in a test or a
  composition root, but the scanner mounts every exported class.
- For a business error, prefer `throw new HttpException(...)`:
  `RaitonResponses` describes a body, not the HTTP status. See
  [Responses and errors](/docs/responses).

:::tip
One controller per intent (one route) makes OpenAPI and testing easier; one
controller per resource remains more readable for a homogeneous CRUD. The
criterion is the cohesion of dependencies and documentation.
:::

## URL parameters

The `:name` segments are captured and passed via `@Param("name")`.

```ts
@Get("/:userId/posts/:postId")
getPost(
  @Param("userId") userId: string,
  @Param("postId") postId: string,
) {
  return { userId, postId }
}
```

The router prioritizes static routes over parameterized routes: `/users/me`
wins over `/users/:id`, regardless of declaration order.

## Prefix and pathname

`Application` applies two transformations before matching:

1. `pathname` is removed from the beginning of the path;
2. `prefix` is added to each route upon registration.

```ts
new Application({ prefix: "/api", pathname: "/app" })
// GET /app/api/users/42 → route /users/:id
```

## Route versions

Routing helpers accept an optional version:

```ts
app.get("/users", v1Handler, "v1")
app.get("/users", v2Handler, "v2")
```

For a fully versioned API, prefer explicit prefixes (`@Controllable("/v1/users")`):
they are visible in the URL, in OpenAPI, and in the generated client.

## Manual routes

Routes without a controller are still possible:

```ts
app.get("/health", () => ({ status: "ok" }))
app.post("/webhooks/stripe", async (ctx) => {
  const signature = ctx.req.headers.get("stripe-signature")
  return { received: true }
})
```

Use them for very simple endpoints or webhooks. For everything else, a
controller keeps the code testable and documented.

## 404 responses and suggestions

When no route matches, Raiton returns a 404 error. In development, the response
can suggest the closest route (for example `/users/42` instead of `/user/42`).
This help is computed from the mounted routes and is never exposed in production.

## Common routing errors

| Symptom | Cause |
|---|---|
| Missing route | File without a `.controller.ts` suffix |
| `404` on `/users` | Global prefix added twice |
| Empty `@Param` | Different segment name (`:id` vs `@Param("userId")`) |
| Route conflict | Two controllers with the same prefix and the same path |

## See also

- [Request parameters](/docs/parameters)
- [Responses and errors](/docs/responses)
- [OpenAPI](/docs/openapi)
