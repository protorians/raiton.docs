---
title: "Schema-first contracts"
description: "Define your TypeBox schemas once and reuse them for runtime validation, types, OpenAPI and the generated client."
section: fonctionnalites
order: 20
since: "6.9"
---

A contract describes the shape of an input or an output. In Raiton, the same
definition feeds:

1. **runtime validation** before the handler runs;
2. the inferred **TypeScript types**;
3. the **OpenAPI document**;
4. the **generated TypeScript client**.

The `raiton/contracts` module exposes a `t` facade built on TypeBox.

## Declaring a schema

```ts
import { t, type Infer } from "raiton/contracts"

const CreateUserSchema = t.object({
  email: t.string().email(),
  name: t.string().min(2).max(80),
  age: t.integer().min(0).optional(),
})

type CreateUser = Infer<typeof CreateUserSchema>
```

Constraints are chainable:

| Method | Effect |
|---|---|
| `.min(n)` | Minimum length, value or number of items |
| `.max(n)` | Maximum |
| `.email()` | Email format |
| `.uuid()` | UUID format |
| `.url()` | URI format |
| `.regex(pattern)` | Regular expression |
| `.optional()` | Optional property |
| `.default(value)` | Default value |
| `.describe(text)` | OpenAPI description |
| `.example(value)` | OpenAPI example |

:::note
Use `Infer<typeof Schema>` to derive the TypeScript type. If your editor
reports `Cannot find namespace 't'` on `t.infer<typeof Schema>`, replace it
with `Infer<typeof Schema>`.
:::

Schemas remain **pure JSON Schema**: they are serializable and can be sent to
OpenAPI or the manifest without transformation.

## Wiring a route

```ts
import { Body, Controllable, Post } from "raiton/framework"
import { Input, Output, t } from "raiton/contracts"

const UserSchema = t.object({
  id: t.string(),
  email: t.string(),
  name: t.string(),
})

@Controllable("/users")
export class UsersController {
  @Post("/")
  @Input(CreateUserSchema)
  @Output(UserSchema)
  create(@Body() input: CreateUser) {
    return this.users.create(input)
  }
}
```

An invalid input **never** executes the handler. The response is stable:

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "statusCode": 400,
  "details": [
    {
      "path": "email",
      "code": "invalid_format",
      "message": "Expected string to match 'email' format"
    }
  ],
  "docsUrl": "https://github.com/protorians/raiton/blob/main/docs/user-guide/recipes/contracts.md"
}
```

## Validating multiple parts

`@Input()` accepts a single schema (the body) or a composite object:

```ts
@Get("/:id")
@Input({
  params: t.object({ id: t.string().uuid() }),
  query: t.object({
    expand: t.boolean().optional(),
    fields: t.array(t.string()).optional(),
  }),
  headers: t.object({
    "accept-language": t.string().optional(),
  }),
})
getOne(@Param("id") id: string) {
  return this.users.find(id)
}
```

The available keys are `body`, `query`, `params` and `headers`. Error paths are
prefixed (`query.expand`, `params.id`).

## Output validation

`@Output()` checks the response in development:

- `validation.responses: "auto"` (default) — active in development, inactive in
  production;
- `true` — always active;
- `false` — always inactive.

On a mismatch, the response becomes `OUTPUT_VALIDATION_ERROR` with the route and
the offending field. In production, no cost is added.

```ts
export default {
  validation: {
    responses: "auto",
  },
}
```

## Standard Schema schemas

`@Input` and `@Output` also accept schemas conforming to **Standard
Schema v1** (Zod, Valibot, ArkType…). Raiton detects the `~standard` property and
uses `validate()`.

```ts
import { z } from "zod"

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})
```

For OpenAPI, TypeBox schemas remain the most complete path: they expose their
JSON Schema directly.

## Best practices

- One contract per use case: `CreateUser`, `UpdateUser`, `User`.
- Contracts live in a dedicated file (`users.contract.ts`).
- Do not reuse an input contract as an output contract.
- Mark sensitive fields as absent from the output schema.
- Version contracts that change incompatibly.

## See also

- [Validation and DTO](/docs/validation)
- [OpenAPI](/docs/openapi)
- [Typed client](/docs/client)
- [Error codes](/docs/errors)
