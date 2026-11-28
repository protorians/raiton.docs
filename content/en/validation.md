---
title: "Validation and DTO"
description: "Validate inputs with class-validator and DataTransferObject, or prefer schema-first contracts for stable errors."
section: fonctionnalites
order: 21
since: "6.0"
---

Raiton offers two validation approaches:

- **Schema-first contracts** (`@Input` / `@Output`): recommended for
  public APIs, OpenAPI and the generated client.
- **`class-validator` DTOs**: useful for projects already structured around
  classes and validation decorators.

## DataTransferObject

A DTO extends `DataTransferObject` and declares its constraints with
`class-validator`:

```ts
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator"
import { DataTransferObject } from "raiton/framework"

export class CreateUserDto extends DataTransferObject {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number
}
```

In a controller:

```ts
import { Body, Controllable, Post } from "raiton/framework"

@Controllable("/users")
export class UsersController {
  @Post("/")
  create(@Body() input: CreateUserDto) {
    return this.users.create(input)
  }
}
```

The router:

1. parses the body;
2. instantiates `CreateUserDto` with the data;
3. runs `validation(false)`;
4. throws an error if a constraint fails.

The `DataTransferObject` constructor copies the body onto the instance and
tolerates a missing body (`{}` by default). You do not need to write a
constructor in the DTO.

## DTO limitations

- Errors surface as a generic `Throwable`, not as a stable
  `VALIDATION_ERROR` payload.
- Validation applies to `DataTransferObject` arguments only.
- `class-validator` metadata does not automatically produce an OpenAPI
  schema.
- The DTO is a class: it must be imported as a value, not with `import type`.

For a public API, prefer contracts.

## Contracts and DTOs together

You can use a DTO for internal logic and a contract for HTTP
validation:

```ts
@Post("/")
@Input(CreateUserSchema)
@Output(UserSchema)
create(@Body() input: CreateUser) {
  return this.users.create(input)
}
```

The handler receives a validated and typed value, with no class to instantiate.

## Conditional validation

With TypeBox, compose schemas:

```ts
const Base = t.object({
  type: t.union([t.literal("person"), t.literal("company")]),
})

const Person = t.intersect([
  Base,
  t.object({ firstName: t.string(), lastName: t.string() }),
])

const Company = t.intersect([
  Base,
  t.object({ companyName: t.string(), vat: t.string() }),
])

const Entity = t.union([Person, Company])
```

With `class-validator`, use `@ValidateIf()` and validation groups.

## Validation errors

Recommended format for any API:

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "statusCode": 400,
  "details": [
    { "path": "email", "code": "invalid_format", "message": "…" }
  ]
}
```

Clients can process `code` and `details` without parsing a
human-readable message. See [Error codes](/docs/errors).

## Good practices

- Validate at the HTTP boundary, not in every service.
- One DTO or contract per operation.
- Never return the received object as-is: build an explicit output.
- Test invalid cases as much as valid ones.

## See also

- [Schema-first contracts](/docs/contracts)
- [Parameters](/docs/parameters)
- [Error codes](/docs/errors)
