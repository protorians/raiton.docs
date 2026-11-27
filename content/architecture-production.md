---
title: "Architecture d'une API de production"
description: "Monolithe modulaire, composition root, frontière HTTP et tâches de fond : les décisions d'une API Raiton réellement exploitée en production."
section: guides
order: 59
since: "6.0"
---

Cette page ne part pas d'un exemple jouet. Elle synthétise l'architecture d'une
API Raiton réellement exploitée en production : une API centrale multi-tenant
qui couvre l'identité, les organisations, les permissions, la facturation, le
paiement, la messagerie et une dizaine de modules métier.

Le contexte technique est le suivant :

- Bun et TypeScript, PostgreSQL via Prisma ;
- une cinquantaine de modules, plusieurs centaines de routes ;
- des DTO `class-validator` et des ViewModels pour la sortie ;
- des webhooks signés, des schedulers applicatifs et des files de travaux ;
- un déploiement conteneurisé derrière un reverse proxy.

Raiton n'impose pas cette organisation. En revanche, dès que le projet dépasse
quelques dizaines de routes, trois contraintes reviennent systématiquement :
**séparer les modules**, **maîtriser l'ordre d'évaluation du conteneur** et
**garder la frontière HTTP mince**.

## 1. Un monolithe modulaire, pas des dossiers par type

La structure `controllers/`, `services/`, `repositories/` reste lisible pour une
petite API. Sur une API de production, elle disperse un même domaine dans quatre
dossiers et rend les frontières floues. L'API réelle regroupe donc chaque
domaine dans un module, puis découpe le module en couches :

```text
source/
├── main.ts
├── modules/
│   ├── identity/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/        # interfaces (ports)
│   │   │   └── enums/
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   ├── infrastructure/
│   │   │   ├── persistence/         # implémentations Prisma
│   │   │   ├── gateways/            # clients HTTP, e-mail, stockage
│   │   │   ├── security/
│   │   │   └── schedulers/
│   │   └── presentation/
│   │       ├── controllers/
│   │       ├── vm/                  # ViewModels de sortie
│   │       └── middlewares/
│   ├── organization/
│   ├── access-control/
│   └── billing/
└── shared/
    ├── infrastructure/
    │   ├── database/
    │   ├── di/                      # composition root
    │   ├── cors/
    │   ├── scheduling/
    │   └── webhooks/
    └── presentation/
        ├── decorators/
        ├── middlewares/
        ├── plugins/
        └── responses/
```

La règle de dépendance est plus importante que l'arborescence :

| Couche | Peut dépendre de | Ne doit pas dépendre de |
|---|---|---|
| `domain` | TypeScript, types du domaine | Raiton, Prisma, HTTP |
| `application` | `domain`, ports, services injectables | Contrôleurs, `Request`, `Reply` |
| `infrastructure` | `domain`, `application`, SDK externes | `presentation` |
| `presentation` | `application`, `domain` (types) | `infrastructure` concrète |

Un cas d'usage ne doit pas connaître HTTP. Il reçoit des valeurs, applique la
règle métier et lève une erreur métier. Le contrôleur traduit cette erreur en
statut HTTP. Cette séparation permet de tester le métier sans serveur, et de
changer de transport sans réécrire les règles.

:::tip
Un module = un contexte métier, pas un dossier technique. Si deux modules
partagent une règle, placez-la dans `shared` uniquement lorsqu'elle est
réellement transverse (temps, argent, identifiants, audit).
:::

## 2. Le composition root : l'ordre d'évaluation du conteneur

Raiton scanne les contrôleurs et exécute les décorateurs au chargement des
modules. Un fichier jamais importé n'est jamais évalué : son `@Injectable()` ne
s'enregistre pas, et la résolution échoue avec un message du type :

```text
Dependency PrismaUserRepository not registered
```

Ce n'est pas un bug du scanner : le framework ne peut pas deviner qu'une
implémentation concrète existe si aucun module ne la référence. L'API réelle
centralise donc les imports dans un **composition root** importé avant tout le
reste :

