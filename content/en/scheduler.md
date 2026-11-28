---
title: "Scheduler and queues"
description: "Schedule cron jobs, intervals, and named tasks with in-memory, Redis, or RabbitMQ backends."
section: fonctionnalites
order: 25
since: "6.8"
---

Raiton's scheduler runs scheduled jobs and consumes queues. It is declarative,
typed, and started automatically with the application.

## Declaring a scheduler

Create a `*.scheduler.ts` file (or `*.task.ts`, `*.cron.ts`, `*.job.ts`):

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

No additional registration: the scanner compiles the class and
`SchedulerManager` arms the jobs.

## Cron expressions

The parser accepts 5 fields (`minute heure jour mois jour-semaine`) or 6 fields
(with seconds):

- `*`, `?`, lists `1,15,45`, ranges `1-5`, steps `*/5`, `1-5/2`;
- month names `JAN`–`DEC`, days `SUN`–`SAT`;
- macros `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly`, `@minutely`,
  `@secondly`.

```ts
@Cron("*/5 * * * * *")  // toutes les 5 secondes
@Cron("30 9 * * 1-5")   // du lundi au vendredi à 09:30
```

## Durations

`@Every()` and `@Timeout()` accept a number of milliseconds or a human-readable
duration: `"5s"`, `"1m30s"`, `"2h"`.

## Named tasks

A `@Task("name")` method can be triggered in three ways:

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

If the task has `consume: true`, a worker picks it up in the process. Otherwise,
another process connected to the same backend can consume it.

## Job options

| Option | Default | Description |
|---|---|---|
| `name` | derived | Unique name |
| `queue` | `"default"` | Target queue |
| `timezone` | `"UTC"` | Timezone for cron expressions |
| `singleton` | `true` | Prevents two simultaneous executions |
| `concurrency` | `1` | Messages consumed in parallel |
| `retries` | `0` | Retries |
| `retryDelay` | `0` | Delay (ms or function) |
| `timeout` | — | Maximum duration of an execution |
| `catchUp` | `false` | Replays a missed tick |
| `enabled` | `true` | Enables the job |
| `consume` | `false` | Consumes the queue |
| `immediate` | `false` | `@Every`: runs at startup |
| `priority` | `"normal"` | `lowest` → `highest` |
| `data` | — | Static context data |

## Execution context

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

The default backend is in-memory. For an external broker:

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

`redis` and `amqplib` are imported lazily: the framework starts without them as
long as the corresponding backend is not used.

### Custom backend

Implement `QueueBackendInterface`:

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

## Control

```ts
const scheduler = SchedulerManager.current

scheduler.pause("daily-cleanup")
scheduler.resume("daily-cleanup")
scheduler.cancel("daily-cleanup")

scheduler.getJobs()
scheduler.getJob("daily-cleanup") // nextRun, lastRun, runCount, failCount…
```

## Global configuration

```ts
SchedulerManager.current.configure({
  enabled: true,
  timezone: "UTC",
  defaultQueue: "default",
  maxConcurrentJobs: 100,
})
```

## Limitations

- The in-memory queue is local to the process: no persistence.
- Redis and RabbitMQ require installing the corresponding package.
- There is no dedicated dead-letter queue: a final failure is abandoned after the
  configured attempts.

## See also

- [Deployment](/docs/deployment)
- [Observability](/docs/observability)
- [Core reference](/docs/core-api)
