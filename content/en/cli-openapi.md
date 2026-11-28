---
title: "OpenAPI, client and contracts"
description: "Export OpenAPI, generate a typed client and detect contract breaks in CI."
section: cli
order: 45
since: "6.9"
---

Three commands form the contract chain:

```bash
bun raiton openapi export --out openapi.json
bun raiton client --out ./sdk
bun raiton contract check --baseline openapi.json
```

## `openapi export`

```bash
bun raiton openapi export \
  --out openapi.json \
  --title "Users API" \
  --version "1.0.0" \
  --description "API publique"
```

| Option | Role |
|---|---|
| `--out <file>` | Write the document |
| `--title` | OpenAPI title |
| `--version` | API version |
| `--description` | Description |
| `--force` | Overwrite |
| `--dry-run` | Show the plan |
| `--json` | Document on stdout |

The document is built from the routes actually mounted and the
`@Input` / `@Output` contracts.

## `client`

```bash
bun raiton client --out ./sdk --base-url http://localhost:5711/api
```

| Option | Default | Role |
|---|---|---|
| `--out` | `./sdk` | Directory |
| `--name` | `RaitonClient` | Error prefix |
| `--base-url` | — | Default URL |
| `--force` | `false` | Overwrite |
| `--dry-run` | `false` | Plan |
| `--json` | `false` | Machine output |

See [Typed client](/docs/client) for the generated usage.

## `contract snapshot`

```bash
bun raiton contract snapshot --out contracts.baseline.json
```

Writes the current state as a reference. Use `--force` to replace an
existing baseline.

## `contract check`

```bash
bun raiton contract check --baseline contracts.baseline.json
bun raiton contract check --baseline contracts.baseline.json --json
```

Detects:

- deleted routes;
- deleted or renamed fields;
- incompatibly changed types;
- responses that change status.

The command fails with a non-zero code on a break.

## Recommended pipeline

```yaml
# .github/workflows/contracts.yml
jobs:
  contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun raiton openapi export --out openapi.json
      - run: bun raiton contract check --baseline contracts.baseline.json
      - run: bun raiton client --out ./sdk --force
      - run: git diff --exit-code ./sdk
```

## Best practices

- Version the baseline and the generated client.
- Regenerate the baseline only on a deliberate change.
- Review `openapi.json` during code review.
- Document errors in the contracts.

## See also

- [OpenAPI](/docs/openapi)
- [Typed client](/docs/client)
- [Contracts](/docs/contracts)
