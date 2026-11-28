---
title: "Security"
description: "Protect an API with security headers, CORS, rate limiting, body limit, method guard and CSRF."
section: fonctionnalites
order: 28
since: "6.0"
---

Raiton provides security building blocks that can be enabled at startup. They are
deliberately simple and composable; none is enabled by default except
the basic security headers.

## Security headers

`Application` automatically registers `Security.headers` at startup:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block`

To add to them, add your own middleware after initialization:

```ts
app.use(async ({ context, next }) => {
  context.reply.header("Permissions-Policy", "camera=(), microphone=()")
  await next()
})
```

## CORS

`Security.cors()` returns a **middleware**:

```ts
app.use(Security.cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  headers: ["content-type", "authorization"],
  credentials: true,
  maxAge: 86400,
}))
```

| Option | Role |
|---|---|
| `origin` | `"*"`, `true`, a list, or a `(origin) => boolean` function |
| `methods` | Allowed methods |
| `headers` | Allowed headers |
| `credentials` | Allows cookies |
| `exposeHeaders` | Headers readable by the browser |
| `maxAge` | Preflight cache duration |

### CORS in production

As soon as `credentials: true` is set, `origin: "*"` is forbidden by the Fetch spec: the
browser rejects the response. Compare against an explicit list and accept the
native origins of mobile/desktop webviews:

```ts
const allowedOrigins = (env("CORS_ORIGIN", "") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const isNativeOrigin = (origin: string): boolean =>
  origin === "null" ||
  ["file:", "capacitor:", "tauri:", "ionic:", "expo:", "app:"].some((scheme) =>
    origin.startsWith(scheme),
  )

app.use(Security.cors({
  origin: (origin) =>
    allowedOrigins.includes(origin) || isNativeOrigin(origin),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: [
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Organization-Id",
    "X-CSRF-Token",
    "X-Client-Type",
    "X-Request-Id",
    "Idempotency-Key",
  ],
  credentials: true,
  exposeHeaders: ["X-Request-Id"],
}))
```

Points to watch:

- a header used by a client but missing from `headers` makes the
  preflight fail, even if the route is correct;
- `exposeHeaders` is required to read a custom header on the browser side
  in cross-origin requests;
- a native request without an `Origin` header (React Native, Electron) is not
  subject to CORS; do not artificially add it to the list;
- do not infer origins from `NODE_ENV`: configure them explicitly per
  environment.

## Rate limit

```ts
app.register(Security.rateLimit({
  max: 100,
  windowMs: 60_000,
}))
```

The counter is in memory, per IP address. For a multi-instance deployment,
use a distributed limiter upstream (reverse proxy, Redis).

## Body limit

```ts
app.register(Security.bodyLimit(1_000_000)) // 1 Mo
```

Rejects requests whose `content-length` exceeds the limit with `413`.

:::note
Keep the application limit below the internal `Bun.serve` ceiling (128 MB).
Beyond that, the request is rejected before your middleware and the error
message is not Raiton's.
:::

## Method guard

```ts
app.register(Security.methodGuard(["GET", "POST", "OPTIONS"]))
```

Responds `405 Method Not Allowed` for the other methods.

## CSRF

Two modes are available:

| Mode | Usage |
|---|---|
| `DOUBLE_SUBMIT` | Stateless: cookie + header must match |
| `SYNCHRONIZER` | Stateful: token stored server-side with a TTL |

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

Additional options:

- `client.headerName` and `client.skipClients` for mobile/desktop detection;
- `cookieOptions` (`httpOnly`, `secure`, `sameSite`, `path`, `domain`, `maxAge`).

Mobile and desktop clients generally do not use a session cookie: `skipClients: ["mobile", "desktop"]` avoids imposing a CSRF
token on them that they cannot produce.

```ts
app.use(Security.csrf({
  mode: CSRFModeEnum.DOUBLE_SUBMIT,
  secret: env("CSRF_SECRET", ""),
  cookieName: "_csrf",
  headerName: "X-CSRF-Token",
  skip: ["/api/kyc/webhooks"],
  client: {
    headerName: "X-Client-Type",
    skipClients: ["mobile", "desktop"],
  },
}))
```

:::warning
Exempt a server-to-server webhook **only** if it is authenticated by
another mechanism (HMAC signature, mTLS, API key verified in the use case).
An exempted path without verification is an open door. Verify the signature
on the **raw bytes** of the body, before deserialization.
:::

### CSRF decorators

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

`@CsrfToken()` exposes the token in the `X-CSRF-Token` header.
`@CsrfGuard()` checks the cookie and the header for mutating methods.

:::warning
In `DOUBLE_SUBMIT` mode, the cookie must be readable by your
application's JavaScript (`httpOnly: false`). In `SYNCHRONIZER` mode, the token is stored
server-side and the cookie can remain `httpOnly`.
:::

## HTTPS

Enable TLS with `defineHttps()`:

```ts
import { defineHttps } from "raiton/framework"

const app = new Application({
  port: 5711,
  https: defineHttps(),
})
```

See [HTTPS](/docs/https) for certificates and environments.

## Production checklist

- [ ] Security headers enabled
- [ ] CORS restricted to real origins
- [ ] Rate limit on authentication routes
- [ ] Body limit adapted to uploads
- [ ] CSRF enabled if session cookies are used
- [ ] HTTPS with valid certificates
- [ ] Secrets outside the repository
- [ ] Logs without sensitive data

## See also

- [HTTPS](/docs/https)
- [Observability](/docs/observability)
- [Error codes](/docs/errors)
