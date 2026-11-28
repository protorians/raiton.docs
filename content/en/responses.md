---
title: "Responses and errors"
description: "Return objects, structured responses, HTTP exceptions, or raw responses, and keep a stable error format."
section: concepts
order: 16
since: "6.0"
---

A handler can return an object, a structured response, an exception, or use
`@Reply()` directly. Raiton serializes the result to JSON and applies the
appropriate status code.

## Plain object

```ts
@Get("/")
list() {
  return { ok: true, service: "raiton-api" }
}
```

This is the most direct form. The framework serializes the object and responds
with `200`.

## Structured response

For a consistent API, use the `RaitonResponses` helper:

```ts
import { HttpStatus, RaitonResponses } from "raiton/framework"

return RaitonResponses(
  "Liste des utilisateurs",
  users,
  HttpStatus.OK,
  { error: false },
)
```

Signature:

```ts
RaitonResponses(
  message: string,
  data: unknown,
  statusCode: HttpStatus,
  metadata?: { error?: boolean; errorStack?: unknown },
)
```

The resulting response:

```json
{
  "error": false,
  "statusCode": 200,
  "message": "Liste des utilisateurs",
  "data": []
}
```

:::warning
`RaitonResponses()` builds a **body**, not the response status. In 6.8 and
earlier, a call to `RaitonResponses("Erreur", null, 500)` returns `200 OK` with
`statusCode: 500` in the body. A client that relies on the HTTP status therefore
treats the failure as a success. For an error, throw an `HttpException` (or use
the `fail` helper below).
:::

### `fail` helper for errors

In a controller, centralize the translation of an unknown error into an
`HttpException`:

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

## HTTP exceptions

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

The constructor is `HttpException(message, statusCode?, errorCode?)`.
`errorCode` is optional: it adds a stable business code to the payload. Raiton
sets the actual HTTP status, then renders the exception as JSON:

```json
{
  "message": "Utilisateur introuvable",
  "statusCode": 404,
  "errorCode": "USER_NOT_FOUND",
  "error": true
}
```

In development, the response may also contain `stack`; it is removed in
production.

## Explicit error response

```ts
import { ThrowableResponse, HttpStatus } from "raiton/framework"

return new ThrowableResponse("Ressource verrouillée", HttpStatus.CONFLICT)
```

`ThrowableResponse` also accepts a complete response object:

```ts
return new ThrowableResponse({
  statusCode: 422,
  message: "Validation échouée",
  error: true,
  data: { field: "email" },
})
```

## Raw response

For text, CSV, a file, or a stream:

```ts
@Get("/export")
export(@Reply() reply: any) {
  reply.type("text/csv")
  reply.header("content-disposition", "attachment; filename=users.csv")
  return reply.send("id,name\n1,Alice")
}
```

## Custom status

Starting with **6.9**, a returned object can carry `statusCode`, and
`Application.handle()` respects it:

```ts
return {
  statusCode: 201,
  error: false,
  message: "Créé",
  data: user,
}
```

In 6.8 and earlier, this object is sent with `200 OK`: the `statusCode` remains
in the body. In that case, use `HttpException` for an error status, or `@Reply()`
for a non-standard success status.

This is particularly useful for health checks and manual handlers.

## Throw helpers

```ts
import { throwError, throwException, throwWarning, throwCritical } from "raiton/framework"

throwError("Erreur non bloquante")              // événement serveur
throwException("Accès refusé", 403)             // lève une Throwable
throwWarning("Attention", false)                // lève un avertissement
throwCritical("Erreur fatale")                  // termine le processus
```

`throwError` is **soft** by default: it emits an event without interrupting the
request. `throwException` actually throws an error.

## ViewModel

To avoid exposing certain fields (password, internal data), use a `ViewModel`:

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

## Recommended error format

```json
{
  "statusCode": 400,
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": []
}
```

The `code` field is stable and intended for clients. The `details` field contains
field errors. See [Error codes](/docs/errors).

## See also

- [Validation and DTOs](/docs/validation)
- [Error codes](/docs/errors)
- [Contracts](/docs/contracts)
