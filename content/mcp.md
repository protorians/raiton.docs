---
title: "MCP (Model Context Protocol)"
description: "Exposer des outils, prompts et ressources aux clients IA via HTTP et stdio, avec schémas, scopes, audit et limitation de débit."
section: fonctionnalites
order: 24
since: "6.0"
---

Raiton embarque un serveur **MCP** qui cohabite avec l'API HTTP sur le même
processus. Les outils réutilisent l'injection de dépendances, le HMR et la
documentation OpenAPI.

## Créer un serveur MCP

Créez un fichier `*.mcp.ts` et décorez la classe avec `@McpServer()` :

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

Le scanner détecte le fichier, compile la classe et monte automatiquement
`POST /mcp` et `GET /mcp` sur l'application.

## Outils

`@McpTool()` accepte :

| Option | Rôle |
|---|---|
| `name` | Nom exposé (défaut : nom de la méthode) |
| `description` | Description pour le client |
| `inputSchema` | Schéma JSON ou contrat d'entrée |
| `outputSchema` | Schéma de sortie structuré |
| `annotations` | `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` |
| `destructive` | Raccourci pour un outil destructif |
| `scopes` | Scopes requis pour appeler l'outil |

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
Un outil marqué `destructiveHint: true` est **masqué par défaut**. Pour
l'exposer, activez `mcp.exposeDestructive: true` dans `raiton.config.ts` ou
`@McpServer({ exposeDestructive: true })`.
:::

## Arguments

`@McpArg(name, description?, metatype?)` :

- `String` → `string`
- `Number` → `number`
- `Boolean` → `boolean`
- `Array` → `array`
- `Object` → `object`

Sans `@McpArg`, la méthode reçoit l'objet d'entrée complet en premier argument.

```ts
@McpTool({ name: "search" })
search(input: { query: string; limit?: number }) {
  return this.index.search(input.query, input.limit)
}
```

## Transports

:::note
Le transport **stdio**, les schémas d'outils, les scopes, l'audit et la suite de
conformité ont été ajoutés en **6.9**. En 6.8 et antérieur, seul le transport
Streamable HTTP est disponible.
:::

Le même registre est servi par deux transports :

| Transport | Usage | Commande |
|---|---|---|
| Streamable HTTP | Clients distants, même port que l'API | `POST /mcp` |
| stdio | Agents locaux qui lancent un sous-processus | `raiton mcp serve math --stdio` |

```bash
bun raiton mcp list
bun raiton mcp inspect math --json
bun raiton mcp test math --tool add --args '{"a":2,"b":3}'
bun raiton mcp serve math --stdio
bun raiton mcp conformance math --json
```

La suite de conformité vérifie les deux transports : `initialize`, `ping`,
`tools/list`, `tools/call`, `prompts`, `resources` et les erreurs JSON-RPC.

## Sécurité

- **Scopes** : vérifiés lorsqu'ils sont fournis (`x-mcp-scopes` en HTTP,
  contexte du transport en stdio).
- **Audit** : chaque appel est journalisé (outil, durée, acteur, résultat) et
  les secrets sont expurgés.
- **Rate limit** : `mcp.rateLimitPerMinute` ou `@McpServer({ rateLimitPerMinute })`.
- **Destructif** : masqué par défaut.

```ts
export default {
  mcp: {
    exposeDestructive: false,
    rateLimitPerMinute: 60,
  },
}
```

## Protocole

Le endpoint implémente JSON-RPC 2.0 :

- `initialize`, `ping` ;
- `tools/list`, `tools/call` ;
- `prompts/list`, `prompts/get` ;
- `resources/list`, `resources/templates/list`, `resources/read` ;
- `logging/setLevel`, `notifications/initialized`.

Les versions supportées incluent `2024-11-05`, `2025-03-26`, `2025-06-18` et
`2025-11-25`. Une version non supportée renvoie `406`.

## HMR

Les fichiers `*.mcp.ts` sont rechargés à chaud : modifier un outil ne redémarre
pas le processus.

## Voir aussi

- [Guide MCP](/docs/mcp-guide)
- [CLI MCP](/docs/cli-mcp)
- [OpenAPI](/docs/openapi)
