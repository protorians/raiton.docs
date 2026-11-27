---
title: "Contrats schema-first"
description: "Définir une fois vos schémas TypeBox et les réutiliser pour la validation runtime, les types, OpenAPI et le client généré."
section: fonctionnalites
order: 20
since: "6.9"
---

Un contrat décrit la forme d'une entrée ou d'une sortie. Dans Raiton, la même
définition alimente :

1. la **validation runtime** avant l'exécution du handler ;
2. les **types TypeScript** inférés ;
3. le **document OpenAPI** ;
4. le **client TypeScript généré**.

Le module `raiton/contracts` expose une façade `t` construite sur TypeBox.

## Déclarer un schéma

```ts
import { t, type Infer } from "raiton/contracts"

const CreateUserSchema = t.object({
  email: t.string().email(),
  name: t.string().min(2).max(80),
  age: t.integer().min(0).optional(),
})

type CreateUser = Infer<typeof CreateUserSchema>
```

Les contraintes sont chaînables :

| Méthode | Effet |
|---|---|
| `.min(n)` | Longueur, valeur ou nombre d'éléments minimum |
| `.max(n)` | Maximum |
| `.email()` | Format email |
| `.uuid()` | Format UUID |
| `.url()` | Format URI |
| `.regex(pattern)` | Expression régulière |
| `.optional()` | Propriété optionnelle |
| `.default(value)` | Valeur par défaut |
| `.describe(text)` | Description OpenAPI |
| `.example(value)` | Exemple OpenAPI |

:::note
Utilisez `Infer<typeof Schema>` pour dériver le type TypeScript. Si votre
éditeur signale `Cannot find namespace 't'` sur `t.infer<typeof Schema>`,
remplacez-le par `Infer<typeof Schema>`.
:::

Les schémas restent du **JSON Schema pur** : ils sont sérialisables et peuvent
être envoyés à OpenAPI ou au manifeste sans transformation.

## Brancher une route

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

Une entrée invalide n'exécute **jamais** le handler. La réponse est stable :

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

## Valider plusieurs parties

`@Input()` accepte un schéma unique (le corps) ou un objet composite :

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

Les clés disponibles sont `body`, `query`, `params` et `headers`. Les chemins
d'erreur sont préfixés (`query.expand`, `params.id`).

## Validation de sortie

`@Output()` vérifie la réponse en développement :

- `validation.responses: "auto"` (défaut) — actif en développement, inactif en
  production ;
- `true` — toujours actif ;
- `false` — toujours inactif.

En cas d'écart, la réponse devient `OUTPUT_VALIDATION_ERROR` avec la route et
le champ fautif. En production, aucun coût n'est ajouté.

```ts
export default {
  validation: {
    responses: "auto",
  },
}
```

## Schémas Standard Schema

`@Input` et `@Output` acceptent aussi les schémas conformes à **Standard
Schema v1** (Zod, Valibot, ArkType…). Raiton détecte la propriété `~standard` et
utilise `validate()`.

```ts
import { z } from "zod"

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})
```

Pour OpenAPI, les schémas TypeBox restent la voie la plus complète : ils
exposent directement leur JSON Schema.

## Bonnes pratiques

- Un contrat par cas d'usage : `CreateUser`, `UpdateUser`, `User`.
- Les contrats vivent dans un fichier dédié (`users.contract.ts`).
- Ne réutilisez pas un contrat d'entrée comme contrat de sortie.
- Marquez les champs sensibles comme absents du schéma de sortie.
- Versionnez les contrats qui changent de façon incompatible.

## Voir aussi

- [Validation et DTO](/docs/validation)
- [OpenAPI](/docs/openapi)
- [Client typé](/docs/client)
- [Codes d'erreur](/docs/errors)
