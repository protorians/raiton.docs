---
title: "OpenAPI"
description: "Generate an OpenAPI contract from your routes and contracts, expose a Redoc interface and export the document."
section: fonctionnalites
order: 22
since: "6.0"
---

Raiton generates an OpenAPI document from mounted routes, `@Input` / `@Output`
contracts and documentation decorators.

## Register the plugin

```ts
import { openApiPlugin } from "raiton/framework"

app.use(openApiPlugin({
  route: "/docs",
  ui: defaultOpenApiUi, // générateur HTML (Redoc, Swagger UI…)
  endpoint: "/docs/json",
  title: "Users API",
  version: "1.0.0",
  description: "API de démonstration",
}))
```

| Option | Default | Description |
|---|---|---|
| `route` | — | HTML interface. Also requires `ui` |
| `ui` | — | HTML generator for the interface |
| `endpoint` | `/docs/json` | JSON document. `false` to disable |
| `title` | `API` | Document title |
| `version` | `1.0.0` | API version |
| `description` | — | Description |
| `contact`, `license`, `termsOfService` | — | OpenAPI metadata |

`route` is only served if `ui` is provided. If you only want the JSON document
(a common case behind a portal or an external client generator), omit `route`
and `ui`:

```ts
app.use(openApiPlugin({
  title: "API Core",
  version: "0.149.0",
  endpoint: "/docs/json",
}))
```

Paths are relative to the application prefix. With `prefix: "/api"` and
`route: "/docs"`, the interface is served at `/api/docs` and the JSON at
`/api/docs/json`.

:::note
`register()` and `use()` both accept a plugin. For OpenAPI, `use()` shares the
current scope and makes the routes visible at the same level as the rest of the
application. Use the same form throughout the bootstrapper.
:::

## Automatic contracts

The `@Input` and `@Output` schemas feed the `requestBody` and the responses
directly:

```ts
@Post("/")
@Input(CreateUserSchema)
@Output(UserSchema)
create(@Body() input: CreateUser) {
  return this.users.create(input)
}
```

No additional OpenAPI decorator is needed.

## Documentation decorators

```ts
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from "raiton/framework"

@ApiTags("users")
@Controllable("/users")
export class UsersController {
  @Get("/:id")
  @ApiOperation({ summary: "Récupérer un utilisateur" })
  @ApiParam("id", { in: "path", description: "Identifiant", required: true, type: String })
  @ApiQuery("expand", { description: "Relations à inclure", required: false, type: String })
  @ApiOkResponse("Utilisateur trouvé", Object)
  @ApiNotFoundResponse("Utilisateur introuvable")
  getOne(@Param("id") id: string) {
    return this.users.find(id)
  }
}
```

| Decorator | Scope |
|---|---|
| `@ApiTags(...tags)` | Controller or method |
| `@ApiOperation(options)` | Method |
| `@ApiResponse({ status, description, type, isArray })` | Method |
| `@ApiOkResponse(description, type?, isArray?)` | Method |
| `@ApiCreatedResponse(...)`, `@ApiNotFoundResponse(...)` | Method |
| `@ApiParam(name, { in, description, required, type })` | Method |
| `@ApiQuery(name, options)` | Method |
| `@ApiBody(type, description?, required?)` | Method |
| `@ApiProperty(options)` | DTO property |
| `@ApiSecurity(...schemes)` | Controller or method |

## Health checks and MCP

- `@HealthCheck()` endpoints are documented with the `Health` tag by default.
- MCP servers add an `x-mcp` extension listing tools, prompts and resources.

## Export the document

:::note
The `raiton openapi export` command was added in **6.9**. The Redoc interface
and the plugin's JSON endpoint exist in earlier versions.
:::

```bash
bun raiton openapi export --out openapi.json
```

The generated file can be versioned, published or consumed by an external
client generator. See [`raiton openapi`](/docs/cli-openapi).

## Best practices

- Describe the important errors (`400`, `401`, `403`, `404`, `409`).
- Keep stable `operationId`s.
- Do not document internal routes (`excludeFromDocs` on health checks).
- Version the `openapi.json` file to detect contract breaks.

## See also

- [Contracts](/docs/contracts)
- [Typed client](/docs/client)
- [OpenAPI CLI](/docs/cli-openapi)
