---
title: "Decorators"
description: "Complete reference of Raiton decorators: controllers, routes, parameters, injection, middlewares, cache, sockets, MCP, scheduler, health checks and OpenAPI."
section: reference
order: 50
since: "6.0"
---

All decorators are exported by `raiton/framework`, except `@Input` and
`@Output` which come from `raiton/contracts`.

:::note
This reference covers version 6.10. Some decorators are newer
than others: `@HealthCheck` (6.6), `@Cache` (6.7), `@Scheduler`, `@Cron`,
`@Every`, `@Timeout`, `@Task` (6.8), `@Input` and `@Output` (6.9).
:::

```ts
import {
  Controllable, Get, Post, Body, Param,
  Injectable, Inject, Middleware, Guard,
  Cache, Socket, OnSocketMessage,
  McpServer, McpTool, McpArg,
  Scheduler, Cron, Every, Task,
  HealthCheck,
} from "raiton/framework"

import { Input, Output } from "raiton/contracts"
```

## Controllers and routes

| Decorator | Target | Role |
|---|---|---|
| `@Controllable(prefix)` | Class | Declares an HTTP controller |
| `@Get(path?)` | Method | GET route |
| `@Post(path?)` | Method | POST route |
| `@Put(path?)` | Method | PUT route |
| `@Patch(path?)` | Method | PATCH route |
| `@Delete(path?)` | Method | DELETE route |
| `@Options(path?)` | Method | OPTIONS route |
| `@Head(path?)` | Method | HEAD route |
| `@Trace(path?)` | Method | TRACE route |
| `@RouteInteraction(template)` | Method | Describes a readable interaction |

```ts
@Controllable("/articles")
export class ArticlesController {
  @Get("/:slug")
  @RouteInteraction("[user.name] a lu [article.title]")
  read(@Param("slug") slug: string) {
    return this.articles.find(slug)
  }
}
```

## Parameters

| Decorator | Role |
|---|---|
| `@Param("id")` | URL parameter |
| `@Query("page")` | Query string |
| `@Body()` | Parsed body |
| `@Headers("authorization")` | Header |
| `@Cookie("session")` | Cookie |
| `@Req()` | Raw request |
| `@Reply()` | Raw response |
| `@UploadedFile()` | Multipart file |

## Injection

| Decorator | Role |
|---|---|
| `@Injectable(lifetime?, name?, scope?)` | Registers a class in the container |
| `@Inject(token?)` | Injects into a parameter or a property |

```ts
import { LifetimeEnum } from "@protorians/core"

@Injectable(LifetimeEnum.SINGLETON)
export class UsersService {}
```

## Middleware and guards

| Decorator | Role |
|---|---|
| `@Middleware(fn)` | Attaches a middleware to a class or method |
| `@Guard({ name, handler })` | Named access guard |
| `@CsrfToken()` | Exposes the CSRF token |
| `@CsrfGuard(options?)` | Verifies the CSRF token |

## Cache

| Decorator | Role |
|---|---|
| `@Cache(options?)` | Caches a route response |

```ts
@Get("/featured")
@Cache({ ttl: 60_000, vary: ["accept-language"] })
featured() {}
```

## Contracts

| Decorator | Role |
|---|---|
| `@Input(schema | { body?, query?, params?, headers? })` | Validates the input |
| `@Output(schema)` | Validates the output (dev by default) |

## Sockets

| Decorator | Role |
|---|---|
| `@Socket(namespace?)` | Declares a socket controller |
| `@OnSocketConnect()` | Connection |
| `@OnSocketDisconnect()` | Disconnection |
| `@OnSocketMessage(name?)` | Message |
| `@OnSocketEvent(name)` | Named event |

## MCP

| Decorator | Role |
|---|---|
| `@McpServer(options?)` | Declares an MCP server |
| `@McpTool(options?)` | Exposes a tool |
| `@McpPrompt(options?)` | Exposes a prompt |
| `@McpResource(options)` | Exposes a resource |
| `@McpResourceTemplate(options)` | Exposes a resource template |
| `@McpArg(name, description?, metatype?)` | Describes an argument (alias `@McpArgument`) |

## Scheduler

| Decorator | Role |
|---|---|
| `@Scheduler(options?)` | Declares a scheduler |
| `@Cron(expression, options?)` | Cron job |
| `@Every(interval, options?)` | Periodic job (alias `@Interval`) |
| `@Timeout(delay, options?)` | Deferred one-shot job |
| `@Task(name, options?)` | Named task |

## Health checks

| Decorator | Role |
|---|---|
| `@HealthCheck(options?)` | Qualifies a health endpoint |

## OpenAPI

| Decorator | Role |
|---|---|
| `@ApiTags(...tags)` | Controller or method tags |
| `@ApiOperation(options)` | Summary, description, operationId |
| `@ApiResponse({ status, description, type, isArray })` | Response |
| `@ApiOkResponse(description?, type?, isArray?)` | `200` shortcut |
| `@ApiCreatedResponse(...)` | `201` shortcut |
| `@ApiBadRequestResponse(...)` | `400` shortcut |
| `@ApiUnauthorizedResponse(...)` | `401` shortcut |
| `@ApiForbiddenResponse(...)` | `403` shortcut |
| `@ApiNotFoundResponse(...)` | `404` shortcut |
| `@ApiInternalServerErrorResponse(...)` | `500` shortcut |
| `@ApiParam(name, { in, ... })` | Parameter |
| `@ApiQuery(name, options)` | Query parameter |
| `@ApiBody(type, description?, required?)` | Body |
| `@ApiProperty(options)` | DTO property |
| `@ApiSecurity(...schemes)` | Security requirements |

## Decorator order

TypeScript decorators apply from bottom to top. For a route, place the HTTP
decorator first (the topmost) and the metadata afterwards:

```ts
@Get("/:id")
@Cache({ ttl: 30_000 })
@Guard({ name: "read", handler: canRead })
@ApiOperation({ summary: "Lire un article" })
read() {}
```

## See also

- [Core API](/docs/core-api)
- [Contracts](/docs/contracts)
- [MCP](/docs/mcp)