```ts
// source/shared/infrastructure/di/composition-root.ts
// Ce module importe les implémentations concrètes pour que leurs décorateurs
// s'exécutent avant la compilation des contrôleurs.
import "@/modules/identity/infrastructure/persistence/prisma-user.repository"
import "@/modules/identity/application/session-refresh-token.service"
import "@/modules/organization/infrastructure/persistence/prisma-organization.repository"
import "@/modules/access-control/infrastructure/persistence/prisma-role.repository"
import "@/shared/infrastructure/database/prisma.service"
import "@/shared/infrastructure/scheduling/module-scheduler-gate.service"
```

```ts
// source/main.ts
import "reflect-metadata"
import "@/shared/infrastructure/di/composition-root"
import { Application } from "raiton/core/application"
```

Quelques règles qui évitent les erreurs d'ordre :

- importez le composition root **avant** la création de l'`Application` ;
- importez les adaptateurs avant les services qui les consomment quand un
  service résout une dépendance au démarrage ;
- gardez un fichier par module ou un bloc commenté par domaine ;
- ne mettez pas de logique dans le composition root : uniquement des imports.

Les contrôleurs, eux, sont détectés par le scanner grâce au suffixe
`.controller.ts`. Leurs dépendances doivent être enregistrées par le composition
root, même si le contrôleur n'est jamais importé explicitement.

## 3. Un contrôleur = une intention HTTP

L'API réelle utilise souvent **un contrôleur par route** plutôt qu'un gros
contrôleur CRUD. Cela peut surprendre, mais c'est cohérent avec OpenAPI, les
tests et la revue de code : chaque fichier porte une intention, ses décorateurs
de documentation et son test.

```ts
// source/modules/identity/presentation/controllers/sign-in.controller.ts
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  Body,
  Controllable,
  HttpStatus,
  Post,
  RaitonResponses,
  Req,
  RouteInteraction,
} from "raiton/framework"
import { plainToInstance } from "class-transformer"
import { SignInDto } from "@/modules/identity/application/dtos/sign-in.dto"
import SignInUseCase from "@/modules/identity/application/use-cases/sign-in.use-case"
import { UserVm } from "@/modules/identity/presentation/vm/user.vm"
import { fail } from "@/shared/presentation/responses/http-error.response"

@ApiTags("Authentication")
@Controllable("/auth/sign-in")
export default class SignInController {
  constructor(private readonly service: SignInUseCase) {}

  @Post("/")
  @RouteInteraction("[username] est désormais connecté")
  @ApiOperation({
    summary: "Authenticate user",
    description: "Valide les identifiants et retourne une session.",
  })
  @ApiBody(SignInDto)
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  @ApiResponse({ status: 429, description: "Trop de tentatives" })
  async login(@Body() body: SignInDto, @Req() req: Request) {
    try {
      const userAgent = req.headers.get("user-agent")
      if (!userAgent) throw new Error("Appareil non supporté")

      const result = await this.service.login(userAgent, body, req)
      result.user = plainToInstance(UserVm, result.user, {
        excludeExtraneousValues: true,
      })

      return RaitonResponses("Connexion réussie", result, HttpStatus.OK)
    } catch (error) {
      // Lève une HttpException : le statut HTTP réel est posé par Raiton.
      fail(error)
    }
  }
}
```

Points à retenir :

- `@Controllable("/auth/sign-in")` fixe le préfixe ; `@Post("/")` ajoute la
  route finale. Le nom du fichier n'influence pas l'URL.
- L'export par défaut est facultatif, mais il rend le fichier facile à importer
  dans un test ou un composition root. Le scanner monte la classe exportée.
- L'injection par constructeur fonctionne sans `@Inject()` lorsque
  `emitDecoratorMetadata` est activé : le type du paramètre suffit.
- `@RouteInteraction()` ne change pas le routage ; il décrit l'action dans les
  journaux et le manifeste.
- Le contrôleur ne calcule pas la règle métier. Il valide la frontière HTTP,
  appelle le cas d'usage, formate la sortie et traduit les erreurs.

:::note
Un contrôleur par route est un choix, pas une obligation. Pour un CRUD
homogène, un contrôleur par ressource reste plus lisible. Le critère utile est
la **cohésion de l'intention** : si les routes partagent les mêmes dépendances
et la même documentation, gardez-les ensemble.
:::

