---
title: "Scheduler et files d'attente"
description: "Planifier des jobs cron, intervalles et tâches nommées, avec des backends mémoire, Redis ou RabbitMQ."
section: fonctionnalites
order: 25
since: "6.8"
---

Le scheduler de Raiton exécute des jobs planifiés et consomme des files
d'attente. Il est déclaratif, typé et démarré automatiquement avec
l'application.

## Déclarer un scheduler

Créez un fichier `*.scheduler.ts` (ou `*.task.ts`, `*.cron.ts`, `*.job.ts`) :

```ts
import { Cron, Every, Scheduler, Task, Timeout } from "raiton/framework"
import type { TaskContextInterface } from "raiton/types"

@Scheduler({ name: "maintenance", queue: "default" })
export class MaintenanceScheduler {
  @Cron("0 3 * * *", { name: "daily-cleanup", timezone: "Europe/Paris" })
  async cleanup(ctx: TaskContextInterface) {
    await this.reports.purgeOlderThan(30)
  }

  @Every("5m", { name: "heartbeat", immediate: true })
  async heartbeat() {
    await this.metrics.push()
  }

  @Timeout("30s", { name: "warmup" })
  async warmup() {
    await this.cache.warm()
  }

  @Task("email:welcome", {
    queue: "emails",
    consume: true,
    retries: 3,
    concurrency: 5,
  })
  async welcome(ctx: TaskContextInterface<{ to: string }>) {
    await this.mailer.send(ctx.payload!.to)
  }
}
```

Aucun enregistrement supplémentaire : le scanner compile la classe et
`SchedulerManager` arme les jobs.

## Expressions cron

Le parseur accepte 5 champs (`minute heure jour mois jour-semaine`) ou 6 champs
(avec les secondes) :

- `*`, `?`, listes `1,15,45`, plages `1-5`, pas `*/5`, `1-5/2` ;
- noms de mois `JAN`–`DEC`, jours `SUN`–`SAT` ;
- macros `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly`, `@minutely`,
  `@secondly`.

```ts
@Cron("*/5 * * * * *")  // toutes les 5 secondes
@Cron("30 9 * * 1-5")   // du lundi au vendredi à 09:30
```

## Durées

`@Every()` et `@Timeout()` acceptent un nombre de millisecondes ou une durée
lisible : `"5s"`, `"1m30s"`, `"2h"`.

## Tâches nommées

Une méthode `@Task("name")` peut être déclenchée de trois façons :

```ts
import { SchedulerManager } from "raiton/core"

const scheduler = SchedulerManager.current

// In-process
await scheduler.dispatch("email:welcome", { to: "a@b.c" })

// File d'attente
await scheduler.enqueue("email:welcome", { to: "a@b.c" }, { priority: "high" })

// Alias
await scheduler.trigger("email:welcome", { to: "a@b.c" })
```

Si la tâche a `consume: true`, un worker la récupère dans le processus. Sinon,
un autre processus branché sur le même backend peut la consommer.

## Options des jobs

| Option | Défaut | Description |
|---|---|---|
| `name` | dérivé | Nom unique |
| `queue` | `"default"` | File cible |
| `timezone` | `"UTC"` | Fuseau des expressions cron |
| `singleton` | `true` | Empêche deux exécutions simultanées |
| `concurrency` | `1` | Messages consommés en parallèle |
| `retries` | `0` | Nouvelles tentatives |
| `retryDelay` | `0` | Délai (ms ou fonction) |
| `timeout` | — | Durée maximale d'une exécution |
| `catchUp` | `false` | Rejoue un tick manqué |
| `enabled` | `true` | Active le job |
| `consume` | `false` | Consomme la file |
| `immediate` | `false` | `@Every` : exécute au démarrage |
| `priority` | `"normal"` | `lowest` → `highest` |
| `data` | — | Données statiques du contexte |

## Contexte d'exécution

```ts
interface TaskContextInterface<T = any> {
  id: string
  name: string
  queue?: string
  payload?: T
  data?: any
  trigger: "cron" | "interval" | "timeout" | "task"
  attempt: number
  scheduledAt: Date
  startedAt: Date
  scheduler: SchedulerControlInterface
}
```

## Backends

Le backend par défaut est en mémoire. Pour un broker externe :

```ts
import { SchedulerManager, RedisQueueBackend, RabbitMqQueueBackend } from "raiton/core"

const scheduler = SchedulerManager.current

scheduler.registerBackend(
  "redis",
  new RedisQueueBackend({ url: "redis://localhost:6379" }),
)
scheduler.registerBackend(
  "rabbitmq",
  new RabbitMqQueueBackend({ url: "amqp://localhost" }),
)

scheduler.mapQueue("emails", "redis")
```

`redis` et `amqplib` sont importés paresseusement : le framework démarre sans
eux tant que le backend correspondant n'est pas utilisé.

### Backend personnalisé

Implémentez `QueueBackendInterface` :

```ts
class MyBackend implements QueueBackendInterface {
  readonly name = "my-broker"
  async connect() {}
  async disconnect() {}
  async enqueue(queue, message) { return message.id }
  async dequeue(queue, options) { return [] }
  async acknowledge(queue, receipt) {}
  async reject(queue, receipt, requeue) {}
  async length(queue) { return 0 }
  async purge(queue) {}
}
```

## Contrôle

```ts
const scheduler = SchedulerManager.current

scheduler.pause("daily-cleanup")
scheduler.resume("daily-cleanup")
scheduler.cancel("daily-cleanup")

scheduler.getJobs()
scheduler.getJob("daily-cleanup") // nextRun, lastRun, runCount, failCount…
```

## Configuration globale

```ts
SchedulerManager.current.configure({
  enabled: true,
  timezone: "UTC",
  defaultQueue: "default",
  maxConcurrentJobs: 100,
})
```

## Limites

- La file mémoire est locale au processus : pas de persistance.
- Redis et RabbitMQ nécessitent l'installation du paquet correspondant.
- Il n'y a pas de file « dead-letter » dédiée : un échec définitif est
  abandonné après les tentatives configurées.

## Voir aussi

- [Déploiement](/docs/deployment)
- [Observabilité](/docs/observability)
- [Référence core](/docs/core-api)
