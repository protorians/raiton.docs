---
title: "Déploiement"
description: "Préparer et déployer une application Raiton sur Bun, Node.js ou Deno, avec Docker, TLS et observabilité."
section: guides
order: 62
since: "6.0"
---

## Construire

```bash
bun raiton build
```

Le build compile le bootstrapper vers `.raiton/server/main.mjs` et vérifie les
types. Sur Node.js, `start` exécute ce fichier ; sur Bun et Deno, le bootstrapper
TypeScript est exécuté directement. Ajoutez `tsc --noEmit` en CI pour bloquer
les erreurs de type.

## Lancer

```bash
# Bun
bun raiton start

# Node.js
node build/bin/index.mjs start

# Deno
deno task start
# ou un binaire autonome
deno task compile && ./build/bin/raiton start
```

## Variables d'environnement

```bash
NODE_ENV=production
PORT=5711
RAITON_OBSERVABILITY=metrics
RAITON_SHUTDOWN_TIMEOUT_MS=10000
```

Ne versionnez jamais les secrets. Validez les variables obligatoires au
démarrage.

## Docker (Bun)

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun raiton build

ENV NODE_ENV=production
EXPOSE 5711

HEALTHCHECK --interval=30s --timeout=3s \
  CMD bun -e "fetch('http://localhost:5711/api/health').then(r=>process.exit(r.ok?0:1))"

CMD ["bun", "raiton", "start"]
```

## Docker (Node.js)

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.raiton ./.raiton
COPY --from=build /app/package.json ./
ENV NODE_ENV=production
EXPOSE 5711
CMD ["node", ".raiton/server/main.mjs"]
```

## Reverse proxy et TLS

Terminez TLS au niveau du proxy (Caddy, Nginx, load balancer) ou activez
`defineHttps()` si Raiton expose directement le port.

```caddyfile
api.example.com {
  reverse_proxy localhost:5711
  encode zstd gzip
}
```

## Health checks

- **Liveness** : le processus répond.
- **Readiness** : `/health` renvoie `200` et `status: "healthy"`.
- Pendant un arrêt, `/health` renvoie `503`.

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5711/api/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```

## Observabilité

```bash
RAITON_OBSERVABILITY=all
RAITON_OTEL_ENDPOINT=http://otel-collector:4318
RAITON_ACCESS_LOG=1
```

- `/metrics` pour Prometheus ;
- traces OTLP vers le collector ;
- `x-request-id` propagé dans les logs.

## Arrêt gracieux

Le conteneur doit recevoir `SIGTERM` et laisser le temps aux requêtes de finir.
Configurez `shutdown.timeoutMs` en dessous du `terminationGracePeriodSeconds` de
l'orchestrateur.

```yaml
terminationGracePeriodSeconds: 30
```

## Scheduler en multi-instances

Par défaut, la file est en mémoire : chaque instance possède ses propres jobs.
Pour un déploiement multi-instances :

- utilisez Redis ou RabbitMQ ;
- définissez `singleton` pour éviter les doublons ;
- ou exécutez le scheduler dans un processus dédié.

## Checklist

- [ ] `bun raiton build` passe en CI
- [ ] `/health` répond et la readiness est branchée
- [ ] Les migrations de base sont exécutées
- [ ] Les secrets viennent de l'environnement
- [ ] CORS et rate limit configurés
- [ ] HTTPS activé
- [ ] Métriques et logs collectés
- [ ] `SIGTERM` géré et grace period suffisante
- [ ] Le scheduler est conscient du nombre d'instances

## Voir aussi

- [Runtimes](/docs/runtimes)
- [Health checks](/docs/health-checks)
- [Observabilité](/docs/observability)
- [Sécurité](/docs/security)
