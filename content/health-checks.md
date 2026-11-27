---
title: "Health checks"
description: "Exposer un endpoint de santé, ajouter des vérifications de dépendances et gérer la readiness."
section: fonctionnalites
order: 29
since: "6.6"
---

Raiton enregistre automatiquement `GET /health` si aucun health check n'est
défini. L'endpoint sert aux sondes de liveness et de readiness.

## Endpoint par défaut

```json
{
  "statusCode": 200,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2026-09-03T12:00:00.000Z",
    "uptime": 42.1,
    "version": "0.0.0"
  }
}
```

Dès que vous déclarez un health check, le défaut est remplacé.

## Health check personnalisé

```ts
import { Controllable, Get, HealthCheck, HttpStatus, RaitonResponses } from "raiton/framework"

@Controllable()
export class HealthController {
  @Get("/health")
  @HealthCheck({ summary: "État de l'application" })
  check() {
    return RaitonResponses(
      "Service is healthy",
      { status: "healthy" },
      HttpStatus.OK,
      { error: false },
    )
  }
}
```

| Option | Défaut | Rôle |
|---|---|---|
| `path` | `/health` | Chemin documenté |
| `tags` | `["Health"]` | Tags OpenAPI |
| `summary` | — | Résumé |
| `description` | — | Description |
| `excludeFromDocs` | `false` | Masquer dans OpenAPI |

## Vérifications de dépendances

```ts
import { HealthCheckManager } from "raiton/framework"

HealthCheckManager.configure({
  checks: [
    {
      name: "database",
      check: async () => {
        await db.ping()
        return { status: "healthy" }
      },
    },
    {
      name: "cache",
      check: async () => ({ status: "degraded", message: "latence élevée" }),
    },
  ],
})
```

Les résultats sont agrégés dans `data.checks`. Le statut global est :

| Statut | Code HTTP |
|---|---|
| `healthy` | `200` |
| `degraded` | `200` (ou le code configuré) |
| `unhealthy` | `503` |

## Handler entièrement personnalisé

```ts
HealthCheckManager.registerCustomHandler(() => ({
  ok: true,
  memory: process.memoryUsage(),
}))
```

## Readiness et arrêt gracieux

Pendant un arrêt, la readiness passe à `false` et `/health` répond `503` avec
la raison. Les nouvelles connexions sont refusées et les requêtes en cours sont
drainées jusqu'à `shutdown.timeoutMs`.

```ts
export default {
  shutdown: { timeoutMs: 10_000 },
}
```

## Bonnes pratiques

- Gardez `/health` léger : pas d'appel réseau lourd à chaque sonde.
- Séparez liveness (`processus vivant`) et readiness (`prêt à servir`) si votre
  orchestrateur le permet.
- Vérifiez uniquement les dépendances critiques.
- N'exposez pas `/health` publiquement si vous y mettez des détails internes.

## Voir aussi

- [Observabilité](/docs/observability)
- [Déploiement](/docs/deployment)
- [Sécurité](/docs/security)
