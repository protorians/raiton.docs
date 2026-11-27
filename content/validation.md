---
title: "Validation et DTO"
description: "Valider les entrées avec class-validator et DataTransferObject, ou préférer les contrats schema-first pour des erreurs stables."
section: fonctionnalites
order: 21
since: "6.0"
---

Raiton propose deux approches de validation :

- **Les contrats schema-first** (`@Input` / `@Output`) : recommandés pour les
  API publiques, OpenAPI et le client généré.
- **Les DTO `class-validator`** : utiles pour les projets déjà structurés autour
  de classes et de décorateurs de validation.

## DataTransferObject

Un DTO hérite de `DataTransferObject` et déclare ses contraintes avec
`class-validator` :

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

Dans un contrôleur :

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

Le routeur :

1. parse le corps ;
2. instancie `CreateUserDto` avec les données ;
3. exécute `validation(false)` ;
4. lève une erreur si une contrainte échoue.

Le constructeur de `DataTransferObject` recopie le corps sur l'instance et
tolère un corps absent (`{}` par défaut). Vous n'avez pas besoin d'écrire un
constructeur dans le DTO.

## Limites des DTO

- Les erreurs remontent comme une `Throwable` générique, pas comme un payload
  `VALIDATION_ERROR` stable.
- La validation s'applique aux arguments `DataTransferObject` uniquement.
- Les métadonnées `class-validator` ne produisent pas automatiquement un schéma
  OpenAPI.
- Le DTO est une classe : il faut l'importer en valeur, pas en `import type`.

Pour une API publique, préférez les contrats.

## Contrats et DTO ensemble

Vous pouvez utiliser un DTO pour la logique interne et un contrat pour la
validation HTTP :

```ts
@Post("/")
@Input(CreateUserSchema)
@Output(UserSchema)
create(@Body() input: CreateUser) {
  return this.users.create(input)
}
```

Le handler reçoit une valeur validée et typée, sans classe à instancier.

## Validation conditionnelle

Avec TypeBox, composez des schémas :

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

Avec `class-validator`, utilisez `@ValidateIf()` et les groupes de validation.

## Erreurs de validation

Format recommandé pour toute API :

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

Les clients peuvent traiter `code` et `details` sans analyser un message
humain. Voir [Codes d'erreur](/docs/errors).

## Bonnes pratiques

- Validez à la frontière HTTP, pas dans chaque service.
- Un DTO ou contrat par opération.
- Ne renvoyez jamais l'objet reçu tel quel : construisez une sortie explicite.
- Testez les cas invalides autant que les cas valides.

## Voir aussi

- [Contrats schema-first](/docs/contracts)
- [Paramètres](/docs/parameters)
- [Codes d'erreur](/docs/errors)
