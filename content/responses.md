---
title: "Réponses et erreurs"
description: "Retourner des objets, des réponses structurées, des exceptions HTTP ou des réponses brutes, et garder un format d'erreur stable."
section: concepts
order: 16
since: "6.0"
---

Un handler peut retourner un objet, une réponse structurée, une exception ou
utiliser directement `@Reply()`. Raiton sérialise le résultat en JSON et applique
le code de statut approprié.

## Objet simple

```ts
@Get("/")
list() {
  return { ok: true, service: "raiton-api" }
}
```

C'est la forme la plus directe. Le framework sérialise l'objet et répond `200`.

## Réponse structurée

Pour une API cohérente, utilisez le helper `RaitonResponses` :

```ts
import { HttpStatus, RaitonResponses } from "raiton/framework"

return RaitonResponses(
  "Liste des utilisateurs",
  users,
  HttpStatus.OK,
  { error: false },
)
```

Signature :

```ts
RaitonResponses(
  message: string,
  data: unknown,
  statusCode: HttpStatus,
  metadata?: { error?: boolean; errorStack?: unknown },
)
```

La réponse produite :

```json
{
  "error": false,
  "statusCode": 200,
  "message": "Liste des utilisateurs",
  "data": []
}
```

:::warning
`RaitonResponses()` construit un **corps**, pas le statut de la réponse. En 6.8
et antérieur, un appel `RaitonResponses("Erreur", null, 500)` renvoie `200 OK`
avec `statusCode: 500` dans le corps. Un client qui se fie au statut HTTP
considère donc l'échec comme un succès. Pour une erreur, levez une
`HttpException` (ou utilisez le helper `fail` ci-dessous).
:::

### Helper `fail` pour les erreurs

Dans un contrôleur, centralisez la traduction d'une erreur inconnue en
`HttpException` :

```ts
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

```ts
try {
  return RaitonResponses("OK", await this.useCase.execute(input), HttpStatus.OK)
} catch (error) {
  fail(error)
}
```

## Exceptions HTTP

```ts
import { HttpException, HttpStatus } from "raiton/framework"

@Get("/:id")
getOne(@Param("id") id: string) {
  const user = this.users.find(id)
  if (!user) {
    throw new HttpException("Utilisateur introuvable", HttpStatus.NOT_FOUND)
  }
  return user
}
```

Le constructeur est `HttpException(message, statusCode?, errorCode?)`.
`errorCode` est optionnel : il ajoute un code métier stable au payload. Raiton
pose le statut HTTP réel, puis rend l'exception en JSON :

```json
{
  "message": "Utilisateur introuvable",
  "statusCode": 404,
  "errorCode": "USER_NOT_FOUND",
  "error": true
}
```

En développement, la réponse peut aussi contenir `stack` ; elle est supprimée
en production.

## Réponse d'erreur explicite

```ts
import { ThrowableResponse, HttpStatus } from "raiton/framework"

return new ThrowableResponse("Ressource verrouillée", HttpStatus.CONFLICT)
```

`ThrowableResponse` accepte aussi un objet de réponse complet :

```ts
return new ThrowableResponse({
  statusCode: 422,
  message: "Validation échouée",
  error: true,
  data: { field: "email" },
})
```

## Réponse brute

Pour du texte, du CSV, un fichier ou un flux :

```ts
@Get("/export")
export(@Reply() reply: any) {
  reply.type("text/csv")
  reply.header("content-disposition", "attachment; filename=users.csv")
  return reply.send("id,name\n1,Alice")
}
```

## Statut personnalisé

À partir de **6.9**, un objet retourné peut porter `statusCode` et
`Application.handle()` le respecte :

```ts
return {
  statusCode: 201,
  error: false,
  message: "Créé",
  data: user,
}
```

En 6.8 et antérieur, ce objet est envoyé avec `200 OK` : le `statusCode` reste
dans le corps. Utilisez alors `HttpException` pour un statut d'erreur, ou
`@Reply()` pour un statut de succès non standard.

C'est particulièrement utile pour les health checks et les handlers manuels.

## Helpers de throw

```ts
import { throwError, throwException, throwWarning, throwCritical } from "raiton/framework"

throwError("Erreur non bloquante")              // événement serveur
throwException("Accès refusé", 403)             // lève une Throwable
throwWarning("Attention", false)                // lève un avertissement
throwCritical("Erreur fatale")                  // termine le processus
```

`throwError` est **soft** par défaut : il émet un événement sans interrompre la
requête. `throwException` lève réellement une erreur.

## ViewModel

Pour ne pas exposer certains champs (mot de passe, données internes), utilisez
un `ViewModel` :

```ts
import { ViewModel } from "raiton/framework"

class UserViewModel extends ViewModel {
  toJSON() {
    return {
      id: this.__initial__.id,
      name: this.__initial__.name,
    }
  }
}

return new UserViewModel(user)
```

## Format d'erreur recommandé

```json
{
  "statusCode": 400,
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": []
}
```

Le champ `code` est stable et destiné aux clients. Le champ `details` contient
les erreurs de champ. Voir [Codes d'erreur](/docs/errors).

## Voir aussi

- [Validation et DTO](/docs/validation)
- [Codes d'erreur](/docs/errors)
- [Contrats](/docs/contracts)
