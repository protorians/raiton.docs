---
title: "Paramètres et contexte"
description: "Extraire les données d'une requête avec @Param, @Query, @Body, @Headers, @Cookie, @Req et @Reply."
section: concepts
order: 12
since: "6.0"
---

Les décorateurs de paramètres extraient les données de la requête et les
injectent dans les arguments de la méthode. Ils évitent de manipuler l'objet
`Request` à la main.

## Décorateurs disponibles

| Décorateur | Source | Exemple |
|---|---|---|
| `@Param("id")` | Paramètres d'URL | `/users/:id` |
| `@Query("page")` | Query string | `?page=2` |
| `@Body()` | Corps parsé | JSON, formulaire, texte |
| `@Headers("authorization")` | En-têtes HTTP | `Authorization` |
| `@Cookie("session")` | Cookies | `session=…` |
| `@Req()` | Requête brute | `Request` / wrapper Node |
| `@Reply()` | Réponse brute | `reply.status()`, `reply.send()` |
| `@UploadedFile()` | Fichier multipart | `File` |

```ts
import { Controllable, Get, Param, Query, Headers } from "raiton/framework"

@Controllable("/search")
export class SearchController {
  @Get("/:index")
  search(
    @Param("index") index: string,
    @Query("q") query?: string,
    @Query("limit") limit?: string,
    @Headers("accept-language") locale?: string,
  ) {
    return { index, query, limit: Number(limit ?? 20), locale }
  }
}
```

## Le corps de requête

Le body parser est enregistré automatiquement par `thread.setup()`. Il gère :

- `application/json`
- `application/x-www-form-urlencoded`
- `multipart/form-data`
- `text/plain`

```ts
@Post("/")
create(@Body() payload: { name: string }) {
  return payload
}
```

Un `POST` sans corps produit `{}` plutôt qu'une erreur. Pour un DTO typé, le
routeur instancie la classe déclarée sur l'argument :

```ts
import { DataTransferObject } from "raiton/framework"

class CreateUserDto extends DataTransferObject {
  name!: string
  email!: string
}

@Post("/")
create(@Body() payload: CreateUserDto) {
  return payload // instance de CreateUserDto
}
```

Le DTO doit hériter de `DataTransferObject` pour être hydraté et validé. Voir
[Validation et DTO](/docs/validation).

## Requête et réponse brutes

`@Reply()` donne accès à l'API de réponse du runtime :

```ts
@Get("/export")
exportCsv(@Reply() reply: any) {
  reply.type("text/csv")
  reply.header("content-disposition", "attachment; filename=users.csv")
  return reply.send("id,name\n1,Alice")
}
```

`@Req()` expose la requête normalisée :

```ts
@Get("/whoami")
whoami(@Req() req: any) {
  return {
    method: req.method,
    url: req.url,
    ip: req.remoteAddress,
    userAgent: req.headers.get("user-agent"),
  }
}
```

## Contexte et état

Les handlers reçoivent aussi le contexte complet s'ils déclarent un argument
`ctx` non décoré :

```ts
@Get("/me")
me(ctx: any) {
  return {
    user: ctx.state.user,
    requestId: ctx.state.requestId,
  }
}
```

`context.state` est un objet libre partagé par les middlewares et le handler.
`context.decorate(key, value)` ajoute une valeur immuable au contexte.

## Headers et cookies

Les en-têtes et cookies sont sensibles à la casse selon le runtime ; les
accesseurs Raiton normalisent les noms.

```ts
@Get("/session")
session(@Cookie("session") session?: string) {
  return { authenticated: Boolean(session) }
}
```

Pour poser un cookie, utilisez l'en-tête `set-cookie` via `@Reply()` :

```ts
@Post("/login")
login(@Reply() reply: any) {
  reply.header(
    "set-cookie",
    "session=abc; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600",
  )
  return { ok: true }
}
```

## Validation des paramètres

Les décorateurs de paramètres ne valident pas les valeurs par défaut. Utilisez
un contrat `@Input` pour valider le corps, la query, les paramètres ou les
en-têtes :

```ts
@Input({
  query: t.object({ page: t.integer().min(1).optional() }),
  params: t.object({ id: t.string().uuid() }),
})
```

Voir [Contrats schema-first](/docs/contracts).

## Voir aussi

- [Routage](/docs/routing)
- [Validation et DTO](/docs/validation)
- [Contrats](/docs/contracts)
