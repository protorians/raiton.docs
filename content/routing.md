---
title: "Routage et contrôleurs"
description: "Déclarer des contrôleurs avec @Controllable, utiliser les décorateurs HTTP, les paramètres d'URL et le routage manuel."
section: concepts
order: 11
since: "6.0"
---

Un contrôleur Raiton est une classe décorée avec `@Controllable(prefix)`. Chaque
méthode décorée avec `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`,
`@Head` ou `@Trace` devient une route.

```ts
import { Controllable, Get, Post, Param, Body } from "raiton/framework"

@Controllable("/users")
export class UsersController {
  @Get("/")
  list() {
    return []
  }

  @Get("/:id")
  getOne(@Param("id") id: string) {
    return { id }
  }

  @Post("/")
  create(@Body() payload: { name: string }) {
    return payload
  }
}
```

Avec `prefix: "/api"`, ces routes sont exposées sur :

| Méthode | Chemin |
|---|---|
| `GET` | `/api/users` |
| `GET` | `/api/users/:id` |
| `POST` | `/api/users` |

## Convention de nommage

Le scanner reconnaît les fichiers `*.controller.ts` (ou `.js`). Le nom du
fichier n'impose pas l'URL : seul le préfixe de `@Controllable` compte.

```text
source/controllers/users.controller.ts  →  @Controllable("/users")
```

Un préfixe vide est valide pour les routes racines :

```ts
@Controllable()
export class HealthController {
  @Get("/health")
  check() {
    return { status: "healthy" }
  }
}
```

## Contrôleur mince, cas d'usage injecté

Sur une API réelle, le contrôleur ne contient pas la règle métier. Il reçoit un
cas d'usage par constructeur, valide la frontière HTTP et formate la réponse.
L'injection par type fonctionne sans `@Inject()` si `emitDecoratorMetadata` est
activé.

```ts
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  Body,
  Controllable,
  HttpStatus,
  Post,
  RaitonResponses,
  RouteInteraction,
} from "raiton/framework"
import { SignInDto } from "@/modules/identity/application/dtos/sign-in.dto"
import SignInUseCase from "@/modules/identity/application/use-cases/sign-in.use-case"

@ApiTags("Authentication")
@Controllable("/auth/sign-in")
export default class SignInController {
  constructor(private readonly service: SignInUseCase) {}

  @Post("/")
  @RouteInteraction("[username] est désormais connecté")
  @ApiOperation({ summary: "Authentifier un utilisateur" })
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  async login(@Body() body: SignInDto) {
    const session = await this.service.login(body)
    return RaitonResponses("Connexion réussie", session, HttpStatus.OK)
  }
}
```

- `@RouteInteraction()` décrit l'action dans le manifeste et les journaux ; il
  ne modifie pas la route.
- L'export par défaut est facultatif. Il facilite l'import dans un test ou un
  composition root, mais le scanner monte toute classe exportée.
- Pour une erreur métier, préférez `throw new HttpException(...)` :
  `RaitonResponses` décrit un corps, pas le statut HTTP. Voir
  [Réponses et erreurs](/docs/responses).

:::tip
Un contrôleur par intention (une route) facilite OpenAPI et les tests ; un
contrôleur par ressource reste plus lisible pour un CRUD homogène. Le critère
est la cohésion des dépendances et de la documentation.
:::

## Paramètres d'URL

Les segments `:name` sont capturés et transmis via `@Param("name")`.

```ts
@Get("/:userId/posts/:postId")
getPost(
  @Param("userId") userId: string,
  @Param("postId") postId: string,
) {
  return { userId, postId }
}
```

Le routeur donne la priorité aux routes statiques sur les routes
paramétrées : `/users/me` gagne sur `/users/:id`, quel que soit l'ordre de
déclaration.

## Préfixe et pathname

`Application` applique deux transformations avant le matching :

1. `pathname` est retiré du début du chemin ;
2. `prefix` est ajouté à chaque route lors de l'enregistrement.

```ts
new Application({ prefix: "/api", pathname: "/app" })
// GET /app/api/users/42 → route /users/:id
```

## Versions de routes

Les helpers de routage acceptent une version optionnelle :

```ts
app.get("/users", v1Handler, "v1")
app.get("/users", v2Handler, "v2")
```

Pour une API versionnée complète, préférez des préfixes explicites
(`@Controllable("/v1/users")`) : ils sont visibles dans l'URL, dans OpenAPI et
dans le client généré.

## Routes manuelles

Les routes sans contrôleur restent possibles :

```ts
app.get("/health", () => ({ status: "ok" }))
app.post("/webhooks/stripe", async (ctx) => {
  const signature = ctx.req.headers.get("stripe-signature")
  return { received: true }
})
```

Utilisez-les pour les endpoints très simples ou les webhooks. Pour tout le
reste, un contrôleur garde le code testable et documenté.

## Retour 404 et suggestions

Quand aucune route ne correspond, Raiton renvoie une erreur 404. En
développement, la réponse peut suggérer la route la plus proche (par exemple
`/users/42` au lieu de `/user/42`). Cette aide est calculée à partir des routes
montées et n'est jamais exposée en production.

## Erreurs de routage fréquentes

| Symptôme | Cause |
|---|---|
| Route absente | Fichier sans suffixe `.controller.ts` |
| `404` sur `/users` | Préfixe global ajouté deux fois |
| `@Param` vide | Nom du segment différent (`:id` vs `@Param("userId")`) |
| Conflit de routes | Deux contrôleurs avec le même préfixe et le même chemin |

## Voir aussi

- [Paramètres de requête](/docs/parameters)
- [Réponses et erreurs](/docs/responses)
- [OpenAPI](/docs/openapi)
