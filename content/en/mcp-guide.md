---
title: "Building an MCP server"
description: "Expose business tools to an AI agent, test both transports and secure calls."
section: guides
order: 61
since: "6.0"
---

This guide turns an existing API into an MCP server accessible to an agent.

## 1. Write the server

```ts
// source/billing/billing.mcp.ts
import {
  Inject,
  McpArg,
  McpResource,
  McpServer,
  McpTool,
} from "raiton/framework"
import { BillingService } from "./billing.service"

@McpServer({
  name: "billing",
  version: "1.0.0",
  description: "Outils de facturation",
  path: "/mcp/billing",
  rateLimitPerMinute: 60,
})
export class BillingMcp {
  constructor(@Inject(BillingService) private readonly billing: BillingService) {}

  @McpTool({
    name: "get_invoice",
    description: "Récupère une facture par son identifiant",
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  getInvoice(@McpArg("invoiceId", "Identifiant de facture", String) invoiceId: string) {
    return this.billing.findInvoice(invoiceId)
  }

  @McpTool({
    name: "refund_invoice",
    description: "Rembourse une facture",
    scopes: ["billing:write"],
    annotations: { destructiveHint: true, idempotentHint: false },
  })
  refund(@McpArg("invoiceId", "Identifiant de facture", String) invoiceId: string) {
    return this.billing.refund(invoiceId)
  }

  @McpResource({
    uri: "billing://summary",
    name: "Résumé de facturation",
    mimeType: "application/json",
  })
  summary() {
    return this.billing.summary()
  }
}
```

The `refund_invoice` tool is hidden until `exposeDestructive` is enabled.

## 2. Enable destructive tools

In `raiton.config.ts`:

```ts
export default {
  mcp: {
    exposeDestructive: true,
    rateLimitPerMinute: 60,
  },
}
```

Or at the server level:

```ts
@McpServer({
  name: "billing",
  path: "/mcp/billing",
  exposeDestructive: true,
})
```

## 3. Verify locally

```bash
bun raiton mcp list
bun raiton mcp inspect billing --json
bun raiton mcp test billing.get_invoice --args '{"invoiceId":"inv_1"}'
```

The conformance suite validates both transports:

```bash
bun raiton mcp conformance billing --json
```

## 4. Connect an agent

### HTTP

The server is exposed at `POST /mcp/billing`. An MCP client can connect to it
directly, with the usual correlation header.

```json
{
  "mcpServers": {
    "billing": {
      "url": "http://localhost:5711/api/mcp/billing"
    }
  }
}
```

### stdio

For a local agent that starts the server:

```json
{
  "mcpServers": {
    "billing": {
      "command": "bun",
      "args": ["raiton", "mcp", "serve", "billing", "--stdio"]
    }
  }
}
```

## 5. Secure it

- Provide `scopes` on sensitive tools.
- Leave `destructiveHint` enabled for irreversible operations.
- Enable `rateLimitPerMinute`.
- Check the audit logs: secrets are redacted.
- Do not expose a tool that accepts SQL or an arbitrary path.

```ts
@McpTool({
  name: "run_report",
  scopes: ["reports:read"],
  annotations: { readOnlyHint: true },
})
runReport(@McpArg("id", "Identifiant", String) id: string) {
  if (!/^[a-z0-9_-]+$/.test(id)) throw new Error("Invalid report id")
  return this.reports.run(id)
}
```

## 6. Document

MCP servers are included in the manifest and in OpenAPI (`x-mcp`). They are
also generated into `llms.txt` by:

```bash
bun raiton docs agents
```

## 7. Test

```bash
bun raiton mcp conformance billing
bun raiton mcp test billing.get_invoice --args '{"invoiceId":"inv_1"}' --json
```

Add these commands to your CI: a protocol or schema regression must fail the
pipeline.

## See also

- [MCP](/docs/mcp)
- [MCP CLI](/docs/cli-mcp)
- [Security](/docs/security)
