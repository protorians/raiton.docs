---
title: "HTTPS"
description: "Enable TLS, generate local certificates with openssl or mkcert and configure production."
section: fonctionnalites
order: 30
since: "6.0"
---

Raiton's HTTPS module enables TLS on the server, generates local certificates
and merges multiple configurations depending on the environment.

## Quick enablement

```ts
import { Application } from "raiton/core"
import { defineHttps } from "raiton/framework"

const app = new Application({
  port: 5711,
  prefix: "/api",
  https: defineHttps(),
})
```

`defineHttps()` with no argument enables HTTPS in `localhost` mode, with a
self-signed certificate generated via `openssl` in `.raiton/certs/`. The
certificate is reused between restarts.

## Environments

| Environment | Usage | Certificate |
|---|---|---|
| `localhost` | Local development | Self-signed |
| `lan` | Access from another device | Self-signed with the LAN IP |
| `production` | Public server | Provided explicitly |

```ts
import { defineHttps, HttpsEnvironment } from "raiton/framework"

const dev = defineHttps({ environment: HttpsEnvironment.Localhost })
const lan = defineHttps({ environment: HttpsEnvironment.LAN })

const prod = defineHttps({
  environment: HttpsEnvironment.Production,
  certPath: "/etc/ssl/certs/server.pem",
  keyPath: "/etc/ssl/private/server.key",
})
```

## Presets

```ts
import { httpsLan, httpsLocalhost, httpsProduction } from "raiton/framework"

httpsLocalhost()
httpsLan()
httpsProduction({
  cert: fs.readFileSync("./cert.pem", "utf-8"),
  key: fs.readFileSync("./key.pem", "utf-8"),
})
```

## Generator

```ts
import { defineHttps, HttpsGenerator } from "raiton/framework"

defineHttps({ generator: HttpsGenerator.OpenSSL })  // défaut
defineHttps({ generator: HttpsGenerator.Mkcert })   // certificats approuvés
```

`mkcert` must be installed on the machine. It produces certificates trusted by
the browser and the system, which avoids warnings.

## Merge configurations

The `https` field accepts an array merged from left to right:

```ts
const app = new Application({
  port: 5711,
  https: [
    defineHttps({ port: 5711 }),
    httpsLan(),
  ],
})
```

Or manually:

```ts
import { defineHttps, httpsLan, mergeHttps } from "raiton/framework"

const config = mergeHttps(defineHttps(), httpsLan())
```

## Production

- Use certificates provided by your infrastructure (Let's Encrypt,
  load balancer, secret manager).
- Never commit private keys to version control.
- Terminate TLS at the proxy level if your platform already handles it.
- Check that `secure` is enabled on session cookies.
- Test the HTTP → HTTPS redirect at the proxy level.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Self-signed certificate not trusted |
| `EADDRINUSE` | Port already in use |
| `ENOENT .raiton/certs` | Insufficient write permissions |
| `mkcert: command not found` | `mkcert` not installed |

## See also

- [Security](/docs/security)
- [Deployment](/docs/deployment)
- [Runtimes](/docs/runtimes)
