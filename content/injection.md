---
title: "Injection de dépendances"
description: "Déclarer des services injectables, choisir un cycle de vie, injecter par constructeur ou propriété et gérer l'arrêt."
section: concepts
order: 13
since: "6.0"
---

Raiton embarque un conteneur d'injection de dépendances. Les contrôleurs sont
enregistrés automatiquement ; les services, dépôts et adaptateurs doivent être
marqués avec `@Injectable()`.

```ts
import { Injectable } from "raiton/framework"

@Injectable()
export class UsersService {
  private users = [{ id: "1", name: "Alice" }]

  findAll() {
    return this.users
  }
}
```

## Cycles de vie

`@Injectable(lifetime?, name?, scope?)` accepte un `LifetimeEnum` importé de
`@protorians/core` :

| Cycle | Comportement |
|---|---|
| `LifetimeEnum.TRANSIENT` | Une nouvelle instance à chaque résolution. **Défaut.** |
| `LifetimeEnum.SINGLETON` | Une instance partagée par scope. |

```ts
import { LifetimeEnum } from "@protorians/core"
import { Injectable } from "raiton/framework"

@Injectable(LifetimeEnum.SINGLETON)
export class DatabaseService {
  private connection?: Connection

  onMount() {
    this.connection = connect(process.env.DATABASE_URL!)
  }

  async onUnmount() {
    await this.connection?.close()
  }
}
```

:::warning
Le défaut de `@Injectable()` est **transient**, pas singleton. Pour un service
qui ouvre une connexion, un pool ou un cache, déclarez explicitement
`LifetimeEnum.SINGLETON`.
:::

## Injecter une dépendance

```ts
import { Controllable, Get, Inject } from "raiton/framework"

@Controllable("/users")
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly users: UsersService,
  ) {}

  @Get("/")
  list() {
    return this.users.findAll()
  }
}
```

`@Inject()` sans argument déduit le type depuis `design:paramtypes` (constructeur)
ou `design:type` (propriété). Utilisez un token explicite quand le type est une
interface, un générique ou une valeur configurable.

```ts
export const DATABASE = Symbol("database")

@Injectable()
export class UserRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
}
```

Injection par propriété :

```ts
@Injectable()
export class ReportService {
  @Inject() private readonly users!: UsersService
}
```

## Enregistrer manuellement

```ts
import { Injection } from "raiton/core"
import { LifetimeEnum } from "@protorians/core"

Injection.registry("mailer", MailService, LifetimeEnum.SINGLETON)
Injection.registry("request-scope", RequestService, LifetimeEnum.TRANSIENT)

const mailer = Injection.get<MailService>("mailer")
```

| Méthode | Rôle |
|---|---|
| `registry(name, construct, lifetime?, scope?)` | Enregistrer une classe |
| `get(name, scope?)` | Résoudre une instance |
| `has(name)` | Vérifier l'existence |
| `resolve(construct)` | Résoudre depuis un constructeur |
| `clear()` | Vider le conteneur |
| `shutdown()` | Appeler `onUnmount()` puis vider |

## Composition root : garantir l'enregistrement

Le scanner monte les contrôleurs, mais il n'évalue que les fichiers réellement
importés. Une implémentation concrète décorée avec `@Injectable()` mais jamais
référencée ne s'enregistre pas, et la résolution échoue :

```text
Dependency PrismaUserRepository not registered
```

Sur une API modulaire, créez un module de composition qui importe les
implémentations concrètes, puis importez-le en premier dans `main.ts` :

```ts
// source/shared/infrastructure/di/composition-root.ts
import "@/modules/identity/infrastructure/persistence/prisma-user.repository"
import "@/modules/identity/application/session-refresh-token.service"
import "@/modules/organization/infrastructure/persistence/prisma-organization.repository"
import "@/shared/infrastructure/database/prisma.service"
```

```ts
// source/main.ts
import "reflect-metadata"
import "@/shared/infrastructure/di/composition-root"
import { Application } from "raiton/core"
```

Quelques règles :

- importez le composition root **avant** de créer l'`Application` ;
- quand un service résout une dépendance au démarrage, importez l'adaptateur
  avant le service ;
- ne mettez aucune logique dans le composition root, uniquement des imports ;
- gardez un bloc commenté par domaine pour retrouver l'implémentation.

### Démarrer un service au boot

`Application.container` pointe vers `Injection`. Utilisez `resolve()` pour
démarrer explicitement un scheduler ou un worker :

```ts
try {
  await Application.container.resolve(ReminderSchedulerService)
} catch (error) {
  console.error("Scheduler indisponible", error)
}
```

Un échec de service de fond ne doit pas empêcher le serveur d'écouter, sauf si
ce service porte une garantie de sécurité.

## Cycle de vie des instances

Si une instance expose ces méthodes, le conteneur les appelle :

| Méthode | Moment |
|---|---|
| `onInit()` | Après création |
| `onMount()` | Après injection des propriétés |
| `onUnmount()` | À l'arrêt du thread |

```ts
@Injectable(LifetimeEnum.SINGLETON)
export class CacheService {
  onInit() {
    console.log("cache initialisé")
  }

  onMount() {
    this.warmup()
  }

  async onUnmount() {
    await this.flush()
  }
}
```

## Dépendances circulaires

Le conteneur détecte les cycles et lève une erreur explicite :

```text
Circular dependency detected: a -> b -> a
```

Corrigez le cycle en introduisant une troisième dépendance, en passant par un
événement, ou en résolvant l'une des deux parties à la demande avec
`Injection.get()`.

## Bonnes pratiques

- Un service = une responsabilité métier.
- Les contrôleurs restent minces : ils orchestrent, ils ne calculent pas.
- Les dépôts encapsulent la persistance.
- Les services qui portent un état utilisent `SINGLETON`.
- Les services sans état peuvent rester `TRANSIENT`.

## Voir aussi

- [Application et cycle de vie](/docs/application)
- [Plugins](/docs/plugins)
- [Tests](/docs/testing)
