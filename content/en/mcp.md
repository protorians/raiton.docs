---
title: "MCP (Model Context Protocol)"
description: "Expose tools, prompts and resources to AI clients over HTTP and stdio, with schemas, scopes, audit and rate limiting."
section: fonctionnalites
order: 24
since: "6.0"
---

Raiton ships an **MCP** server that coexists with the HTTP API in the same
process. Tools reuse dependency injection, HMR and the OpenAPI documentation.

## Create an MCP server

Create a `*.mcp.ts` file and decorate the class with `@McpServer()`:

```ts
import {
  McpArg,
  McpPrompt,
  McpResource,
  McpResourceTemplate,
  McpServer,
  McpTool,
} from "raiton/framework"

@McpServer({
  name: "math",
  version: "1.0.0",
  description: "Outils de calcul",
  path: "/mcp",
})
export class MathServer {
  @McpTool({ name: "add", description: "Additionne deux nombres" })
  add(
    @McpArg("a", "Premier opérande", Number) a: number,
    @McpArg("b", "Second opérande", Number) b: number,
  ) {
    return a + b
  }

  @McpPrompt({ name: "resume", description: "Résume un texte" })
  resume(@McpArg("text", "Texte à résumer", String) text: string) {
    return `Résume le texte suivant :\n\n${text}`
  }

  @McpResource({
    uri: "config://app",
    name: "Configuration",
    mimeType: "application/json",
  })
  config() {
    return { env: process.env.NODE_ENV }
  }

  @McpResourceTemplate({
    uriTemplate: "user://{id}",
    name: "Utilisateur par id",
  })
  user({ id }: { id: string }) {
    return this.users.find(id)
  }
}
```

The scanner detects the file, compiles the class and automatically mounts
`POST /mcp` and `GET /mcp` on the application.

## Tools

`@McpTool()` accepts:

| Option | Role |
|---|---|
| `name` | Exposed name (default: method name) |
| `description` | Description for the client |
| `inputSchema` | JSON schema or input contract |
| `outputSchema` | Structured output schema |
| `annotations` | `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` |
| `destructive` | Shorthand for a destructive tool |
| `scopes` | Scopes required to call the tool |

```ts
@McpTool({
  name: "refund",
  description: "Rembourse une commande",
  inputSchema: RefundInput,
  outputSchema: RefundOutput,
  scopes: ["payments:write"],
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
  },
})
refund(@McpArg("orderId", "Identifiant", String) orderId: string) {
  return this.payments.refund(orderId)
}
```

:::warning
A tool marked `destructiveHint: true` is **hidden by default**. To expose it,
enable `mcp.exposeDestructive: true` in `raiton.config.ts` or
`@McpServer({ exposeDestructive: true })`.
:::

## Arguments

`@McpArg(name, description?, metatype?)`:

- `String` → `string`
- `Number` → `number`
- `Boolean` → `boolean`
- `Array` → `array`
- `Object` → `object`

Without `@McpArg`, the method receives the complete input object as its first
argument.

```ts
@McpTool({ name: "search" })
search(input: { query: string; limit?: number }) {
  return this.index.search(input.query, input.limit)
}
```

## Transports

:::note
The **stdio** transport, tool schemas, scopes, audit and the conformance suite
were added in **6.9**. In 6.8 and earlier, only the Streamable HTTP transport is
available.
:::

The same registry is served by two transports:

| Transport | Usage | Command |
|---|---|---|
| Streamable HTTP | Remote clients, same port as the API | `POST /mcp` |
| stdio | Local agents that launch a subprocess | `raiton mcp serve math --stdio` |

```bash
bun raiton mcp list
bun raiton mcp inspect math --json
bun raiton mcp test math --tool add --args '{"a":2,"b":3}'
bun raiton mcp serve math --stdio
bun raiton mcp conformance math --json
```

The conformance suite checks both transports: `initialize`, `ping`,
`tools/list`, `tools/call`, `prompts`, `resources` and JSON-RPC errors.

## Security

- **Scopes**: verified when provided (`x-mcp-scopes` over HTTP, the transport
  context in stdio).
- **Audit**: every call is logged (tool, duration, actor, result) and secrets
  are redacted.
- **Rate limit**: `mcp.rateLimitPerMinute` or `@McpServer({ rateLimitPerMinute })`.
- **Destructive**: hidden by default.

```ts
export default {
  mcp: {
    exposeDestructive: false,
    rateLimitPerMinute: 60,
  },
}
```

## Protocol

The endpoint implements JSON-RPC 2.0:

- `initialize`, `ping`;
- `tools/list`, `tools/call`;
- `prompts/list`, `prompts/get`;
- `resources/list`, `resources/templates/list`, `resources/read`;
- `logging/setLevel`, `notifications/initialized`.

Supported versions include `2024-11-05`, `2025-03-26`, `2025-06-18` and
`2025-11-25`. An unsupported version returns `406`.

## HMR

`*.mcp.ts` files are hot-reloaded: modifying a tool does not restart the
process.

## See also

- [MCP guide](/docs/mcp-guide)
- [MCP CLI](/docs/cli-mcp)
- [OpenAPI](/docs/openapi)
