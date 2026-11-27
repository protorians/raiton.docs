---
title: "Chiffrement et mots de passe"
description: "Hasher des valeurs, dériver des clés et vérifier des mots de passe avec Argon2id, bcrypt, PBKDF2 ou scrypt."
section: fonctionnalites
order: 32
since: "6.0"
---

La classe `Encryption` centralise le hachage, la dérivation de clé et la
vérification de mots de passe. Elle est exposée par `raiton/framework`.

```ts
import { Encryption, HashAlgoEnum } from "raiton/framework"
```

## Hachage simple

```ts
const sha = new Encryption(HashAlgoEnum.SHA256)
const digest = await sha.make("valeur")

await sha.compare("valeur", digest) // true
```

| Algorithme | Sortie |
|---|---|
| `SHA256`, `SHA512` | Hex |
| `MD5`, `RIPEMD160` | Hex |
| `BLAKE2B`, `SHA3_256`, `SHA3_512` | Hex |

Ces algorithmes sont **déterministes** : adaptés aux empreintes (ETag, cache),
pas aux mots de passe.

## Mots de passe

```ts
const passwords = new Encryption(HashAlgoEnum.ARGON2ID)

const hash = await passwords.make("s3cret")
// $argon2id$v=19$m=65536,t=3,p=4$…

await passwords.checkPassword(hash, "s3cret") // true
await passwords.checkPassword(hash, "faux")   // false
```

| Algorithme | Recommandation |
|---|---|
| `ARGON2ID` | **Recommandé** |
| `BCRYPT` | Compatibilité avec l'existant |
| `SCRYPT` | Dérivation mémoire-dure |
| `PBKDF2` | Normes et contraintes réglementaires |

### Options Argon2id

```ts
await passwords.password("s3cret", {
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 2,
})
```

### Options bcrypt

```ts
const bcrypt = new Encryption(HashAlgoEnum.BCRYPT)
await bcrypt.password("s3cret", 12) // rounds
```

### PBKDF2 et scrypt

```ts
const pbkdf2 = new Encryption(HashAlgoEnum.PBKDF2)
const derived = await pbkdf2.make("secret", {
  salt: "0123456789abcdef",
  iterations: 100_000,
  keylen: 64,
  digest: "sha512",
})
// pbkdf2$sha512$100000$0123456789abcdef$…

const scrypt = new Encryption(HashAlgoEnum.SCRYPT)
await scrypt.make("secret", { cost: 16384, blockSize: 8, parallelization: 1 })
// scrypt$16384$8$1$…$…
```

## Algorithme aléatoire

```ts
const algo = Encryption.randomAlgo([HashAlgoEnum.SHA256, HashAlgoEnum.SHA512])
```

À réserver aux cas non critiques (tests, démonstrations).

## Dans un service

```ts
import { Injectable } from "raiton/framework"
import { LifetimeEnum } from "@protorians/core"

@Injectable(LifetimeEnum.SINGLETON)
export class AuthService {
  private readonly passwords = new Encryption(HashAlgoEnum.ARGON2ID)

  hash(password: string) {
    return this.passwords.make(password)
  }

  verify(password: string, hash: string) {
    return this.passwords.checkPassword(hash, password)
  }
}
```

## Règles de sécurité

- Ne stockez jamais un mot de passe en clair ni avec un hash déterministe.
- Utilisez un sel unique par mot de passe (géré par Argon2/bcrypt).
- Ne comparez pas les hashes avec `===` pour les mots de passe : utilisez
  `checkPassword()`.
- Ne loggez jamais le mot de passe ou le hash complet.
- Augmentez les coûts Argon2 avec le temps, pas l'inverse.

## Dépendances

`argon2` et `bcrypt` sont des dépendances du package. Les algorithmes de hachage
simples utilisent `node:crypto` et ne nécessitent rien de plus.

## Voir aussi

- [Sécurité](/docs/security)
- [Variables d'environnement](/docs/environment)
- [Injection](/docs/injection)
