---
title: "Typed client"
description: "Generate an `any`-free TypeScript client from your application's manifest and OpenAPI contracts."
section: fonctionnalites
order: 23
since: "6.9"
---

`raiton client` generates a TypeScript module from the project's routes and
contracts. The client does not depend on any runtime: it uses `fetch`.

```bash
bun raiton client --out ./sdk
```

The generated file contains:

- input and output types derived from the schemas;
- one function per route;
- `configureClient()` for the base URL and headers;
- a typed error class (`RaitonClientError` by default).

## Using the client

```ts
import { configureClient, getUsers, postUsers } from "./sdk"

configureClient({
  baseUrl: "http://localhost:5711/api",
  headers: {
    authorization: `Bearer ${process.env.TOKEN}`,
  },
})

const users = await getUsers()

const user = await postUsers({
  email: "alice@example.com",
  name: "Alice",
})
```

Function names are derived from the method and the path:
`GET /users` → `getUsers`, `GET /users/:id` → `getUsersId`,
`POST /users` → `postUsers`, `DELETE /users/:id` → `deleteUsersId`.

Each function accepts a final `RequestOptions` argument:

```ts
const user = await getUsers({
  query: { page: 2, limit: 20 },
  signal: controller.signal,
  baseUrl: "https://api.example.com",
})
```

## Options

```bash
bun raiton client \
  --out ./sdk \
  --name ApiClient \
  --base-url http://localhost:5711/api \
  --force
```

| Option | Default | Role |
|---|---|---|
| `--out` | `./sdk` | Output directory |
| `--name` | `RaitonClient` | Error class prefix |
| `--base-url` | — | Default base URL |
| `--force` | `false` | Overwrite an existing client |
| `--dry-run` | `false` | Show the plan without writing |
| `--json` | `false` | Machine output |

## Error handling

```ts
import { RaitonClientError, postUsers } from "./sdk"

try {
  await postUsers({ email: "invalid", name: "" })
} catch (error) {
  if (error instanceof RaitonClientError) {
    console.error(error.statusCode, error.code, error.details)
  }
}
```

The client exposes `code`, `statusCode`, `details`, `docsUrl` and `requestId`
when the server provides them.

## Unknown schemas

A missing or overly complex schema becomes `unknown`, never `any`. You are
forced to validate the value before using it, which avoids false
type assurances.

## Contracts and manifest

The client is generated from the project **manifest**. Check it before
generating:

```bash
bun raiton inspect --json
```

If a route is missing, it is usually because it is not mounted by a
controller or has no output schema.

## CI integration

```bash
bun raiton openapi export --out openapi.json
bun raiton contract check --baseline openapi.baseline.json
bun raiton client --out ./sdk --force
git diff --exit-code ./sdk
```

This sequence fails if the contract changed without updating the versioned
client.

## Best practices

- Version the generated client in a separate package if several applications
  consume it.
- Never edit the generated file by hand.
- Regenerate it on every contract change.
- Use `--force` only in a controlled script.

## See also

- [Contracts](/docs/contracts)
- [OpenAPI CLI and contracts](/docs/cli-openapi)
- [Manifest](/docs/manifest)
