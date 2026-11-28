---
title: "Inspect and diagnose"
description: "Use routes, inspect, why, doctor and artifact to understand the real state of a Raiton project."
section: cli
order: 44
since: "6.9"
---

These commands answer a simple question: **what has the framework actually
mounted?**

## `routes`

```bash
bun raiton routes
bun raiton routes --json
bun raiton routes --method GET
bun raiton routes --path users
```

Displays the method, the path, the controller and the handler of each mounted
route.

## `inspect`

```bash
bun raiton inspect --json
bun raiton inspect --out manifest.json
bun raiton inspect --schema
bun raiton inspect --config-schema
bun raiton inspect --check
```

| Option | Role |
|---|---|
| `--json` | Manifest on stdout |
| `--out` | Write to a file |
| `--schema` | JSON schema of the manifest |
| `--config-schema` | JSON schema of the configuration |
| `--check` | Validate the manifest |
| `--force` | Overwrite the output |

The manifest contains the routes, the injection graph, the artifacts, the
configuration, the environment variables and the MCP servers. See
[Manifest](/docs/manifest).

## `why`

```bash
bun raiton why GET /api/users/:id
bun raiton why GET /api/users/:id --json
```

Answers "why does this route exist?":

- file and line;
- controller and method;
- route decorator;
- input/output contract;
- associated artifact.

This is the command to use when a route appears in OpenAPI but not in your
tests, or vice versa.

## `doctor`

```bash
bun raiton doctor
bun raiton doctor --json
bun raiton doctor --fix
```

Checks:

- runtime and version;
- configuration (invalid fields, `rootDir`, ports);
- decorator metadata;
- dependency versions;
- environment variables;
- occupied ports.

`--fix` applies only safe and non-destructive corrections.

## `artifact`

```bash
bun raiton artifact --dump
bun raiton artifact --dump --json
```

Lists the artifacts detected by the scanner (controllers, services, sockets,
MCP, schedulers). Useful for checking that a file is properly recognized.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Usage error |
| `2` | Missing prerequisite |
| `3` | File conflict |
| `4` | Diagnostic failed |

## In CI

```bash
bun raiton inspect --check
bun raiton doctor --json
bun raiton why GET /api/health
```

These commands exit with a non-zero code on failure, which is enough to block a
pipeline.

## See also

- [Manifest](/docs/manifest)
- [OpenAPI CLI](/docs/cli-openapi)
- [Develop](/docs/cli-dev)
