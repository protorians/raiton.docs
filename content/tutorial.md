---
title: "Construire une API complète"
description: "De zéro à une API de tâches avec contrôleur, service, dépôt, contrats, erreurs, tests et client généré."
section: guides
order: 60
since: "6.0"
---

Ce tutoriel construit une API de gestion de tâches, sans base de données, pour
se concentrer sur les couches et les contrats.

## 1. Créer le projet

```bash
bunx raiton new tasks-api --template minimal --runtime bun --yes
cd tasks-api
```

## 2. Définir les contrats

```ts
// source/tasks/tasks.contract.ts
import { t, type Infer } from "raiton/contracts"

export const TaskSchema = t.object({
  id: t.string(),
  title: t.string().min(1).max(120),
  done: t.boolean(),
  createdAt: t.string(),
})

export type Task = Infer<typeof TaskSchema>

export const CreateTaskSchema = t.object({
  title: t.string().min(1).max(120),
})

export type CreateTask = Infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = t.object({
  title: t.string().min(1).max(120).optional(),
  done: t.boolean().optional(),
})

export type UpdateTask = Infer<typeof UpdateTaskSchema>
```

## 3. Écrire le dépôt

```ts
// source/tasks/tasks.repository.ts
import { Injectable } from "raiton/framework"
import { LifetimeEnum } from "@protorians/core"
import type { Task } from "./tasks.contract"

@Injectable(LifetimeEnum.SINGLETON)
export class TasksRepository {
  private readonly tasks = new Map<string, Task>()

  all(): Task[] {
    return [...this.tasks.values()]
  }

  find(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  save(task: Task): Task {
    this.tasks.set(task.id, task)
    return task
  }

  delete(id: string): boolean {
    return this.tasks.delete(id)
  }
}
```

## 4. Écrire le service

```ts
// source/tasks/tasks.service.ts
import { Inject, Injectable } from "raiton/framework"
import { LifetimeEnum } from "@protorians/core"
import { TasksRepository } from "./tasks.repository"
import type { CreateTask, Task, UpdateTask } from "./tasks.contract"

@Injectable(LifetimeEnum.SINGLETON)
export class TasksService {
  constructor(@Inject(TasksRepository) private readonly repo: TasksRepository) {}

  list(): Task[] {
    return this.repo.all()
  }

  get(id: string): Task {
    const task = this.repo.find(id)
    if (!task) throw new TaskNotFoundError(id)
    return task
  }

  create(input: CreateTask): Task {
    return this.repo.save({
      id: crypto.randomUUID(),
      title: input.title,
      done: false,
      createdAt: new Date().toISOString(),
    })
  }

  update(id: string, input: UpdateTask): Task {
    const task = this.get(id)
    return this.repo.save({ ...task, ...input })
  }

  remove(id: string): void {
    if (!this.repo.delete(id)) throw new TaskNotFoundError(id)
  }
}

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Tâche introuvable : ${id}`)
  }
}
```

## 5. Exposer le contrôleur

```ts
// source/tasks/tasks.controller.ts
import {
  Body,
  Controllable,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from "raiton/framework"
import { Input, Output, t } from "raiton/contracts"
import { TasksService, TaskNotFoundError } from "./tasks.service"
import {
  CreateTaskSchema,
  TaskSchema,
  UpdateTaskSchema,
  type CreateTask,
  type UpdateTask,
} from "./tasks.contract"

@Controllable("/tasks")
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasks: TasksService) {}

  @Get("/")
  @Output(t.array(TaskSchema))
  list() {
    return this.tasks.list()
  }

  @Get("/:id")
  @Input({ params: t.object({ id: t.string() }) })
  @Output(TaskSchema)
  get(@Param("id") id: string) {
    try {
      return this.tasks.get(id)
    } catch {
      throw new HttpException("Tâche introuvable", HttpStatus.NOT_FOUND)
    }
  }

  @Post("/")
  @Input(CreateTaskSchema)
  @Output(TaskSchema)
  create(@Body() input: CreateTask) {
    return this.tasks.create(input)
  }

  @Patch("/:id")
  @Input(UpdateTaskSchema)
  @Output(TaskSchema)
  update(@Param("id") id: string, @Body() input: UpdateTask) {
    return this.tasks.update(id, input)
  }

  @Delete("/:id")
  remove(@Param("id") id: string) {
    try {
      this.tasks.remove(id)
      return { removed: id }
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND)
      }
      throw error
    }
  }
}
```

## 6. Documenter et générer le client

```bash
bun raiton openapi export --out openapi.json
bun raiton client --out ./sdk --base-url http://localhost:5711/api
```

```ts
import { configureClient, getTasks, postTasks } from "./sdk"

configureClient({ baseUrl: "http://localhost:5711/api" })

const tasks = await getTasks()
await postTasks({ title: "Écrire les tests" })
```

Les noms de fonctions suivent `méthode + chemin` : `GET /tasks` → `getTasks`,
`POST /tasks` → `postTasks`.

## 7. Tester

```ts
import { describe, expect, it } from "bun:test"
import { Application, compileController } from "raiton/core"
import { TasksController } from "../source/tasks/tasks.controller"

class MockReply {
  statusCode = 200
  body: any

  status(code: number) {
    this.statusCode = code
  }

  header() {}

  send(body: any) {
    this.body = body
  }
}

describe("tasks", () => {
  const app = new Application({ prefix: "/api" })
  compileController(TasksController, app)

  it("crée une tâche", async () => {
    const reply = new MockReply()

    await app.handle(
      {
        method: "POST",
        url: "/api/tasks",
        headers: new Headers({ "content-type": "application/json" }),
        body: { title: "Test" },
      },
      reply,
    )

    expect(reply.statusCode).toBe(200)
    expect(reply.body.title).toBe("Test")
  })
})
```

## 8. Aller plus loin

- Ajoutez une base de données dans le dépôt.
- Protégez les routes avec `@Guard`.
- Ajoutez `@Cache` sur la liste.
- Exposez `createTask` comme outil MCP.
- Ajoutez un health check qui vérifie la base.

## Voir aussi

- [Contrats](/docs/contracts)
- [Injection](/docs/injection)
- [Tests](/docs/testing)
- [Déploiement](/docs/deployment)
