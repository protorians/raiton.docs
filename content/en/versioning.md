---
title: "Versioning policy"
description: "Understand Raiton versioning, supported versions and migration paths."
section: versions
order: 71
since: "6.0"
---

## Version scheme

Raiton follows `MAJOR.MINOR.PATCH` versioning with a pre-release suffix
during beta:

```text
6.10.0-beta.28
│ │ │  │   └─ numéro de build beta
│ │ │  └───── pré-release
│ │ └──────── patch
│ └────────── minor
└──────────── major
```

- **major**: breaking changes.
- **minor**: compatible features.
- **patch**: compatible fixes.

During beta, a minor may contain API adjustments, but error
codes and published contracts remain stable.

## Documented versions

| Version | Status | Documentation |
|---|---|---|
| 6.10 | **latest** | [Read](/docs/6.10) |
| 6.9 | archived | [Read](/docs/6.9) |
| 6.8 | archived | [Read](/docs/6.8) |
| 6.7 | archived | [Read](/docs/6.7) |
| 6.6 | archived | [Read](/docs/6.6) |

The version selector at the top of the page lets you switch between
documentations. A page marked "Since 6.9" does not exist in earlier
versions.

## Support

- The latest version receives fixes and features.
- Archived versions remain available for consultation but no longer receive
  fixes.
- Public error codes are never reused.

## Migration

### 6.9 → 6.10

No breaking changes. 6.10 is dedicated to performance: routing,
the HTTP pipeline and startup are faster, with benchmarks and
non-regression tests. Contracts, the manifest, MCP and observability
introduced in 6.9 remain unchanged.

### 6.8 → 6.9

1. Update `raiton` and the CLI.
2. Add `raiton/contracts` if you adopt contracts.
3. Gradually replace DTOs with `@Input` / `@Output`.
4. Generate the manifest: `bun raiton inspect --json`.
5. Generate the client: `bun raiton client`.
6. Enable observability if needed.

Existing routes, decorators and DTOs continue to work.

### 6.7 → 6.8

The scheduler is additive. No route or controller change is
required. Check that jobs do not run twice if you deploy
multiple instances.

### 6.6 → 6.7

The cache is additive. `@Cache` is opt-in; `etag()` must be wired
explicitly. No breaking changes.

## Runtime compatibility

| Runtime | Support |
|---|---|
| Bun | Complete, recommended |
| Node.js 22+ | Complete (precompiled CLI) |
| Deno 2+ | Complete, some socket limitations |

Runtime-specific features are flagged in the
documentation.

## Deprecations

A deprecated API:

1. is documented as such;
2. emits a warning in development;
3. remains available for at least one minor;
4. is removed in a major.

## Checking your version

```bash
bun raiton --version
bun raiton doctor --json
```

`doctor` compares the CLI version, the package version and the manifest version.

## See also

- [Release notes](/docs/releases)
- [Contributing](/docs/contributing)
- [Deployment](/docs/deployment)
