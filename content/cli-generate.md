---
title: "raiton generate"
description: "Générer contrôleurs, services, dépôts, DTO, outils MCP, tests et ressources complètes."
section: cli
order: 42
since: "6.9"
---

`raiton generate` crée un artefact dans la structure du projet.

```bash
bun raiton generate <type> <name>
```

| Type | Fichier généré |
|---|---|
| `controller` | `*.controller.ts` |
| `service` | `*.service.ts` |
| `repository` | `*.repository.ts` |
| `dto` | `*.dto.ts` |
| `mcp-tool` | `*.mcp.ts` |
| `test` | `*.test.ts` |
| `resource` | Contrôleur + service + dépôt + DTO + test |

## Exemples

```bash
bun raiton generate controller users
bun raiton generate service billing
bun raiton generate mcp-tool payments
bun raiton generate resource invoices
```

Pour `resource`, les fichiers sont créés dans les dossiers conventionnels :

```text
source/
├── controllers/invoices.controller.ts
├── services/invoices.service.ts
├── repositories/invoices.repository.ts
├── dtos/create-invoice.dto.ts
└── tests/invoices.test.ts
```

## Options

| Option | Rôle |
|---|---|
| `--dry-run` | Afficher le plan sans écrire |
| `--force` | Écraser un fichier existant |
| `--json` | Sortie machine |

```bash
bun raiton generate resource users --dry-run
bun raiton generate resource users --force
```

## Ce que contient un contrôleur généré

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

Le générateur adapte le préfixe, le nom de classe et les imports au type
demandé. Il ne devine pas vos règles métier : le code généré est un point de
départ, pas une implémentation complète.

## En CI

```bash
bun raiton generate resource invoices --dry-run --json
```

Vérifiez le plan avant d'écrire dans un dépôt partagé.

## Bonnes pratiques

- Générez au moment de créer un domaine, pas pour chaque champ.
- Renommez les fichiers avant de les versionner si le nom ne correspond pas au
  domaine.
- Complétez immédiatement le contrat d'entrée et de sortie.
- Ajoutez le test avant la logique métier.

## Voir aussi

- [Structure du projet](/docs/project-structure)
- [Contrats](/docs/contracts)
- [Tests](/docs/testing)
