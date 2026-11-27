---
title: "Contribuer"
description: "Configurer le dépôt, lancer les tests, proposer une fonctionnalité et contribuer à la documentation."
section: guides
order: 64
since: "6.0"
---

Raiton est développé en public. Les contributions au framework et à la
documentation sont bienvenues.

## Dépôts

| Dépôt | Contenu |
|---|---|
| [`protorians/raiton`](https://github.com/protorians/raiton) | Framework, CLI, tests |
| [`protorians/raiton.docs`](https://github.com/protorians/raiton.docs) | Ce site de documentation |

## Installer le framework

```bash
git clone https://github.com/protorians/raiton.git
cd raiton
bun install
bun test
```

## Structure du framework

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

## Lancer les tests

```bash
bun test
bun test tests/core
bun run bench
```

Les changements de performance doivent être mesurés avec `bun run bench`.

## Proposer une fonctionnalité

1. Ouvrez une issue avec le cas d'usage et l'API envisagée.
2. Attendez un accord sur la direction.
3. Implémentez avec des tests.
4. Mettez à jour la documentation et le changelog.
5. Ouvrez une pull request.

## Conventions

- TypeScript strict.
- Pas de dépendance runtime inutile.
- Les erreurs publiques utilisent le catalogue stable.
- Les nouvelles fonctionnalités sont documentées avant la release.
- Les messages de commit suivent `feat:`, `fix:`, `docs:`, `chore:`.

## Documentation

Le site est un projet Next.js statique :

```bash
cd raiton.docs
npm install
npm run dev
```

Les pages vivent dans `content/`. Chaque fichier a un frontmatter :

```yaml
---
title: "Titre"
description: "Résumé"
section: concepts
order: 13
since: "6.0"
---
```

- `section` doit être une section connue (`demarrage`, `concepts`,
  `fonctionnalites`, `cli`, `reference`, `guides`, `versions`).
- `since` contrôle la disponibilité par version.
- Les liens internes s'écrivent `/docs/<slug>` ; le site ajoute la version.

## Signaler un bug

```bash
bun raiton doctor --json
bun raiton inspect --json
```

Joignez la version, le runtime, la configuration et un exemple minimal.

## Code de conduite

Soyez précis, respectueux et constructif. Les désaccords techniques sont
bienvenus ; les attaques personnelles ne le sont pas.

## Voir aussi

- [Installation](/docs/installation)
- [Tests](/docs/testing)
- [Notes de version](/docs/releases)