## 4. Le cas d'usage porte la règle métier

Le cas d'usage reçoit des dépendances par constructeur, applique les règles et
lève des exceptions explicites. Il ne retourne jamais un objet de réponse HTTP.

```ts
// source/modules/identity/application/use-cases/sign-in.use-case.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  PasswordAlgoEnum,
} from "raiton/framework"
import { UserRepository } from "@/modules/identity/domain/repositories/user.repository"
import { AuthRateLimiterService } from "@/modules/identity/infrastructure/security/auth-rate-limiter.service"
import { PasswordService } from "@/shared/infrastructure/security/password.service"
import { SessionRefreshTokenService } from "@/modules/identity/application/session-refresh-token.service"

@Injectable()
export default class SignInUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
    private readonly rateLimiter: AuthRateLimiterService,
    private readonly refreshTokens: SessionRefreshTokenService,
  ) {}

  async login(userAgent: string, data: SignInDto, req: any) {
    const keys = [this.rateLimiter.ipKey(req.ip), this.rateLimiter.identityKey(data.email)]

    const lockedFor = this.rateLimiter.lockRemainingSeconds(keys)
    if (lockedFor) {
      throw new HttpException(
        `Trop de tentatives. Réessayez dans ${lockedFor} secondes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    const user = await this.users.findByAnyIdentifier(data)
    if (!user?.passwordHashed) {
      this.rateLimiter.registerFailure(keys)
      throw new HttpException("Identifiants invalides", HttpStatus.UNAUTHORIZED)
    }

    const valid = await this.passwords.verify(
      data.password,
      user.passwordHashed,
      user.passwordEncryption as PasswordAlgoEnum,
    )
    if (!valid) {
      this.rateLimiter.registerFailure(keys)
      throw new HttpException("Identifiants invalides", HttpStatus.UNAUTHORIZED)
    }

    this.rateLimiter.clear(keys)
    return this.refreshTokens.openSession(user, userAgent, req)
  }
}
```

Trois habitudes qui payent :

- **une exception, un statut** : `HttpException` porte le statut et un code
  métier optionnel ; le contrôleur n'a pas à deviner ;
- **les effets de bord sont explicites** : audit, notification, idempotence et
  transaction sont visibles dans le cas d'usage ;
- **les erreurs attendues ne sont pas des 500** : un identifiant inconnu, un
  quota atteint ou un conflit ont un statut dédié.

Voir [Réponses et erreurs](/docs/responses) et
[Validation et DTO](/docs/validation).

## 5. Le piège du statut HTTP avec `RaitonResponses`

`RaitonResponses()` construit un **corps** de réponse. Dans les versions 6.8 et
antérieures, il ne pose pas le statut HTTP : un appel qui retourne
`RaitonResponses("Erreur", null, 500)` renvoie `200 OK` avec `statusCode: 500`
dans le corps. Un client qui se fie au statut considère donc l'échec comme un
succès.

La règle de l'API réelle est simple :

| Situation | Mécanisme |
|---|---|
| Succès | `RaitonResponses(message, data, HttpStatus.OK)` |
| Erreur métier attendue | `throw new HttpException(message, status)` |
| Erreur inattendue | laisser remonter, ou `fail(error)` |
| Réponse brute (fichier, CSV) | `@Reply()` et `reply.send(...)` |

```ts
// source/shared/presentation/responses/http-error.response.ts
import { HttpException, HttpStatus } from "raiton/framework"

export function fail(
  error: unknown,
  fallbackStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): never {
  if (error instanceof HttpException) throw error

  const candidate = error as any
  const status = candidate?.status ?? candidate?.statusCode ?? fallbackStatus

  throw new HttpException(
    typeof candidate?.message === "string"
      ? candidate.message
      : "Erreur interne du service.",
    (Number.isInteger(status) && status >= 400 && status <= 599
      ? status
      : fallbackStatus) as HttpStatus,
  )
}
```

:::note
Raiton 6.9 respecte le `statusCode` porté par un objet retourné. La règle
« erreur = `HttpException` » reste néanmoins préférable : elle est compatible
avec toutes les versions, explicite dans les tests et lisible dans les logs.
:::

## 6. Sécurité à la frontière

Le bootstrapper est l'endroit où l'on configure la sécurité globale. Il doit
rester lisible : une constante par sujet, puis un enchaînement de `use()` et de
`register()`.

```ts
// source/main.ts (extrait)
import { env } from "raiton/framework/env"
import {
  Application,
  openApiPlugin,
  RuntimeType,
  Security,
  httpsLan,
  HttpsGenerator,
  CSRFModeEnum,
} from "raiton/framework"
import { RawBodyPlugin } from "@/shared/presentation/plugins/raw-body.plugin"

