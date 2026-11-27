---
title: "Variables d'environnement"
description: "Lire les variables d'environnement avec env(), charger .env et éviter les pièges de conversion."
section: fonctionnalites
order: 33
since: "6.0"
---

Raiton charge automatiquement le fichier `.env` à la racine du projet au
démarrage (via `dotenv`). Le helper `env()` normalise la lecture.

## Lire une valeur

```ts
import { env } from "raiton/framework"

const host = env("HOST", "0.0.0.0")
const port = env<number>("PORT", 5711, "int")
const ratio = env<number>("RATIO", 0.5, "float")
```

La signature est :

```ts
env<T>(key: string, defaultValue?: T, type?: "string" | "int" | "float" | "boolean" | "bigInt"): T | undefined
```

Le type est une **chaîne**, pas un constructeur. `Number` ou `Boolean` ne
déclenchent pas la conversion.

```ts
env("PORT", 5711, Number)   // ❌ retourne une string
env("PORT", 5711, "int")    // ✅ retourne un number
```

## Booléens

La conversion booléenne est basique : toute valeur non vide est `true`.

```ts
env("DEBUG", false, "boolean") // "false" → true
```

Pour un comportement prévisible, comparez explicitement :

```ts
const debug = env("DEBUG", "false") === "true"
const enabled = env("FEATURE_FLAG", "0") === "1"
```

## Regrouper des variables

`envGroup(prefix)` est exporté par le framework, mais son comportement reste
limité. Pour un objet typé et validé, préférez une fonction dédiée :

```ts
export const config = {
  port: env<number>("PORT", 5711, "int"),
  databaseUrl: env("DATABASE_URL", "postgres://localhost/app"),
  redisUrl: env("REDIS_URL"),
  debug: env("DEBUG", "false") === "true",
}
```

## Utiliser dans l'application

```ts
const app = new Application({
  port: env<number>("PORT", 5711, "int"),
  hostname: env("HOST", "0.0.0.0"),
  verbose: env("VERBOSE", "false") === "true",
})
```

## Préfixes réservés

| Préfixe | Usage |
|---|---|
| `RAITON_` | Observabilité, shutdown, mode |
| `NODE_ENV` | Environnement Node |
| `PORT`, `HOST` | Convention serveur |

Évitez de réutiliser `RAITON_` pour vos propres variables.

## Secrets

- Ne commitez jamais `.env`.
- Fournissez un `.env.example` sans valeurs sensibles.
- En production, injectez les variables via le secret manager de la plateforme.
- Validez les variables obligatoires au démarrage, avant d'ouvrir le port.

```ts
function required(key: string): string {
  const value = env(key)
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}
```

## Voir aussi

- [Configuration](/docs/configuration)
- [Déploiement](/docs/deployment)
- [Sécurité](/docs/security)
