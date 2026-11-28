---
title: "Contributing"
description: "Set up the repository, run the tests, propose a feature and contribute to the documentation."
section: guides
order: 64
since: "6.0"
---

Raiton is developed in public. Contributions to the framework and the
documentation are welcome.

## Repositories

| Repository | Contents |
|---|---|
| [`protorians/raiton`](https://github.com/protorians/raiton) | Framework, CLI, tests |
| [`protorians/raiton.docs`](https://github.com/protorians/raiton.docs) | This documentation site |

## Installing the framework

```bash
git clone https://github.com/protorians/raiton.git
cd raiton
bun install
bun test
```

## Framework structure

```text
source/
├── bin/          # CLI, bootstrapper, output
├── commands/     # commandes CLI
├── core/         # application, router, DI, plugins, scheduler, MCP
├── framework/    # décorateurs, runtime, réponses, plugins
├── contracts/    # TypeBox, validation, erreurs
├── manifest/     # manifeste et client
├── generators/   # templates de projet
└── types/        # interfaces publiques
```

## Running the tests

```bash
bun test
bun test tests/core
bun run bench
```

Performance changes must be measured with `bun run bench`.

## Proposing a feature

1. Open an issue with the use case and the envisioned API.
2. Wait for agreement on the direction.
3. Implement with tests.
4. Update the documentation and the changelog.
5. Open a pull request.

## Conventions

- Strict TypeScript.
- No unnecessary runtime dependency.
- Public errors use the stable catalog.
- New features are documented before release.
- Commit messages follow `feat:`, `fix:`, `docs:`, `chore:`.

## Documentation

The site is a static Next.js project:

```bash
cd raiton.docs
npm install
npm run dev
```

Pages live in `content/`. Each file has a frontmatter:

```yaml
---
title: "Titre"
description: "Résumé"
section: concepts
order: 13
since: "6.0"
---
```

- `section` must be a known section (`demarrage`, `concepts`,
  `fonctionnalites`, `cli`, `reference`, `guides`, `versions`).
- `since` controls availability by version.
- Internal links are written `/docs/<slug>`; the site adds the version.

## Reporting a bug

```bash
bun raiton doctor --json
bun raiton inspect --json
```

Include the version, runtime, configuration and a minimal example.

## Code of conduct

Be precise, respectful and constructive. Technical disagreements are
welcome; personal attacks are not.

## See also

- [Installation](/docs/installation)
- [Testing](/docs/testing)
- [Release notes](/docs/releases)
