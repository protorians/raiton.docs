---
title: "Parameters and context"
description: "Extract request data with @Param, @Query, @Body, @Headers, @Cookie, @Req and @Reply."
section: concepts
order: 12
since: "6.0"
---

Parameter decorators extract data from the request and inject it into the
method's arguments. They save you from manipulating the `Request` object by
hand.

## Available decorators

| Decorator | Source | Example |
|---|---|---|
| `@Param("id")` | URL parameters | `/users/:id` |
| `@Query("page")` | Query string | `?page=2` |
| `@Body()` | Parsed body | JSON, form, text |
| `@Headers("authorization")` | HTTP headers | `Authorization` |
| `@Cookie("session")` | Cookies | `session=…` |
| `@Req()` | Raw request | `Request` / Node wrapper |
| `@Reply()` | Raw response | `reply.status()`, `reply.send()` |
| `@UploadedFile()` | Multipart file | `File` |

```ts
import { Controllable, Get, Param, Query, Headers } from "raiton/framework"

@Controllable("/search")
export class SearchController {
  @Get("/:index")
  search(
    @Param("index") index: string,
    @Query("q") query?: string,
    @Query("limit") limit?: string,
    @Headers("accept-language") locale?: string,
  ) {
    return { index, query, limit: Number(limit ?? 20), locale }
  }
}
```

## The request body

The body parser is registered automatically by `thread.setup()`. It handles:

- `application/json`
- `application/x-www-form-urlencoded`
- `multipart/form-data`
- `text/plain`

```ts
@Post("/")
create(@Body() payload: { name: string }) {
  return payload
}
```

A `POST` without a body produces `{}` rather than an error. For a typed DTO,
the router instantiates the class declared on the argument:

```ts
import { DataTransferObject } from "raiton/framework"

class CreateUserDto extends DataTransferObject {
  name!: string
  email!: string
}

@Post("/")
create(@Body() payload: CreateUserDto) {
  return payload // instance de CreateUserDto
}
```

The DTO must extend `DataTransferObject` to be hydrated and validated. See
[Validation and DTO](/docs/validation).

## Raw request and response

`@Reply()` gives access to the runtime's response API:

```ts
@Get("/export")
exportCsv(@Reply() reply: any) {
  reply.type("text/csv")
  reply.header("content-disposition", "attachment; filename=users.csv")
  return reply.send("id,name\n1,Alice")
}
```

`@Req()` exposes the normalized request:

```ts
@Get("/whoami")
whoami(@Req() req: any) {
  return {
    method: req.method,
    url: req.url,
    ip: req.remoteAddress,
    userAgent: req.headers.get("user-agent"),
  }
}
```

## Context and state

Handlers also receive the full context if they declare an undecorated `ctx`
argument:

```ts
@Get("/me")
me(ctx: any) {
  return {
    user: ctx.state.user,
    requestId: ctx.state.requestId,
  }
}
```

`context.state` is a free-form object shared by middleware and the handler.
`context.decorate(key, value)` adds an immutable value to the context.

## Headers and cookies

Headers and cookies are case-sensitive depending on the runtime; Raiton's
accessors normalize the names.

```ts
@Get("/session")
session(@Cookie("session") session?: string) {
  return { authenticated: Boolean(session) }
}
```

To set a cookie, use the `set-cookie` header via `@Reply()`:

```ts
@Post("/login")
login(@Reply() reply: any) {
  reply.header(
    "set-cookie",
    "session=abc; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600",
  )
  return { ok: true }
}
```

## Parameter validation

Parameter decorators do not validate default values. Use an `@Input` contract
to validate the body, query, parameters or headers:

```ts
@Input({
  query: t.object({ page: t.integer().min(1).optional() }),
  params: t.object({ id: t.string().uuid() }),
})
```

See [Schema-first contracts](/docs/contracts).

## See also

- [Routing](/docs/routing)
- [Validation and DTO](/docs/validation)
- [Contracts](/docs/contracts)