const CORS_HEADERS = [
  "Content-Type",
  "Accept",
  "Authorization",
  "X-Device",
  "X-API-KEY",
  "X-API-TOKEN",
  "X-Organization-Id",
  "X-CSRF-Token",
  "X-Client-Type",
  "X-Request-Id",
  "Idempotency-Key",
]

const isNativeOrigin = (origin: string): boolean =>
  origin === "null" ||
  ["file:", "capacitor:", "tauri:", "ionic:", "expo:", "app:"].some((scheme) =>
    origin.startsWith(scheme),
  )

export default async (thread: ThreadInterface) => {
  const isDevelopment = env("NODE_ENV") === "development"
  const allowedOrigins = (env("CORS_ORIGIN", "") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  const app = new Application({
    port: env<number>("APP_PORT", 5711, "int"),
    prefix: "/api",
    https: isDevelopment ? httpsLan({ generator: HttpsGenerator.Mkcert }) : undefined,
  })
    .use(Security.headers)
    .use(RawBodyPlugin)
    .use(
      Security.cors({
        origin: (origin) =>
          allowedOrigins.includes(origin) || isNativeOrigin(origin),
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        headers: CORS_HEADERS,
        credentials: true,
        exposeHeaders: ["X-Request-Id"],
      }),
    )
    .use(
      Security.csrf({
        mode: CSRFModeEnum.DOUBLE_SUBMIT,
        secret: env("CSRF_SECRET", ""),
        cookieName: "_csrf",
        headerName: "X-CSRF-Token",
        ttl: 86_400_000,
        methods: ["POST", "PUT", "PATCH", "DELETE"],
        // Webhook serveur-à-serveur : ni session ni cookie CSRF.
        // La requête est authentifiée par la signature HMAC du corps.
        skip: ["/api/kyc/webhooks"],
        cookieOptions: {
          httpOnly: false,
          secure: !isDevelopment,
          sameSite: "lax",
          path: "/",
        },
        client: {
          headerName: "X-Client-Type",
          skipClients: ["mobile", "desktop"],
        },
      }),
    )
    .use(Security.rateLimit({ windowMs: 60_000, max: 300 }))
    .use(Security.bodyLimit(Number(env("APP_BODY_LIMIT_MB", "100")) * 1024 * 1024))
    .use(
      openApiPlugin({
        title: "@liorian/api-core",
        version: "0.149.0",
        endpoint: "/docs/json",
      }),
    )

  return await thread.setup({ application: app, runtime: RuntimeType.Bun }).run()
}
```

Pourquoi ces choix :

- **CORS avec credentials** : `origin: "*"` est interdit dès que
  `credentials: true`. Utilisez une fonction qui compare une liste explicite et
  accepte les origines natives des webviews mobiles/desktop.
- **En-têtes explicites** : le préflight navigateur refuse un en-tête non listé.
  Ajoutez `Idempotency-Key` ou `X-Request-Id` dès qu'un client les envoie.
- **CSRF ciblé** : les webhooks signés n'ont pas de cookie. Exemptez uniquement
  le chemin exact, puis vérifiez la signature dans le cas d'usage.
- **Clients natifs** : `skipClients` évite d'exiger un token CSRF aux
  applications mobiles et desktop qui n'utilisent pas de cookie.
- **Body limit** : gardez la limite sous le plafond interne de `Bun.serve`
  (128 Mo). Un plafond applicatif plus haut n'est jamais atteint.

Voir [Sécurité](/docs/security) pour le détail des options.

### Capturer le corps brut d'un webhook signé

Un webhook HMAC signe les **octets exacts** du corps. Si le body parser
désérialise puis que vous re-sérialisez, l'ordre des clés ou les nombres peuvent
changer et la signature échoue. L'API réelle ajoute un plugin `onRequest` qui
mémorise le corps brut avant le parsing, uniquement sur les chemins concernés :

```ts
// source/shared/presentation/plugins/raw-body.plugin.ts (principe)
export const RawBodyPlugin = {
  name: "raw-body-plugin",
  setup(scope) {
    scope.addHook("onRequest", async (ctx) => {
      const pathname = new URL(ctx.req.url, "http://localhost").pathname
      if (!pathname.startsWith("/api/kyc/webhooks")) return

      const bytes = new Uint8Array(await new Response(ctx.req.body).arrayBuffer())
      ctx.req.rawBody = new TextDecoder().decode(bytes)
      ctx.req.body = bytes // le body parser retrouve un corps exploitable
    })
  },
}
```

Le plugin est monté avec `.use(RawBodyPlugin)` avant le body parser. Il ne
duplique jamais un upload de 100 Mo : la capture est limitée aux préfixes
déclarés.

## 7. Authentification et permissions composées

Les guards de l'API réelle ne sont pas des décorateurs isolés : un décorateur
`@UserAccessGuard()` compose plusieurs middlewares dans le bon ordre.

```ts
export function UserAccessGuard(options: { organization?: boolean } = {}) {
  return (target: any, key?: string, descriptor?: any) => {
    Middleware(SessionGuard)(target, key, descriptor)
    Middleware(UserActivityMiddleware)(target, key, descriptor)

    if (options.organization) {
      // Lit `context.state.user`, publié par SessionGuard juste avant.
      Middleware(CurrentOrganizationMiddleware)(target, key, descriptor)
    }
  }
}
```

Utilisation :

```ts
@ApiTags("Access Control")
@Controllable("/access-control")
@UserAccessGuard({ organization: true })
export default class GetMyPermissionsController {
  constructor(private readonly useCase: GetMyPermissionsUseCase) {}

  @Get("/me/permissions")
  @ReadOnlyPermission("Role")
  async handle(@Req() req: any) {
    return RaitonResponses(
      "Permissions effectives",
      await this.useCase.execute(req.user.id, req.organizationId),
      HttpStatus.OK,
    )
  }
}
```

:::warning
L'ordre des décorateurs de middleware compte. Raiton exécute la pile du
décorateur le plus proche de la méthode vers le plus éloigné. Un décorateur
personnalisé posé **au-dessus** de `@UserAccessGuard()` peut donc s'exécuter
avant la résolution de la session et échouer. Composez les guards dans un seul
décorateur, ou vérifiez l'ordre avec un test d'intégration.
:::

Les permissions ne doivent pas être déduites du rôle côté contrôleur. Le
middleware de permission interroge le registre de rôles et échoue en `403` avec
un message stable. Le contrôleur reste lisible : il déclare l'intention
(`@ReadOnlyPermission("Role")`) et appelle le cas d'usage.

## 8. Tâches de fond et démarrage

Un scheduler déclaratif est pratique pour les jobs cron. Les traitements longs
ou pilotés par la base (relances, synchronisations, GC) sont souvent des
services `@Injectable(SINGLETON)` démarrés explicitement par le bootstrapper :

```ts
try {
  const bootstrap = await Application.container.resolve(NativeDeploymentBootstrapService)
  await bootstrap.bootstrap()
} catch (error) {
  Logger.error("Échec de l'amorçage du profil de déploiement.", error)
}

try {
  await Application.container.resolve(ReminderSchedulerService)
} catch (error) {
  Logger.error("Échec du démarrage du scheduler de rappels.", error)
}
```

Trois règles :

- **un échec de tâche de fond ne bloque pas le serveur** : journalisez et
  continuez, sauf si la tâche est indispensable à la sécurité ;
- **désactivez les tâches pendant le build** : `LIORIAN_RUN_BACKGROUND=false`
  évite qu'un `raiton build` ouvre des connexions et consomme la base ;
- **vérifiez l'éligibilité du module** avant d'armer un job : un scheduler de
  module inactif ne doit pas tourner.

Voir [Scheduler et files d'attente](/docs/scheduler).

## 9. Configuration et secrets

La configuration de production est validée avant l'ouverture du port. Les
secrets n'ont pas de valeur par défaut :

```ts
import { env } from "raiton/framework/env"

function required(key: string): string {
  const value = env<string>(key)
  if (!value) throw new Error(`Variable d'environnement obligatoire : ${key}`)
  return value
}

const config = {
  port: env<number>("APP_PORT", 5711, "int"),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  csrfSecret: required("CSRF_SECRET"),
  corsOrigin: required("CORS_ORIGIN"),
  bodyLimitMb: env<number>("APP_BODY_LIMIT_MB", 100, "int"),
}
```

:::warning
`env()` convertit les booléens de façon basique : la chaîne `"false"` est
considérée comme vraie. Comparez explicitement `env("FLAG", "false") === "true"`.
Voir [Variables d'environnement](/docs/environment).
:::

Les catégories à séparer dans le fichier d'environnement :

- **identité et secrets** : `JWT_SECRET`, `CSRF_SECRET`, clés de chiffrement ;
- **infrastructure** : `DATABASE_URL`, `REDIS_URL`, `S3_*` ;
- **frontière HTTP** : `CORS_ORIGIN`, `CORS_HEADERS`, `APP_BODY_LIMIT_MB` ;
- **métier** : quotas, délais, adresses d'alerte ;
- **déploiement** : `PORT`, `NODE_ENV`, indicateurs de bootstrap.

## 10. Tester sans serveur, puis avec le serveur

Deux niveaux suffisent dans la majorité des cas.

**Test unitaire du cas d'usage** : instanciez-le avec des faux dépôts. Pas de
conteneur, pas de port, pas de base.

```ts
import { describe, expect, it } from "bun:test"
import SignInUseCase from "../sign-in.use-case"

describe("SignInUseCase", () => {
  it("refuse un mot de passe invalide", async () => {
    const useCase = new SignInUseCase(
      fakeUsers({ passwordHashed: "hash" }),
      fakePasswords({ verify: async () => false }),
      fakeRateLimiter(),
      fakeRefreshTokens(),
    )

    await expect(useCase.login("test-agent", dto, req)).rejects.toMatchObject({
      statusCode: 401,
    })
  })
})
```

**Test HTTP** : montez le contrôleur avec `compileController` et vérifiez à la
fois le statut et le corps. Un test qui ne vérifie que `reply.body` laisse
passer le piège du `200 OK` décrit plus haut.

```ts
const app = new Application({ prefix: "/api" })
compileController(SignInController, app)

const reply = new MockReply()
await app.handle(
  {
    method: "POST",
    url: "/api/auth/sign-in",
    headers: new Headers({ "content-type": "application/json" }),
    body: { email: "a@b.c", password: "wrong" },
  },
  reply,
)

expect(reply.statusCode).toBe(401)
expect(reply.body.error).toBe(true)
```

Voir [Tests](/docs/testing) pour les mocks de réponse et les contrats.

## Checklist de mise en production

- [ ] Chaque module a `domain`, `application`, `infrastructure` et
  `presentation` séparés.
- [ ] Les implémentations concrètes sont importées par le composition root.
- [ ] Les contrôleurs ne contiennent pas de règle métier.
- [ ] Les erreurs attendues lèvent une `HttpException` avec le bon statut.
- [ ] Les réponses de succès passent par `RaitonResponses`.
- [ ] CORS, CSRF, rate limit et body limit sont configurés dans `main.ts`.
- [ ] Les webhooks signés capturent le corps brut avant le parsing.
- [ ] Les schedulers sont résolus au démarrage et échouent sans bloquer.
- [ ] Les secrets obligatoires sont validés avant l'ouverture du port.
- [ ] Les tests HTTP vérifient le statut **et** le corps.
- [ ] `bun raiton doctor` et `bun test` passent en CI.

## Voir aussi

- [Structure du projet](/docs/project-structure)
- [Application et cycle de vie](/docs/application)
- [Injection de dépendances](/docs/injection)
- [Sécurité](/docs/security)
- [Réponses et erreurs](/docs/responses)
- [Déploiement](/docs/deployment)
