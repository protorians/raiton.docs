---
title: "OpenAPI"
description: "Générer un contrat OpenAPI depuis vos routes et contrats, exposer une interface Redoc et exporter le document."
section: fonctionnalites
order: 22
since: "6.0"
---

Raiton génère un document OpenAPI à partir des routes montées, des contrats
`@Input` / `@Output` et des décorateurs de documentation.

## Enregistrer le plugin

```ts
import { openApiPlugin } from "raiton/framework"

app.use(openApiPlugin({
  route: "/docs",
  ui: defaultOpenApiUi, // générateur HTML (Redoc, Swagger UI…)
  endpoint: "/docs/json",
  title: "Users API",
  version: "1.0.0",
  description: "API de démonstration",
}))
```

| Option | Défaut | Description |
|---|---|---|
| `route` | — | Interface HTML. Nécessite aussi `ui` |
| `ui` | — | Générateur HTML de l'interface |
| `endpoint` | `/docs/json` | Document JSON. `false` pour désactiver |
| `title` | `API` | Titre du document |
| `version` | `1.0.0` | Version de l'API |
| `description` | — | Description |
| `contact`, `license`, `termsOfService` | — | Métadonnées OpenAPI |

`route` n'est servie que si `ui` est fourni. Si vous ne voulez que le document
JSON (cas fréquent derrière un portail ou un générateur de client externe),
omettez `route` et `ui` :

```ts
app.use(openApiPlugin({
  title: "API Core",
  version: "0.149.0",
  endpoint: "/docs/json",
}))
```

Les chemins sont relatifs au préfixe de l'application. Avec `prefix: "/api"` et
`route: "/docs"`, l'interface est servie sur `/api/docs` et le JSON sur
`/api/docs/json`.

:::note
`register()` et `use()` acceptent tous deux un plugin. Pour OpenAPI, `use()`
partage le scope courant et rend les routes visibles au même niveau que le
reste de l'application. Utilisez la même forme dans tout le bootstrapper.
:::

## Contrats automatiques

Les schémas `@Input` et `@Output` alimentent directement les `requestBody` et
les réponses :

```ts
@Post("/")
@Input(CreateUserSchema)
@Output(UserSchema)
create(@Body() input: CreateUser) {
  return this.users.create(input)
}
```

Aucun décorateur OpenAPI supplémentaire n'est nécessaire.

## Décorateurs de documentation

```ts
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from "raiton/framework"

@ApiTags("users")
@Controllable("/users")
export class UsersController {
  @Get("/:id")
  @ApiOperation({ summary: "Récupérer un utilisateur" })
  @ApiParam("id", { in: "path", description: "Identifiant", required: true, type: String })
  @ApiQuery("expand", { description: "Relations à inclure", required: false, type: String })
  @ApiOkResponse("Utilisateur trouvé", Object)
  @ApiNotFoundResponse("Utilisateur introuvable")
  getOne(@Param("id") id: string) {
    return this.users.find(id)
  }
}
```

| Décorateur | Portée |
|---|---|
| `@ApiTags(...tags)` | Contrôleur ou méthode |
| `@ApiOperation(options)` | Méthode |
| `@ApiResponse({ status, description, type, isArray })` | Méthode |
| `@ApiOkResponse(description, type?, isArray?)` | Méthode |
| `@ApiCreatedResponse(...)`, `@ApiNotFoundResponse(...)` | Méthode |
| `@ApiParam(name, { in, description, required, type })` | Méthode |
| `@ApiQuery(name, options)` | Méthode |
| `@ApiBody(type, description?, required?)` | Méthode |
| `@ApiProperty(options)` | Propriété de DTO |
| `@ApiSecurity(...schemes)` | Contrôleur ou méthode |

## Health checks et MCP

- Les endpoints `@HealthCheck()` sont documentés avec le tag `Health` par
  défaut.
- Les serveurs MCP ajoutent une extension `x-mcp` listant outils, prompts et
  ressources.

## Exporter le document

:::note
La commande `raiton openapi export` a été ajoutée en **6.9**. L'interface Redoc
et le endpoint JSON du plugin existent dans les versions antérieures.
:::

```bash
bun raiton openapi export --out openapi.json
```

Le fichier généré peut être versionné, publié ou consommé par un générateur de
client externe. Voir [`raiton openapi`](/docs/cli-openapi).

## Bonnes pratiques

- Décrivez les erreurs importantes (`400`, `401`, `403`, `404`, `409`).
- Gardez des `operationId` stables.
- Ne documentez pas les routes internes (`excludeFromDocs` sur les health
  checks).
- Versionnez le fichier `openapi.json` pour détecter les ruptures de contrat.

## Voir aussi

- [Contrats](/docs/contracts)
- [Client typé](/docs/client)
- [CLI OpenAPI](/docs/cli-openapi)
