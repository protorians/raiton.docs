---
title: "CLI overview"
description: "Install and use the Raiton CLI: commands, output conventions, exit codes and project commands."
section: cli
order: 40
since: "6.0"
---

The Raiton CLI covers onboarding, code generation, development,
diagnostics, contracts and AI tooling.

```bash
bun raiton --help
bun raiton --version
```

## Commands

| Command | Role |
|---|---|
| [`new`](/docs/cli-new) | Create a project |
| [`generate`](/docs/cli-generate) | Generate an artifact |
| [`dev`](/docs/cli-dev) | Develop with HMR |
| [`build`](/docs/cli-dev) | Compile the project |
| [`start`](/docs/cli-dev) | Start in production |
| [`routes`](/docs/cli-inspect) | List routes |
| [`inspect`](/docs/cli-inspect) | Emit the manifest |
| [`why`](/docs/cli-inspect) | Explain a route |
| [`doctor`](/docs/cli-inspect) | Diagnose the project |
| [`artifact`](/docs/cli-inspect) | List artifacts |
| [`openapi export`](/docs/cli-openapi) | Export OpenAPI |
| [`client`](/docs/cli-openapi) | Generate a typed client |
| [`contract check/snapshot`](/docs/cli-openapi) | Check for breaks |
| [`mcp`](/docs/cli-mcp) | MCP tools |
| [`docs agents`](/docs/cli-mcp) | Generate `llms.txt`, `AGENTS.md`, … |

:::note
The `new`, `generate`, `inspect`, `why`, `doctor`, `openapi`, `client`,
`contract`, `mcp` and `docs agents` commands were generalized in **6.9**. In
earlier versions, the CLI focuses on `dev`, `build`, `start` and
`artifact`.
:::

## Conventions

### JSON output

Every machine command accepts `--json` and writes **a single JSON document** to
`stdout`. Logs and warnings go to `stderr`, which lets you parse
the output without filtering.

```bash
bun raiton inspect --json | jq '.routes | length'
bun raiton routes --json > routes.json
```

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Usage error |
| `2` | Missing prerequisite |
| `3` | File conflict |
| `4` | Diagnostic failure |

### Errors

JSON errors expose:

```json
{
  "code": "MISSING_RUNTIME",
  "message": "Bun is required for this command",
  "hint": "Install Bun or use the Node CLI",
  "docsUrl": "https://…",
  "location": { "file": "…", "line": 0 }
}
```

### Non-interactive mode

`new` and the generators accept `--yes`, `--dry-run` and `--force`. In CI,
always use `--yes` and check the plan with `--dry-run`.

## Runtimes

```bash
# Bun
bun raiton dev
bun raiton build
bun raiton start

# Node.js (CLI précompilée)
node build/bin/index.mjs dev
node build/bin/index.mjs start

# Deno
deno task dev
deno task start
```

## Project commands

Add your own commands in `commands/*.command.ts`:

```ts
// commands/seed.command.ts
export default {
  name: "seed",
  description: "Peuple la base de données",
  run: async () => {
    console.log("Seeding…")
  },
}
```

They are detected automatically by `RaitonCommands.harvest()`.

## Debugging the CLI

```bash
bun raiton doctor --json
bun raiton inspect --check
DEBUG=raiton:* bun raiton dev
```

## See also

- [Create a project](/docs/cli-new)
- [Generate code](/docs/cli-generate)
- [Inspect](/docs/cli-inspect)
