---
title: "Runtimes"
description: "Exécuter la même application sur Bun, Node.js et Deno, forcer un runtime et comprendre les adaptateurs."
section: concepts
order: 17
since: "6.0"
---

Raiton abstrait le serveur HTTP derrière un adaptateur. Le même contrôleur
fonctionne sur Bun, Node.js et Deno ; seuls le démarrage et certaines
optimisations changent.

## Choisir un runtime

```ts
import { RuntimeType } from "raiton/framework"

return await thread
  .setup({
    application: app,
    runtime: RuntimeType.Bun,
  })
  .run()
```

Si `runtime` est omis, Raiton détecte l'environnement :

1. Bun si `globalThis.Bun` existe ;
2. Deno si `globalThis.Deno` existe ;
3. Node.js sinon.

| Runtime | Serveur | Exécution TS | Recommandation |
|---|---|---|---|
| Bun | `Bun.serve` | Native | **Production et développement** |
| Node.js | `node:http` | Via bundler | Compatibilité et écosystème |
| Deno | `Deno.serve` | Native | Production Deno |

## Commandes par runtime

```bash
# Bun
bun raiton dev
bun raiton start

# Node.js (CLI précompilée)
node build/bin/index.mjs dev
node build/bin/index.mjs start

# Deno
deno task dev
deno task start
deno task compile   # binaire autonome
```

## Bun

- `Bun.serve()` natif ;
- `Request` / `Response` standards ;
- HMR et import TypeScript directs ;
- sockets via l'API Bun ;
- recommandé pour les performances.

```ts
import { Runtime, RuntimeType } from "raiton/framework"

const runtime = new Runtime(RuntimeType.Bun)
const server = runtime.createServer(handler)
await server.listen(5711, "0.0.0.0")
```

## Node.js

L'adaptateur Node enveloppe `IncomingMessage` et `ServerResponse` pour exposer
la même interface que les runtimes Web :

```text
node/
├── server.ts   → node:http.createServer
├── request.ts  → NodeRequest
└── reply.ts    → NodeReply
```

En production, le CLI compile l'application avec esbuild vers
`.raiton/server/main.mjs`, puis l'exécute. Cela permet d'utiliser Node sans
runtime TypeScript.

## Deno

- `Deno.serve()` ;
- `Deno.upgradeWebSocket()` pour les sockets ;
- permissions natives ;
- compilation en binaire autonome possible.

```bash
deno task compile
./build/bin/raiton start
```

## Différences à connaître

| Sujet | Bun | Node.js | Deno |
|---|---|---|---|
| Import TS direct | Oui | Non | Oui |
| HMR | Oui | Oui (CLI) | Oui (`--watch`) |
| Sockets | Oui | Limité | Oui |
| Binaire autonome | Oui | Non | Oui |
| `process.env` | Oui | Oui | Via `Deno.env` / compat |

Raiton normalise les variables d'environnement avec `env()` ; utilisez ce helper
plutôt que `process.env` directement si vous ciblez Deno.

```ts
import { env } from "raiton/framework"

const port = env("PORT", 5711, Number)
```

## Vérifier le runtime

```ts
import { Runtime, RuntimeType } from "raiton/framework"

const runtime = new Runtime(RuntimeType.Bun)
runtime.isBun   // true
runtime.isNode  // false
runtime.isDeno  // false
```

## Bonnes pratiques

- Développez sur Bun, livrez sur le runtime de votre infrastructure.
- Testez au moins une fois sur le runtime de production : les APIs de fichiers,
  les sockets et les permissions diffèrent.
- Utilisez `env()` pour les variables d'environnement.
- Évitez les APIs spécifiques à un runtime dans les services métier.

## Voir aussi

- [Installation](/docs/installation)
- [Déploiement](/docs/deployment)
- [Variables d'environnement](/docs/environment)
