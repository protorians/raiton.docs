---
title: "raiton generate"
description: "Generate controllers, services, repositories, DTOs, MCP tools, tests and complete resources."
section: cli
order: 42
since: "6.9"
---

`raiton generate` creates an artifact in the project structure.

```bash
bun raiton generate <type> <name>
```

| Type | Generated file |
|---|---|
| `controller` | `*.controller.ts` |
| `service` | `*.service.ts` |
| `repository` | `*.repository.ts` |
| `dto` | `*.dto.ts` |
| `mcp-tool` | `*.mcp.ts` |
| `test` | `*.test.ts` |
| `resource` | Controller + service + repository + DTO + test |

## Examples

```bash
bun raiton generate controller users
bun raiton generate service billing
bun raiton generate mcp-tool payments
bun raiton generate resource invoices
```

For `resource`, the files are created in the conventional folders:

```text
source/
├── controllers/invoices.controller.ts
├── services/invoices.service.ts
├── repositories/invoices.repository.ts
├── dtos/create-invoice.dto.ts
└── tests/invoices.test.ts
```

## Options

| Option | Role |
|---|---|
| `--dry-run` | Show the plan without writing |
| `--force` | Overwrite an existing file |
| `--json` | Machine output |

```bash
bun raiton generate resource users --dry-run
bun raiton generate resource users --force
```

## What a generated controller contains

```ts
import { Controllable, Get } from "raiton/framework"

@Controllable("/users")
export class UsersController {
  @Get("/")
  list() {
    return []
  }
}
```

The generator adapts the prefix, the class name and the imports to the requested
type. It does not guess your business rules: the generated code is a starting
point, not a complete implementation.

## In CI

```bash
bun raiton generate resource invoices --dry-run --json
```

Check the plan before writing to a shared repository.

## Best practices

- Generate when creating a domain, not for every field.
- Rename the files before versioning them if the name does not match the
  domain.
- Complete the input and output contract immediately.
- Add the test before the business logic.

## See also

- [Project structure](/docs/project-structure)
- [Contracts](/docs/contracts)
- [Tests](/docs/testing)
