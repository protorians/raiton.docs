---
title: "raiton new"
description: "Create a complete Raiton project with a template, a runtime and an optional installation."
section: cli
order: 41
since: "6.9"
---

`raiton new` creates a project that is ready to start: structure, configuration,
example controller, scripts, test and dependencies.

```bash
bunx raiton new my-api --template api --runtime bun --yes
cd my-api
bun raiton dev
```

In a project that already has `raiton` as a dependency, `bun raiton …` is
enough. From an empty directory, use `bunx raiton …` (or `npx raiton …`).

## Options

| Option | Default | Role |
|---|---|---|
| `--template <template>` | `api` | `api`, `minimal`, `mcp-agent` |
| `--runtime <runtime>` | detected | `bun`, `node`, `deno` |
| `--dir <directory>` | `./<name>` | Target directory |
| `--yes` | `false` | Non-interactive mode |
| `--offline` | `false` | Do not access the network |
| `--no-install` | `false` | Do not install the dependencies |
| `--force` | `false` | Overwrite existing files |
| `--dry-run` | `false` | Show the plan without writing |
| `--json` | `false` | Machine output |

## Templates

### `api`

The complete template:

```text
my-api/
├── source/
│   ├── controllers/users.controller.ts
│   ├── services/users.service.ts
│   ├── repositories/users.repository.ts
│   ├── dtos/create-user.dto.ts
│   └── main.ts
├── tests/users.test.ts
├── raiton.config.ts
├── tsconfig.json
└── package.json
```

It includes a health check, an example contract and a test.

### `minimal`

A bootstrapper and a `hello` route. Ideal for understanding the lifecycle
without unnecessary code.

### `mcp-agent`

An MCP server with an example tool, a prompt and a resource. The template is
ready for `raiton mcp serve`.

## Examples

```bash
# Projet Bun complet
bun raiton new billing-api --template api --runtime bun --yes

# Projet minimal Node
bun raiton new demo --template minimal --runtime node --yes

# Agent MCP
bun raiton new tools --template mcp-agent --yes

# Vérifier le plan en CI
bun raiton new demo --dry-run --json
```

## Behavior

1. Resolves the target directory and checks for conflicts.
2. Writes the template files.
3. Adapts `raiton.config.ts` and the scripts to the runtime.
4. Installs the dependencies (`bun`, `npm`, `pnpm` or `deno` depending on the
   runtime).
5. Displays the next commands.

With `--no-install`, step 4 is skipped. With `--offline`, no network request is
made.

## In CI

```bash
bun raiton new fixture --template api --runtime bun --yes --no-install --json
```

The JSON output contains the directory, the created files, the runtime and the
template.

## See also

- [Installation](/docs/installation)
- [Project structure](/docs/project-structure)
- [raiton generate](/docs/cli-generate)
