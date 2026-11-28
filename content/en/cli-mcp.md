---
title: "MCP and documentation for agents"
description: "List, inspect, test and serve MCP servers, and generate llms.txt, AGENTS.md and machine references."
section: cli
order: 46
since: "6.9"
---

The CLI exposes MCP servers for development and local agents.

## `mcp list`

```bash
bun raiton mcp list
bun raiton mcp list --json
```

Lists the servers, their tools, prompts and resources.

## `mcp inspect`

```bash
bun raiton mcp inspect math
bun raiton mcp inspect math --json
```

Displays the input/output schemas, the safety annotations, the scopes and the
exposure state (a destructive tool is hidden by default).

## `mcp test`

```bash
bun raiton mcp test math.add --args '{"a":2,"b":3}'
bun raiton mcp test add --args '{"a":2,"b":3}' --scopes payments:write
```

| Option | Role |
|---|---|
| `--args <json>` | Tool arguments |
| `--scopes <scopes>` | Comma-separated scopes |
| `--json` | Machine output |

The target accepts `<server>.<tool>` or `<tool>` when the name is unique.

## `mcp serve`

```bash
bun raiton mcp serve math --stdio
```

Starts the **stdio** transport for clients that launch the server as a
subprocess (Claude Desktop, IDE, local agents).

The HTTP transport remains available on the declared path (`/mcp`).

## `mcp conformance`

```bash
bun raiton mcp conformance
bun raiton mcp conformance math --json
```

Runs the same suite over HTTP and stdio:

- `initialize`, `ping`;
- `tools/list`, `tools/call`;
- `prompts/list`, `prompts/get`;
- `resources/list`, `resources/read`;
- JSON-RPC errors and unknown tool.

Use it in CI to catch a protocol regression.

## `docs agents`

```bash
bun raiton docs agents
bun raiton docs agents --out docs
bun raiton docs agents --check
```

Generates:

- `llms.txt` — short index for agents;
- `llms-full.txt` — complete documentation;
- `AGENTS.md` — instructions for agents;
- `CLAUDE.md` — Claude variant;
- the JSON schemas and the CLI references.

`--check` fails if the generated documentation is stale.

## Configuration

```ts
export default {
  mcp: {
    exposeDestructive: false,
    rateLimitPerMinute: 60,
  },
}
```

## In CI

```bash
bun raiton mcp conformance --json
bun raiton docs agents --check
```

## See also

- [MCP](/docs/mcp)
- [MCP guide](/docs/mcp-guide)
- [Manifest](/docs/manifest)
