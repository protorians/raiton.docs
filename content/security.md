---
title: "Sécurité"
description: "Protéger une API avec les en-têtes de sécurité, CORS, rate limit, body limit, method guard et CSRF."
section: fonctionnalites
order: 28
since: "6.0"
---

Raiton fournit des briques de sécurité activables au démarrage. Elles sont
volontairement simples et composables ; aucune n'est activée par défaut à part
les en-têtes de sécurité de base.

## En-têtes de sécurité

`Application` enregistre automatiquement `Security.headers` au démarrage :

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block`

Pour les compléter, ajoutez votre propre middleware après l'initialisation :

```ts
app.use(async ({ context, next }) => {
  context.reply.header("Permissions-Policy", "camera=(), microphone=()")
  await next()
})
```

## CORS

`Security.cors()` retourne un **middleware** :

```ts
app.use(Security.cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  headers: ["content-type", "authorization"],
  credentials: true,
  maxAge: 86400,
}))
```

| Option | Rôle |
|---|---|
| `origin` | `"*"`, `true`, liste, ou fonction `(origin) => boolean` |
| `methods` | Méthodes autorisées |
| `headers` | En-têtes autorisés |
| `credentials` | Autorise les cookies |
| `exposeHeaders` | En-têtes lisibles par le navigateur |
| `maxAge` | Durée de cache du preflight |

## Rate limit

```ts
app.register(Security.rateLimit({
  max: 100,
  windowMs: 60_000,
}))
```

Le compteur est en mémoire, par adresse IP. Pour un déploiement multi-instances,
utilisez un limiteur distribué en amont (reverse proxy, Redis).

## Body limit

```ts
app.register(Security.bodyLimit(1_000_000)) // 1 Mo
```

Rejette les requêtes dont `content-length` dépasse la limite avec `413`.

## Method guard

```ts
app.register(Security.methodGuard(["GET", "POST", "OPTIONS"]))
```

Répond `405 Method Not Allowed` pour les autres méthodes.

## CSRF

Deux modes sont disponibles :

| Mode | Usage |
|---|---|
| `DOUBLE_SUBMIT` | Stateless : cookie + en-tête doivent correspondre |
| `SYNCHRONIZER` | Stateful : token stocké côté serveur avec TTL |

```ts
import { CSRFModeEnum, Security } from "raiton/framework"

app.register(Security.csrf({
  mode: CSRFModeEnum.DOUBLE_SUBMIT,
  secret: process.env.CSRF_SECRET,
  cookieName: "_csrf",
  headerName: "X-CSRF-Token",
  ttl: 3_600_000,
  methods: ["POST", "PUT", "PATCH", "DELETE"],
  skip: ["/webhooks"],
}))
```

Options complémentaires :

- `client.headerName` et `client.skipClients` pour la détection mobile/desktop ;
- `cookieOptions` (`httpOnly`, `secure`, `sameSite`, `path`, `domain`, `maxAge`).

### Décorateurs CSRF

```ts
import { Controllable, CsrfGuard, CsrfToken, Get, Post } from "raiton/framework"

@Controllable("/forms")
export class FormController {
  @Get("/token")
  @CsrfToken()
  token() {
    return { ok: true }
  }

  @Post("/")
  @CsrfGuard()
  submit() {
    return { ok: true }
  }
}
```

`@CsrfToken()` expose le token dans l'en-tête `X-CSRF-Token`.
`@CsrfGuard()` vérifie le cookie et l'en-tête pour les méthodes mutantes.

:::warning
En mode `DOUBLE_SUBMIT`, le cookie doit être lisible par le JavaScript de votre
application (`httpOnly: false`). En mode `SYNCHRONIZER`, le token est stocké
côté serveur et le cookie peut rester `httpOnly`.
:::

## HTTPS

Activez TLS avec `defineHttps()` :

```ts
import { defineHttps } from "raiton/framework"

const app = new Application({
  port: 5711,
  https: defineHttps(),
})
```

Voir [HTTPS](/docs/https) pour les certificats et les environnements.

## Checklist production

- [ ] En-têtes de sécurité activés
- [ ] CORS restreint aux origines réelles
- [ ] Rate limit sur les routes d'authentification
- [ ] Body limit adapté aux uploads
- [ ] CSRF activé si cookies de session
- [ ] HTTPS avec certificats valides
- [ ] Secrets hors du dépôt
- [ ] Logs sans données sensibles

## Voir aussi

- [HTTPS](/docs/https)
- [Observabilité](/docs/observability)
- [Codes d'erreur](/docs/errors)
