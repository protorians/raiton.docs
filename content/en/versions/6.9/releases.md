---
title: "Release notes 6.9"
description: "Schema-first contracts, manifest, MCP stdio, observability and CLI in Raiton 6.9."
section: versions
order: 70
since: "6.0"
---

## 6.9.0-beta.26

**November 27, 2026** · `v6.9.0-beta.26` · [Compare on GitHub](https://github.com/protorians/raiton/compare/v6.8.9-beta.25...v6.9.0-beta.26)

Version 6.9 is the largest update since the framework was created.
It adds schema-first contracts, the manifest, MCP stdio, observability and
a complete CLI.

### Schema-first contracts

- `raiton/contracts` module based on TypeBox.
- `t` facade with chainable constraints (`min`, `max`, `email`, `optional`…).
- `@Input` and `@Output` to validate inputs and outputs.
- Stable `VALIDATION_ERROR` payload.
- Output validation in development only (`OUTPUT_VALIDATION_ERROR`).
- Support for Standard Schema v1 schemas (Zod, Valibot, ArkType).

```bash
bun raiton openapi export --out openapi.json
bun raiton client --out ./sdk
```

### Versioned manifest

- Complete inventory: routes, artifacts, DI graph, configuration, env, MCP.
- Published and validatable JSON schema.
- Cache invalidated by HMR.
- `inspect`, `routes`, `why`, `doctor`, `artifact` commands.

### MCP

- **stdio** transport in addition to Streamable HTTP.
- Shared HTTP / stdio conformance suite.
- Input and output schemas per tool.
- Safety annotations and destructive tools hidden by default.
- Scopes, audit with secret redaction, rate limit per tool.

### Observability

- Correlation identifiers (`x-request-id`).
- Prometheus metrics (`/metrics`).
- OTLP/HTTP traces.
- Stable error catalog.
- Readiness and bounded graceful shutdown.

### CLI

- `new` with `api`, `minimal`, `mcp-agent` templates.
- `generate` for controller, service, repository, DTO, MCP, test, resource.
- `openapi export`, `client`, `contract check|snapshot`.
- `mcp list|inspect|test|serve|conformance`.
- `docs agents` for `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CLAUDE.md`.
- Single JSON output, logs on `stderr`, stable exit codes.

### Discovery

- `/__dev` development page.
- Route suggestions on 404 in development.
- Redoc OpenAPI interface by default.

### Fixes

- `Application.handle` respects the `statusCode` of simple response objects.
- The OpenAPI interface no longer sends an empty body.
- The bootstrapper no longer installs the body parser twice and no longer starts
  the scheduler outside server mode.

### Migration from 6.8

- No known breaking changes.
- `class-validator` DTOs remain supported; contracts are recommended.
- `inspect`, `why` and `doctor` require CLI 6.9.

## History

| Version | Key point |
|---|---|
| 6.9 | Contracts, manifest, MCP stdio, observability, CLI |
| 6.8 | Scheduler and queues |
| 6.7 | HTTP cache and ETag |
| 6.6 | Health checks, CSRF, DI artifacts |

See [all versions](/docs/versioning).
