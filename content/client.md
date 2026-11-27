---
title: "Client typé"
description: "Générer un client TypeScript sans any depuis le manifeste et les contrats OpenAPI de votre application."
section: fonctionnalites
order: 23
since: "6.9"
---

`raiton client` génère un module TypeScript à partir des routes et des contrats
du projet. Le client ne dépend d'aucun runtime : il utilise `fetch`.

```bash
bun raiton client --out ./sdk
```

Le fichier généré contient :

- les types d'entrée et de sortie dérivés des schémas ;
- une fonction par route ;
- `configureClient()` pour l'URL de base et les en-têtes ;
- une classe d'erreur typée (`RaitonClientError` par défaut).

## Utiliser le client

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

Les noms de fonctions sont dérivés de la méthode et du chemin :
`GET /users` → `getUsers`, `GET /users/:id` → `getUsersId`,
`POST /users` → `postUsers`, `DELETE /users/:id` → `deleteUsersId`.

Chaque fonction accepte un dernier argument `RequestOptions` :

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

| Option | Défaut | Rôle |
|---|---|---|
| `--out` | `./sdk` | Répertoire de sortie |
| `--name` | `RaitonClient` | Préfixe des classes d'erreur |
| `--base-url` | — | URL de base par défaut |
| `--force` | `false` | Écraser un client existant |
| `--dry-run` | `false` | Afficher le plan sans écrire |
| `--json` | `false` | Sortie machine |

## Gestion des erreurs

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

Le client expose `code`, `statusCode`, `details`, `docsUrl` et `requestId`
lorsque le serveur les fournit.

## Schémas inconnus

Un schéma absent ou trop complexe devient `unknown`, jamais `any`. Vous êtes
obligé de valider la valeur avant de l'utiliser, ce qui évite les fausses
assurances de type.

## Contrats et manifeste

Le client est généré depuis le **manifeste** du projet. Vérifiez-le avant de
générer :

```bash
bun raiton inspect --json
```

Si une route manque, c'est généralement qu'elle n'est pas montée par un
contrôleur ou qu'elle n'a pas de schéma de sortie.

## Intégration dans le CI

```bash
bun raiton openapi export --out openapi.json
bun raiton contract check --baseline openapi.baseline.json
bun raiton client --out ./sdk --force
git diff --exit-code ./sdk
```

Cette séquence échoue si le contrat a changé sans mise à jour du client
versionné.

## Bonnes pratiques

- Versionnez le client généré dans un package séparé si plusieurs applications
  le consomment.
- Ne modifiez jamais le fichier généré à la main.
- Régénérez-le à chaque changement de contrat.
- Utilisez `--force` uniquement dans un script contrôlé.

## Voir aussi

- [Contrats](/docs/contracts)
- [CLI OpenAPI et contrats](/docs/cli-openapi)
- [Manifeste](/docs/manifest)
