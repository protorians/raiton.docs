---
title: "Tests"
description: "Tester les services, les contrôleurs, les contrats et les serveurs MCP avec bun test."
section: guides
order: 63
since: "6.0"
---

Raiton s'appuie sur les outils standard : `bun test`, `node:test` ou tout
runner compatible. Le framework n'impose pas de bibliothèque de mock.

## Lancer les tests

```bash
bun test
bun test --watch
bun test tests/users.test.ts
```

## Tester un service

```ts
import { describe, expect, it } from "bun:test"
import { TasksService } from "../source/tasks/tasks.service"
import { TasksRepository } from "../source/tasks/tasks.repository"

describe("TasksService", () => {
  it("crée une tâche", () => {
    const service = new TasksService(new TasksRepository())
    const task = service.create({ title: "Test" })

    expect(task.id).toBeString()
    expect(task.done).toBe(false)
  })
})
```

Les services reçoivent leurs dépendances par constructeur : vous pouvez passer
un faux dépôt sans conteneur.

## Tester un contrôleur

Deux approches :

### Via `Application.handle`

`handle()` attend une requête normalisée et une réponse qui expose `status()`,
`header()` et `send()`. Créez un petit mock et montez le contrôleur avec
`compileController` :

```ts
import { Application, compileController } from "raiton/core"
import { TasksController } from "../source/tasks/tasks.controller"

class MockReply {
  statusCode = 200
  headers = new Headers()
  body: any

  status(code: number) {
    this.statusCode = code
  }

  header(name: string, value: string) {
    this.headers.set(name, value)
  }

  send(body: any) {
    this.body = body
  }
}

const app = new Application({ prefix: "/api" })
compileController(TasksController, app)

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
```

C'est la manière la plus proche de la production : body parser, middlewares et
validation sont exécutés.

### En appelant la méthode

Pour tester une règle isolée, instanciez le contrôleur avec ses dépendances et
appelez la méthode. Les décorateurs n'interviennent pas.

## Tester les contrats

```ts
import { validateContract } from "raiton/contracts"
import { CreateTaskSchema } from "../source/tasks/tasks.contract"

it("rejette un titre vide", async () => {
  const result = await validateContract(CreateTaskSchema, { title: "" })
  expect(result.success).toBe(false)
  expect(result.issues[0].path).toBe("title")
})
```

Testez aussi la route complète pour vérifier le payload `VALIDATION_ERROR`.

```ts
const reply = new MockReply()

await app.handle(
  {
    method: "POST",
    url: "/api/tasks",
    headers: new Headers({ "content-type": "application/json" }),
    body: { title: "" },
  },
  reply,
)

expect(reply.statusCode).toBe(400)
expect(reply.body.code).toBe("VALIDATION_ERROR")
expect(reply.body.details[0].path).toBe("title")
```

## Tester les sockets et MCP

- **Sockets** : ouvrez une connexion vers un serveur de test et vérifiez les
  messages. Le support varie selon le runtime.
- **MCP** : utilisez la suite de conformité du CLI.

```bash
bun raiton mcp conformance --json
```

## Mocker le temps

Pour les schedulers, évitez d'attendre réellement. Testez la fonction métier
directement, puis vérifiez la configuration du job via
`SchedulerManager.getJobs()`.

## CI

```yaml
- run: bun install --frozen-lockfile
- run: bun raiton doctor --json
- run: bun test
- run: bun raiton openapi export --out openapi.json
- run: bun raiton contract check --baseline contracts.baseline.json
```

## Bonnes pratiques

- Testez les cas invalides autant que les cas valides.
- Un test d'intégration par route critique.
- Pas de réseau réel dans les tests unitaires.
- Isolez les variables d'environnement.
- Vérifiez les codes d'erreur, pas seulement les messages.

## Voir aussi

- [Contrats](/docs/contracts)
- [Codes d'erreur](/docs/errors)
- [CLI contrats](/docs/cli-openapi)
