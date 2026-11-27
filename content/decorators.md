---
title: "Décorateurs"
description: "Référence complète des décorateurs Raiton : contrôleurs, routes, paramètres, injection, middlewares, cache, sockets, MCP, scheduler, health checks et OpenAPI."
section: reference
order: 50
since: "6.0"
---

Tous les décorateurs sont exportés par `raiton/framework`, sauf `@Input` et
`@Output` qui viennent de `raiton/contracts`.

:::note
Cette référence couvre la version 6.10. Certains décorateurs sont plus récents
que d'autres : `@HealthCheck` (6.6), `@Cache` (6.7), `@Scheduler`, `@Cron`,
`@Every`, `@Timeout`, `@Task` (6.8), `@Input` et `@Output` (6.9).
:::

```ts
import {
  Controllable, Get, Post, Body, Param,
  Injectable, Inject, Middleware, Guard,
  Cache, Socket, OnSocketMessage,
  McpServer, McpTool, McpArg,
  Scheduler, Cron, Every, Task,
  HealthCheck,
} from "raiton/framework"

import { Input, Output } from "raiton/contracts"
```

## Contrôleurs et routes

| Décorateur | Cible | Rôle |
|---|---|---|
| `@Controllable(prefix)` | Classe | Déclare un contrôleur HTTP |
| `@Get(path?)` | Méthode | Route GET |
| `@Post(path?)` | Méthode | Route POST |
| `@Put(path?)` | Méthode | Route PUT |
| `@Patch(path?)` | Méthode | Route PATCH |
| `@Delete(path?)` | Méthode | Route DELETE |
| `@Options(path?)` | Méthode | Route OPTIONS |
| `@Head(path?)` | Méthode | Route HEAD |
| `@Trace(path?)` | Méthode | Route TRACE |
| `@RouteInteraction(template)` | Méthode | Décrit une interaction lisible |

```ts
@Controllable("/articles")
export class ArticlesController {
  @Get("/:slug")
  @RouteInteraction("[user.name] a lu [article.title]")
  read(@Param("slug") slug: string) {
    return this.articles.find(slug)
  }
}
```

## Paramètres

| Décorateur | Rôle |
|---|---|
| `@Param("id")` | Paramètre d'URL |
| `@Query("page")` | Query string |
| `@Body()` | Corps parsé |
| `@Headers("authorization")` | En-tête |
| `@Cookie("session")` | Cookie |
| `@Req()` | Requête brute |
| `@Reply()` | Réponse brute |
| `@UploadedFile()` | Fichier multipart |

## Injection

| Décorateur | Rôle |
|---|---|
| `@Injectable(lifetime?, name?, scope?)` | Enregistre une classe dans le conteneur |
| `@Inject(token?)` | Injecte dans un paramètre ou une propriété |

```ts
import { LifetimeEnum } from "@protorians/core"

@Injectable(LifetimeEnum.SINGLETON)
export class UsersService {}
```

## Middleware et guards

| Décorateur | Rôle |
|---|---|
| `@Middleware(fn)` | Attache un middleware à une classe ou méthode |
| `@Guard({ name, handler })` | Garde d'accès nommée |
| `@CsrfToken()` | Expose le token CSRF |
| `@CsrfGuard(options?)` | Vérifie le token CSRF |

## Cache

| Décorateur | Rôle |
|---|---|
| `@Cache(options?)` | Met en cache la réponse d'une route |

```ts
@Get("/featured")
@Cache({ ttl: 60_000, vary: ["accept-language"] })
featured() {}
```

## Contrats

| Décorateur | Rôle |
|---|---|
| `@Input(schema | { body?, query?, params?, headers? })` | Valide l'entrée |
| `@Output(schema)` | Valide la sortie (dev par défaut) |

## Sockets

| Décorateur | Rôle |
|---|---|
| `@Socket(namespace?)` | Déclare un contrôleur socket |
| `@OnSocketConnect()` | Connexion |
| `@OnSocketDisconnect()` | Déconnexion |
| `@OnSocketMessage(name?)` | Message |
| `@OnSocketEvent(name)` | Événement nommé |

## MCP

| Décorateur | Rôle |
|---|---|
| `@McpServer(options?)` | Déclare un serveur MCP |
| `@McpTool(options?)` | Expose un outil |
| `@McpPrompt(options?)` | Expose un prompt |
| `@McpResource(options)` | Expose une ressource |
| `@McpResourceTemplate(options)` | Expose un template de ressource |
| `@McpArg(name, description?, metatype?)` | Décrit un argument (alias `@McpArgument`) |

## Scheduler

| Décorateur | Rôle |
|---|---|
| `@Scheduler(options?)` | Déclare un scheduler |
| `@Cron(expression, options?)` | Job cron |
| `@Every(interval, options?)` | Job périodique (alias `@Interval`) |
| `@Timeout(delay, options?)` | Job unique différé |
| `@Task(name, options?)` | Tâche nommée |

## Health checks

| Décorateur | Rôle |
|---|---|
| `@HealthCheck(options?)` | Qualifie un endpoint de santé |

## OpenAPI

| Décorateur | Rôle |
|---|---|
| `@ApiTags(...tags)` | Tags de contrôleur ou méthode |
| `@ApiOperation(options)` | Résumé, description, operationId |
| `@ApiResponse({ status, description, type, isArray })` | Réponse |
| `@ApiOkResponse(description?, type?, isArray?)` | Raccourci `200` |
| `@ApiCreatedResponse(...)` | Raccourci `201` |
| `@ApiBadRequestResponse(...)` | Raccourci `400` |
| `@ApiUnauthorizedResponse(...)` | Raccourci `401` |
| `@ApiForbiddenResponse(...)` | Raccourci `403` |
| `@ApiNotFoundResponse(...)` | Raccourci `404` |
| `@ApiInternalServerErrorResponse(...)` | Raccourci `500` |
| `@ApiParam(name, { in, ... })` | Paramètre |
| `@ApiQuery(name, options)` | Paramètre query |
| `@ApiBody(type, description?, required?)` | Corps |
| `@ApiProperty(options)` | Propriété de DTO |
| `@ApiSecurity(...schemes)` | Exigences de sécurité |

## Ordre des décorateurs

Les décorateurs TypeScript s'appliquent de bas en haut. Pour une route, placez
le décorateur HTTP en premier (le plus haut) et les métadonnées ensuite :

```ts
@Get("/:id")
@Cache({ ttl: 30_000 })
@Guard({ name: "read", handler: canRead })
@ApiOperation({ summary: "Lire un article" })
read() {}
```

## Voir aussi

- [API core](/docs/core-api)
- [Contrats](/docs/contracts)
- [MCP](/docs/mcp)
