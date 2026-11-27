---
title: "Observabilité"
description: "Corrélation, métriques Prometheus, traces OTLP, readiness et arrêt gracieux, sans surcoût quand c'est désactivé."
section: fonctionnalites
order: 31
since: "6.9"
---

L'observabilité est **opt-in**. Désactivée, elle n'ajoute aucun travail sur le
chemin chaud.

## Activer

```bash
RAITON_OBSERVABILITY=off|metrics|traces|all
RAITON_METRICS_PATH=/metrics
RAITON_OTEL_ENDPOINT=http://localhost:4318
RAITON_REQUEST_ID_HEADER=x-request-id
RAITON_SHUTDOWN_TIMEOUT_MS=10000
RAITON_ACCESS_LOG=1
```

Ou dans `raiton.config.ts` :

```ts
export default {
  observability: {
    mode: "all",
    metricsPath: "/metrics",
  },
  shutdown: {
    timeoutMs: 10_000,
  },
}
```

## Corrélation

Chaque requête reçoit un identifiant :

- repris de `x-request-id` s'il est valide ;
- sinon généré ;
- présent dans la réponse, les logs et `ctx.state.requestId`.

Les logs d'erreur portent toujours l'identifiant. `RAITON_ACCESS_LOG=1` ajoute
une ligne par requête avec l'identifiant de corrélation et celui de trace.

## Métriques

`GET /metrics` expose le format texte Prometheus :

```text
http_requests_total{method,route,status}
http_request_duration_seconds (histogramme)
http_errors_total{method,route,status}
```

Le chemin est relatif au préfixe de l'application.

## Traces

- Les spans entrants utilisent `traceparent` lorsqu'il est fourni.
- Les appels sortants doivent utiliser `tracedFetch` pour partager la trace.

```ts
import { tracedFetch } from "raiton/framework"

const response = await tracedFetch("https://api.example.com/users")
```

Export OTLP/HTTP JSON vers `RAITON_OTEL_ENDPOINT`.

## Erreurs

Toutes les erreurs HTTP publiques suivent le catalogue
`code → statut → message → docsUrl`. En production, aucune pile d'appels n'est
retournée.

```json
{
  "error": true,
  "code": "NOT_FOUND",
  "statusCode": 404,
  "message": "Route not found",
  "docsUrl": "https://…"
}
```

## Arrêt gracieux

Sur `SIGINT` / `SIGTERM` :

1. readiness passe à `false` (`/health` répond `503`) ;
2. les nouvelles connexions sont refusées ;
3. les requêtes en cours sont drainées jusqu'à `shutdown.timeoutMs` ;
4. le processus sort en `0`.

## Budgets

| Mode | Surcoût cible p50 |
|---|---|
| `off` | 0 mesurable |
| `metrics` | ≤ 5 % |
| `traces` | ≤ 10 % |

## Bonnes pratiques

- Activez `metrics` par défaut en production, `traces` selon le besoin.
- Propager `traceparent` entre services.
- N'ajoutez pas d'identifiants personnels dans les labels Prometheus.
- Surveillez `http_errors_total` et la latence p95, pas seulement le p50.
- Utilisez `/health` pour la readiness, pas `/metrics`.

## Voir aussi

- [Health checks](/docs/health-checks)
- [Déploiement](/docs/deployment)
- [Codes d'erreur](/docs/errors)
