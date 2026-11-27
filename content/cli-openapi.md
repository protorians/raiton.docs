---
title: "OpenAPI, client et contrats"
description: "Exporter OpenAPI, générer un client typé et détecter les ruptures de contrat dans le CI."
section: cli
order: 45
since: "6.9"
---

Trois commandes forment la chaîne de contrat :

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

| Option | Rôle |
|---|---|
| `--out <file>` | Écrire le document |
| `--title` | Titre OpenAPI |
| `--version` | Version de l'API |
| `--description` | Description |
| `--force` | Écraser |
| `--dry-run` | Afficher le plan |
| `--json` | Document sur stdout |

Le document est construit depuis les routes réellement montées et les contrats
`@Input` / `@Output`.

## `client`

```bash
bun raiton client --out ./sdk --base-url http://localhost:5711/api
```

| Option | Défaut | Rôle |
|---|---|---|
| `--out` | `./sdk` | Répertoire |
| `--name` | `RaitonClient` | Préfixe d'erreur |
| `--base-url` | — | URL par défaut |
| `--force` | `false` | Écraser |
| `--dry-run` | `false` | Plan |
| `--json` | `false` | Sortie machine |

Voir [Client typé](/docs/client) pour l'utilisation générée.

## `contract snapshot`

```bash
bun raiton contract snapshot --out contracts.baseline.json
```

Écrit l'état actuel comme référence. Utilisez `--force` pour remplacer une
baseline existante.

## `contract check`

```bash
bun raiton contract check --baseline contracts.baseline.json
bun raiton contract check --baseline contracts.baseline.json --json
```

Détecte :

- routes supprimées ;
- champs supprimés ou renommés ;
- types modifiés de façon incompatible ;
- réponses qui changent de statut.

La commande échoue avec un code non nul en cas de rupture.

## Pipeline recommandée

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

## Bonnes pratiques

- Versionnez la baseline et le client généré.
- Régénérez la baseline uniquement lors d'un changement assumé.
- Vérifiez `openapi.json` dans la revue de code.
- Documentez les erreurs dans les contrats.

## Voir aussi

- [OpenAPI](/docs/openapi)
- [Client typé](/docs/client)
- [Contrats](/docs/contracts)
