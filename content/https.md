---
title: "HTTPS"
description: "Activer TLS, générer des certificats locaux avec openssl ou mkcert et configurer la production."
section: fonctionnalites
order: 30
since: "6.0"
---

Le module HTTPS de Raiton active TLS sur le serveur, génère des certificats
locaux et fusionne plusieurs configurations selon l'environnement.

## Activation rapide

```ts
import { Application } from "raiton/core"
import { defineHttps } from "raiton/framework"

const app = new Application({
  port: 5711,
  prefix: "/api",
  https: defineHttps(),
})
```

`defineHttps()` sans argument active HTTPS en mode `localhost`, avec un
certificat auto-signé généré via `openssl` dans `.raiton/certs/`. Le certificat
est réutilisé entre les relances.

## Environnements

| Environnement | Usage | Certificat |
|---|---|---|
| `localhost` | Développement local | Auto-signé |
| `lan` | Accès depuis un autre appareil | Auto-signé avec l'IP LAN |
| `production` | Serveur public | Fourni explicitement |

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

## Générateur

```ts
import { defineHttps, HttpsGenerator } from "raiton/framework"

defineHttps({ generator: HttpsGenerator.OpenSSL })  // défaut
defineHttps({ generator: HttpsGenerator.Mkcert })   // certificats approuvés
```

`mkcert` doit être installé sur la machine. Il produit des certificats
approuvés par le navigateur et le système, ce qui évite les avertissements.

## Fusionner des configurations

Le champ `https` accepte un tableau fusionné de gauche à droite :

```ts
const app = new Application({
  port: 5711,
  https: [
    defineHttps({ port: 5711 }),
    httpsLan(),
  ],
})
```

Ou manuellement :

```ts
import { defineHttps, httpsLan, mergeHttps } from "raiton/framework"

const config = mergeHttps(defineHttps(), httpsLan())
```

## Production

- Utilisez des certificats fournis par votre infrastructure (Let's Encrypt,
  load balancer, secret manager).
- Ne versionnez jamais les clés privées.
- Terminez TLS au niveau du proxy si votre plateforme le gère déjà.
- Vérifiez que `secure` est activé sur les cookies de session.
- Testez la redirection HTTP → HTTPS au niveau du proxy.

## Dépannage

| Symptôme | Cause |
|---|---|
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Certificat auto-signé non approuvé |
| `EADDRINUSE` | Port déjà utilisé |
| `ENOENT .raiton/certs` | Droits d'écriture insuffisants |
| `mkcert: command not found` | `mkcert` non installé |

## Voir aussi

- [Sécurité](/docs/security)
- [Déploiement](/docs/deployment)
- [Runtimes](/docs/runtimes)
