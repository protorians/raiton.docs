---
title: "Construire un serveur MCP"
description: "Exposer des outils métier à un agent IA, tester les deux transports et sécuriser les appels."
section: guides
order: 61
since: "6.0"
---

Ce guide transforme une API existante en serveur MCP accessible par un agent.

## 1. Écrire le serveur

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

L'outil `refund_invoice` est masqué tant que `exposeDestructive` n'est pas
activé.

## 2. Activer les outils destructifs

Dans `raiton.config.ts` :

```ts
export default {
  mcp: {
    exposeDestructive: true,
    rateLimitPerMinute: 60,
  },
}
```

Ou au niveau du serveur :

```ts
@McpServer({
  name: "billing",
  path: "/mcp/billing",
  exposeDestructive: true,
})
```

## 3. Vérifier en local

```bash
bun raiton mcp list
bun raiton mcp inspect billing --json
bun raiton mcp test billing.get_invoice --args '{"invoiceId":"inv_1"}'
```

La suite de conformité valide les deux transports :

```bash
bun raiton mcp conformance billing --json
```

## 4. Connecter un agent

### HTTP

Le serveur est exposé sur `POST /mcp/billing`. Un client MCP peut s'y connecter
directement, avec l'en-tête de corrélation habituel.

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

Pour un agent local qui démarre le serveur :

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

## 5. Sécuriser

- Fournissez `scopes` sur les outils sensibles.
- Laissez `destructiveHint` activé pour les opérations irréversibles.
- Activez `rateLimitPerMinute`.
- Vérifiez les journaux d'audit : les secrets sont expurgés.
- N'exposez pas un outil qui accepte du SQL ou un chemin arbitraire.

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

## 6. Documenter

Les serveurs MCP sont inclus dans le manifeste et dans OpenAPI (`x-mcp`). Ils
sont aussi générés dans `llms.txt` par :

```bash
bun raiton docs agents
```

## 7. Tester

```bash
bun raiton mcp conformance billing
bun raiton mcp test billing.get_invoice --args '{"invoiceId":"inv_1"}' --json
```

Ajoutez ces commandes à votre CI : une régression de protocole ou de schéma doit
faire échouer la pipeline.

## Voir aussi

- [MCP](/docs/mcp)
- [CLI MCP](/docs/cli-mcp)
- [Sécurité](/docs/security)
