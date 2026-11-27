---
title: "Middleware et guards"
description: "Intercepter les requêtes avec des middlewares Koa-style, les attacher à un contrôleur ou une route, et protéger l'accès avec @Guard."
section: concepts
order: 14
since: "6.0"
---

Un middleware reçoit le contexte de la requête et une fonction `next()`. Il peut
lire la requête, enrichir `context.state`, envoyer une réponse ou laisser la
chaîne continuer.

```ts
app.use(async ({ context, next }) => {
  const startedAt = Date.now()
  await next()
  context.reply.header("x-response-time", `${Date.now() - startedAt}ms`)
})
```

## Signature

```ts
interface MiddlewareParametersInterface {
  context: RequestContext
  next: () => Promise<void>
}
```

Un middleware **doit** appeler `await next()` pour transmettre la requête. S'il
envoie une réponse sans appeler `next()`, la chaîne s'arrête.

## Ordre d'exécution

```text
1. body parser (hook preParsing)
2. plugins de sécurité (enregistrés au démarrage)
3. middlewares des plugins
4. app.use(...)
5. @Middleware sur le contrôleur
6. @Middleware sur la méthode
7. handler de la route
8. onSend / onResponse
```

L'ordre d'enregistrement compte : un middleware d'authentification doit être
ajouté avant un middleware qui lit `context.state.user`.

## Middleware global

```ts
app.use(async ({ context, next }) => {
  context.state.requestStartedAt = performance.now()
  await next()
})
```

## Middleware de contrôleur

```ts
import { Controllable, Get, Middleware } from "raiton/framework"

const auth = async ({ context, next }) => {
  const token = context.req.headers.get("authorization")
  if (!token) {
    context.reply.status(401)
    return context.reply.send({
      statusCode: 401,
      error: true,
      message: "Unauthorized",
      data: null,
    })
  }
  context.state.user = { id: "1", role: "admin" }
  await next()
}

@Controllable("/admin")
@Middleware(auth)
export class AdminController {
  @Get("/dashboard")
  dashboard() {
    return { ok: true }
  }
}
```

## Middleware de route

```ts
const rateLimited = async ({ context, next }) => {
  if (isAbused(context.req)) {
    context.reply.status(429)
    return context.reply.send({ error: true, message: "Too many requests" })
  }
  await next()
}

@Get("/expensive")
@Middleware(rateLimited)
compute() {
  return { ok: true }
}
```

## Guards

`@Guard()` attache une garde nommée. La garde renvoie `true` pour autoriser la
requête ; dans le cas contraire, Raiton répond `403 Forbidden`.

```ts
import { Controllable, Get, Guard } from "raiton/framework"

@Controllable("/billing")
export class BillingController {
  @Get("/invoices")
  @Guard({
    name: "billing:read",
    handler: async ({ context }) => {
      return context.state.user?.role === "admin"
    },
  })
  invoices() {
    return []
  }
}
```

Le nom identifie la garde dans le registre. La même garde peut être réutilisée
sur plusieurs routes. Les guards sont implémentés comme des middlewares : ils
s'exécutent donc dans l'ordre décrit plus haut.

### Composer un guard métier

Quand plusieurs middlewares doivent s'enchaîner (session, activité, organisation
courante), exposez un seul décorateur plutôt que d'empiler des décorateurs sur
le contrôleur :

```ts
import { Middleware } from "raiton/framework"

export function UserAccessGuard(options: { organization?: boolean } = {}) {
  return (target: any, key?: string, descriptor?: any) => {
    Middleware(SessionGuard)(target, key, descriptor)
    Middleware(UserActivityMiddleware)(target, key, descriptor)

    if (options.organization) {
      // Lit `context.state.user`, publié par SessionGuard juste avant.
      Middleware(CurrentOrganizationMiddleware)(target, key, descriptor)
    }
  }
}
```

```ts
@Controllable("/access-control")
@UserAccessGuard({ organization: true })
export default class GetMyPermissionsController {
  @Get("/me/permissions")
  handle(@Req() req: any) {
    return { userId: req.user.id, organizationId: req.organizationId }
  }
}
```

:::warning
L'ordre des décorateurs compte. Raiton exécute la pile du décorateur le plus
proche de la méthode vers le plus éloigné. Un décorateur posé au-dessus de
`@UserAccessGuard()` peut donc s'exécuter avant que la session soit résolue.
Composez l'ordre dans un seul décorateur et couvrez-le par un test
d'intégration.
:::

## Hooks de cycle de vie

Les plugins peuvent enregistrer des hooks plus fins que les middlewares :

| Hook | Moment |
|---|---|
| `onRequest` | Requête reçue, avant le parsing |
| `preParsing` | Avant la lecture du corps |
| `preHandler` | Avant le handler, après le parsing |
| `onSend` | Avant l'envoi de la réponse |
| `onResponse` | Après l'envoi |

```ts
scope.addHook("onResponse", async (ctx) => {
  metrics.observe(ctx.state.duration)
})
```

## Gérer les erreurs

Une exception levée dans un middleware est attrapée par `Application` et
convertie en réponse JSON. Pour un contrôle total, envoyez la réponse
vous-même :

```ts
app.use(async ({ context, next }) => {
  try {
    await next()
  } catch (error) {
    context.reply.status(500)
    context.reply.send({
      statusCode: 500,
      error: true,
      message: error instanceof Error ? error.message : "Internal error",
      data: null,
    })
  }
})
```

## Bonnes pratiques

- Gardez les middlewares courts et focalisés.
- Utilisez `context.state` plutôt que des variables globales.
- Ne mettez pas de logique métier dans un middleware.
- Préférez un guard nommé pour les règles d'accès réutilisables.
- Vérifiez l'ordre d'enregistrement quand plusieurs middlewares dépendent les
  uns des autres.

## Voir aussi

- [Plugins](/docs/plugins)
- [Sécurité](/docs/security)
- [Réponses et erreurs](/docs/responses)
