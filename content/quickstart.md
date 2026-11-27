---
title: "Démarrage rapide"
description: "Créer un projet Raiton, écrire un contrôleur, lancer le serveur et appeler votre première route en moins de cinq minutes."
section: demarrage
order: 3
since: "6.0"
---

Le point d'entrée attendu est un fichier `main.ts` placé dans le `rootDir`
configuré par `raiton.config.ts` (ou `raiton.config.js`). Ce fichier exporte une
fonction par défaut qui relie votre `Application` au thread Raiton. Le code
applicatif vit dans `source/controllers`, `source/services`,
`source/repositories` et `source/modules`.

## 1. Créer le projet

La CLI génère un projet complet, avec configuration, contrôleur d'exemple,
scripts et test :

```bash
bun raiton new my-api --template api --runtime bun --yes
cd my-api
bun raiton dev
bun test
```

`bun raiton` utilise la version locale du CLI. Si la commande `raiton` n'est pas
disponible, `bunx raiton new …` télécharge et exécute la même CLI sans
installation globale.

Templates disponibles :

| Template | Contenu |
|---|---|
| `api` | Bootstrapper, contrôleur d'exemple, service et test |
| `minimal` | Bootstrapper, service d'exemple et test |
| `mcp-agent` | Serveur MCP d'exemple avec l'outil `add` et test |

Les templates `api` et `mcp-agent` exposent aussi `GET /api/health`.
`--dry-run` affiche le plan sans écrire, `--offline` et `--no-install`
désactivent l'installation des dépendances. Voir
[`raiton new`](/docs/cli-new) pour toutes les options.

### Configuration générée

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  version: "0.1.0",
  port: 5711,
  hostname: "0.0.0.0",
  prefix: "/api",
  pathname: "/",
  artifacts: {
    types: ["controller", "service", "repository", "dto", "mcp"],
  },
})
```

`rootDir` est la racine lue par le scanner : elle contient `main.ts` et les
artifacts. Sur Node.js, le template génère plutôt `raiton.config.js`. Voir
[Configuration](/docs/configuration) pour ajuster le port, le préfixe ou les
options d'observabilité.

## 2. Amorcer le framework

Le fichier `main.ts` doit se trouver dans le `rootDir` défini par la
configuration. Il exporte une fonction par défaut qui lie votre `Application`
au thread Raiton :

```ts
import "reflect-metadata"
import { ThreadInterface } from "raiton/types"
import { Application } from "raiton/core"
import { RuntimeType } from "raiton/framework"

export default async (thread: ThreadInterface) => {
  const app = new Application({
    port: 5711,
    prefix: "/api"
  })

  return await thread.setup({
    application: app,
    runtime: RuntimeType.Bun
  }).run()
}
```

- `thread.setup({ application, runtime })` enregistre le body parser, choisit
  l'adaptateur du runtime et prépare le serveur ;
- `thread.run()` scanne le `rootDir`, monte les routes puis écoute sur le port ;
- avec le `rootDir` par défaut (`./source`), ce fichier est donc
  `source/main.ts`.

## 3. Écrire un contrôleur

Le template `api` contient déjà un contrôleur d'exemple. Voici comment écrire
le vôtre :

```ts
// source/controllers/tasks.controller.ts
import { Body, Controllable, Delete, Get, Param, Post } from "raiton/framework"
import { Input, Output, t, type Infer } from "raiton/contracts"

const TaskSchema = t.object({
  id: t.string(),
  title: t.string().min(1),
  done: t.boolean(),
})
type Task = Infer<typeof TaskSchema>

const CreateTaskSchema = t.object({
  title: t.string().min(1),
})
type CreateTask = Infer<typeof CreateTaskSchema>

@Controllable("/tasks")
export class TasksController {
  private tasks = new Map<string, Task>()

  @Get("/")
  @Output(t.array(TaskSchema))
  list() {
    return [...this.tasks.values()]
  }

  @Get("/:id")
  @Output(TaskSchema)
  get(@Param("id") id: string) {
    return this.tasks.get(id) ?? { id, title: "inconnue", done: false }
  }

  @Post("/")
  @Input(CreateTaskSchema)
  @Output(TaskSchema)
  create(@Body() input: CreateTask) {
    const task: Task = { id: crypto.randomUUID(), title: input.title, done: false }
    this.tasks.set(task.id, task)
    return task
  }

  @Delete("/:id")
  remove(@Param("id") id: string) {
    this.tasks.delete(id)
    return { removed: id }
  }
}
```

Le fichier est détecté automatiquement grâce au suffixe `.controller.ts`. Le
scanner lit les métadonnées des décorateurs et monte les routes sous le préfixe
global `/api`.

## 4. Appeler l'API

```bash
curl http://localhost:5711/api/health
curl http://localhost:5711/api/tasks

curl -X POST http://localhost:5711/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Écrire la documentation"}'

curl http://localhost:5711/api/tasks/<id>
```

Une entrée invalide est rejetée **avant** le handler :

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "statusCode": 400,
  "details": [
    {
      "path": "title",
      "code": "too_small",
      "message": "Expected string to have >=1 characters"
    }
  ]
}
```

## 5. Explorer

```bash
bun raiton routes                 # routes montées
bun raiton inspect --json         # manifeste du projet
bun raiton why GET /api/tasks     # fichier et ligne d'une route
bun raiton generate resource users # contrôleur, service, dépôt, DTO et test
bun raiton openapi export         # contrat OpenAPI
bun raiton doctor                 # diagnostic
```

En développement, une page de découverte est disponible sur `/api/__dev` :
routes, artefacts, graphe d'injection, jobs et événements HMR.

## 6. Tester

```bash
bun test
```

Le template `api` inclut un test de service. Pour tester sans ouvrir de port,
montez le contrôleur avec `compileController` et fournissez une réponse mock :

```ts
import { Application, compileController } from "raiton/core"
import { TasksController } from "./controllers/tasks.controller"

class MockReply {
  statusCode = 200
  body: unknown

  status(code: number) {
    this.statusCode = code
  }

  header() {}

  send(body: unknown) {
    this.body = body
  }
}

const app = new Application({ prefix: "/api" })
compileController(TasksController, app)

const reply = new MockReply()
await app.handle(
  { method: "GET", url: "/api/tasks", headers: new Headers() },
  reply,
)

console.log(reply.statusCode, reply.body)
```

Voir [Tests](/docs/testing) pour les requêtes POST et les contrats.

## Et ensuite ?

- Ajoutez une base de données dans un service injecté :
  [Injection de dépendances](/docs/injection)
- Documentez l'API : [OpenAPI](/docs/openapi)
- Exposez des outils IA : [MCP](/docs/mcp)
- Planifiez des tâches : [Scheduler](/docs/scheduler)
- Suivez le tutoriel complet : [Construire une API](/docs/tutorial)
