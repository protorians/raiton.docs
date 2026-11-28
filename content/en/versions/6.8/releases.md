---
title: "Release notes 6.8"
description: "Declarative scheduler, queues and HMR fixes in Raiton 6.8."
section: versions
order: 70
since: "6.0"
---

## 6.8.9-beta.25

**November 26, 2026** · `v6.8.9-beta.25`

### Scheduler

- `@Scheduler`, `@Cron`, `@Every`, `@Timeout` and `@Task` decorators.
- 5- or 6-field cron expressions, macros and time zones.
- In-memory, Redis and RabbitMQ backends.
- `retries`, `retryDelay`, `timeout`, `concurrency`, `singleton`,
  `catchUp`, `priority` options.
- Job HMR and dependency injection.
- Control API: `dispatch`, `enqueue`, `pause`, `resume`, `cancel`.

### Fixes

- Safe HMR reload of middlewares and hooks.
- Detection of the server's real LAN address.

### Migration from 6.7

No breaking changes. The scheduler is opt-in: jobs only start if
a `*.scheduler.ts` file (or variant) is detected.

### Known limitations

- In-memory queue local to the process.
- No dedicated dead-letter queue.
- Redis and RabbitMQ require the corresponding packages to be installed.
