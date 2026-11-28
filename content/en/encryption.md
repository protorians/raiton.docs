---
title: "Encryption and passwords"
description: "Hash values, derive keys and verify passwords with Argon2id, bcrypt, PBKDF2 or scrypt."
section: fonctionnalites
order: 32
since: "6.0"
---

The `Encryption` class centralizes hashing, key derivation and password
verification. It is exposed by `raiton/framework`.

```ts
import { Encryption, HashAlgoEnum } from "raiton/framework"
```

## Simple hashing

```ts
const sha = new Encryption(HashAlgoEnum.SHA256)
const digest = await sha.make("valeur")

await sha.compare("valeur", digest) // true
```

| Algorithm | Output |
|---|---|
| `SHA256`, `SHA512` | Hex |
| `MD5`, `RIPEMD160` | Hex |
| `BLAKE2B`, `SHA3_256`, `SHA3_512` | Hex |

These algorithms are **deterministic**: suitable for fingerprints (ETag, cache),
not for passwords.

## Passwords

```ts
const passwords = new Encryption(HashAlgoEnum.ARGON2ID)

const hash = await passwords.make("s3cret")
// $argon2id$v=19$m=65536,t=3,p=4$…

await passwords.checkPassword(hash, "s3cret") // true
await passwords.checkPassword(hash, "faux")   // false
```

| Algorithm | Recommendation |
|---|---|
| `ARGON2ID` | **Recommended** |
| `BCRYPT` | Compatibility with existing systems |
| `SCRYPT` | Memory-hard derivation |
| `PBKDF2` | Standards and regulatory constraints |

### Argon2id options

```ts
await passwords.password("s3cret", {
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 2,
})
```

### bcrypt options

```ts
const bcrypt = new Encryption(HashAlgoEnum.BCRYPT)
await bcrypt.password("s3cret", 12) // rounds
```

### PBKDF2 and scrypt

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

## Random algorithm

```ts
const algo = Encryption.randomAlgo([HashAlgoEnum.SHA256, HashAlgoEnum.SHA512])
```

Reserved for non-critical cases (tests, demos).

## In a service

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

## Security rules

- Never store a password in plain text or with a deterministic hash.
- Use a unique salt per password (handled by Argon2/bcrypt).
- Do not compare hashes with `===` for passwords: use
  `checkPassword()`.
- Never log the password or the full hash.
- Increase Argon2 costs over time, not the other way around.

## Dependencies

`argon2` and `bcrypt` are dependencies of the package. Simple hashing
algorithms use `node:crypto` and require nothing more.

## See also

- [Security](/docs/security)
- [Environment variables](/docs/environment)
- [Injection](/docs/injection)
