---
title: "MCP et documentation pour agents"
description: "Lister, inspecter, tester et servir des serveurs MCP, et générer llms.txt, AGENTS.md et les références machines."
section: cli
order: 46
since: "6.9"
---

Le CLI expose les serveurs MCP pour le développement et les agents locaux.

## `mcp list`

```bash
bun raiton mcp list
bun raiton mcp list --json
```

Liste les serveurs, leurs outils, prompts et ressources.

## `mcp inspect`

```bash
bun raiton mcp inspect math
bun raiton mcp inspect math --json
```

Affiche les schémas d'entrée/sortie, les annotations de sûreté, les scopes et
l'état d'exposition (un outil destructif est masqué par défaut).

## `mcp test`

```bash
bun raiton mcp test math.add --args '{"a":2,"b":3}'
bun raiton mcp test add --args '{"a":2,"b":3}' --scopes payments:write
```

| Option | Rôle |
|---|---|
| `--args <json>` | Arguments de l'outil |
| `--scopes <scopes>` | Scopes séparés par des virgules |
| `--json` | Sortie machine |

La cible accepte `<server>.<tool>` ou `<tool>` quand le nom est unique.

## `mcp serve`

```bash
bun raiton mcp serve math --stdio
```

Lance le transport **stdio** pour les clients qui démarrent le serveur comme
sous-processus (Claude Desktop, IDE, agents locaux).

Le transport HTTP reste disponible sur le chemin déclaré (`/mcp`).

## `mcp conformance`

```bash
bun raiton mcp conformance
bun raiton mcp conformance math --json
```

Exécute la même suite sur HTTP et stdio :

- `initialize`, `ping` ;
- `tools/list`, `tools/call` ;
- `prompts/list`, `prompts/get` ;
- `resources/list`, `resources/read` ;
- erreurs JSON-RPC et outil inconnu.

Utilisez-la dans le CI pour détecter une régression de protocole.

## `docs agents`

```bash
bun raiton docs agents
bun raiton docs agents --out docs
bun raiton docs agents --check
```

Génère :

- `llms.txt` — index court pour les agents ;
- `llms-full.txt` — documentation complète ;
- `AGENTS.md` — instructions pour les agents ;
- `CLAUDE.md` — variante Claude ;
- les schémas JSON et les références CLI.

`--check` échoue si la documentation générée est obsolète.

## Configuration

```ts
export default {
  mcp: {
    exposeDestructive: false,
    rateLimitPerMinute: 60,
  },
}
```

## En CI

```bash
bun raiton mcp conformance --json
bun raiton docs agents --check
```

## Voir aussi

- [MCP](/docs/mcp)
- [Guide MCP](/docs/mcp-guide)
- [Manifeste](/docs/manifest)
