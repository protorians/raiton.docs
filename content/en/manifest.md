---
title: "Manifest and introspection"
description: "Explore routes, the injection graph, artifacts and configuration with the versioned manifest."
section: fonctionnalites
order: 34
since: "6.9"
---

Raiton produces a versioned **manifest** that describes the actual state of the
project: routes, artifacts, injection graph, configuration, environment
variables and MCP servers.

```bash
bun raiton inspect --json
```

## Structure

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-11-27T10:00:00.000Z",
  "framework": { "name": "raiton", "version": "6.10.0-beta.28" },
  "runtime": "bun",
  "project": {
    "rootDir": "./source",
    "entry": "source/main.ts",
    "configFile": "raiton.config.ts"
  },
  "routes": [
    {
      "method": "GET",
      "path": "/users/:id",
      "controller": "UsersController",
      "handler": "getOne",
      "file": "source/controllers/users.controller.ts",
      "line": 24,
      "input": "object",
      "output": "User"
    }
  ],
  "injection": {
    "UsersController": ["UsersService"],
    "UsersService": ["UsersRepository"]
  },
  "artifacts": ["UsersController", "UsersService"],
  "config": { "port": "5711" },
  "env": ["PORT", "DATABASE_URL"],
  "mcp": []
}
```

The JSON schema is published and validatable
(`docs/generated/manifest-schema.json` in the framework). The manifest is
cached and invalidated by HMR.

## Explore routes

```bash
bun raiton routes
bun raiton routes --json
```

## Find where a route comes from

```bash
bun raiton why GET /api/users/:id
```

Displays the file, line, controller, handler, decorator and the associated
artifact.

## Diagnostics

```bash
bun raiton doctor
bun raiton doctor --json
bun raiton doctor --fix
```

`doctor` checks:

- runtime and version;
- configuration and invalid fields;
- decorators and metadata;
- dependency versions;
- occupied ports;
- missing environment variables.

Exit codes are stable:

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Usage error |
| `2` | Missing prerequisite |
| `3` | File conflict |
| `4` | Diagnostic failure |

## Development page

In `dev` mode, Raiton exposes a discovery page at `/__dev`:

- mounted routes and source files;
- injection graph;
- detected artifacts;
- scheduled jobs;
- recent HMR events;
- health status.

The path is configurable:

```ts
export default {
  devPage: {
    enabled: true,
    path: "/__dev",
  },
}
```

## Route suggestions

In development, a 404 request can suggest the closest route. This aid is
computed from the manifest and is never active in production.

## Use cases

- **CI**: verify that no route has disappeared.
- **Documentation**: generate a readable inventory.
- **Debugging**: understand why a route is not mounted.
- **AI**: provide structured context to agents (`llms.txt`, manifest).

## See also

- [CLI: inspect and diagnose](/docs/cli-inspect)
- [OpenAPI](/docs/openapi)
- [Typed client](/docs/client)
