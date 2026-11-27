---
title: "Installation"
description: "Installer Raiton avec Bun, npm, pnpm ou Deno, configurer TypeScript et vérifier que le serveur démarre."
section: demarrage
order: 2
since: "6.0"
---

## Prérequis

- **Bun 1.2+** (recommandé), **Node.js 22+** ou **Deno 2+**
- **TypeScript 5+**
- Un projet avec `experimentalDecorators` et `emitDecoratorMetadata` activés

## Créer un projet

La voie la plus rapide reste la CLI, qui génère le bootstrapper, la
configuration, un contrôleur d'exemple et un test :

```bash
bun raiton new my-api --template api --runtime bun --yes
cd my-api
bun raiton dev
```

`--template` accepte `api`, `minimal` et `mcp-agent`. Voir le
[démarrage rapide](/docs/quickstart) et [`raiton new`](/docs/cli-new) pour le
détail des options.

## Installer dans un projet existant

```bash
# Bun (recommandé)
bun add raiton reflect-metadata

# npm
npm install raiton reflect-metadata

# pnpm
pnpm add raiton reflect-metadata

# Deno
deno add npm:raiton npm:reflect-metadata
```

`reflect-metadata` est **obligatoire** : les décorateurs Raiton s'appuient sur les
métadonnées TypeScript. Importez-le une seule fois, au tout début du point
d'entrée de l'application, avant tout autre import Raiton.

```ts
import "reflect-metadata"
```

## Configurer TypeScript

Le fichier `tsconfig.json` doit activer les décorateurs et les métadonnées de
type :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["bun"]
  },
  "include": ["source", "tests"]
}
```

Adaptez `types` au runtime ciblé : `bun`, `node` ou `deno`.

:::warning
Sans `emitDecoratorMetadata`, `@Inject()` ne peut pas déduire le type d'un
paramètre de constructeur et l'injection échoue silencieusement. Sans
`experimentalDecorators`, le code ne compile pas du tout.
:::

## Décrire le projet

Placez un fichier `raiton.config.ts` à la racine pour décrire le projet. Il est
chargé et validé avant l'ouverture du port :

```ts
import { defineConfigSync } from "raiton/core"

export default defineConfigSync({
  rootDir: "./source",
  version: "0.1.0",
  port: 5711,
  hostname: "0.0.0.0",
  prefix: "/api",
  pathname: "/",
  artifacts: {
    types: ["controller", "service", "repository", "dto", "mcp"],
  },
})
```

Le `rootDir` indique où le scanner cherche les sources et le bootstrapper. Si
votre code vit dans `src/`, changez simplement cette valeur. Voir
[Configuration](/docs/configuration) pour toutes les options.

## Créer le point d'entrée

Raiton attend un bootstrapper dans `source/main.ts` (ou dans le `rootDir`
configuré) :

```ts
import "reflect-metadata"
import { Application } from "raiton/core"
import { RuntimeType } from "raiton/framework"
import type { ThreadInterface } from "raiton/types"

export default async function main(thread: ThreadInterface) {
  const app = new Application({
    port: 5711,
    prefix: "/api",
  })

  return await thread
    .setup({ application: app, runtime: RuntimeType.Bun })
    .run()
}
```

Le bootstrapper reçoit un `RaitonThread` déjà initialisé. `thread.setup()`
enregistre le body parser, choisit l'adaptateur runtime et prépare le serveur.
`thread.run()` scanne les artifacts, monte les routes puis écoute sur le port.

## Démarrer

```bash
# Bun
bun raiton dev

# Node.js
npx raiton dev

# Deno
deno task dev
```

Sur Bun et Node.js, le projet généré expose aussi les scripts `dev`, `build` et
`start` (`bun run dev` ou `npm run dev`). Sur Deno, utilisez les tâches
`deno task dev`, `deno task build` et `deno task start`.

Vous devriez voir les URL locale et réseau :

```text
[INFO] Local access: http://localhost:5711/api
[INFO] LAN access: http://192.168.1.42:5711/api
```

## Vérifier l'installation

Créez un contrôleur minimal :

```ts
// source/controllers/hello.controller.ts
import { Controllable, Get } from "raiton/framework"

@Controllable("/hello")
export class HelloController {
  @Get("/")
  index() {
    return { message: "Bonjour de Raiton" }
  }
}
```

Puis :

```bash
curl http://localhost:5711/api/hello
# {"message":"Bonjour de Raiton"}
```

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Reflect.getMetadata is not a function` | `reflect-metadata` absent | Importez-le en premier |
| `Cannot read properties of undefined (reading 'name')` | métadonnées désactivées | Activez `emitDecoratorMetadata` |
| Le contrôleur n'est pas monté | fichier mal nommé | Utilisez le suffixe `.controller.ts` |
| `401` inattendu | middleware global | Vérifiez l'ordre d'enregistrement |
| Port déjà utilisé | autre processus | Changez `port` ou tuez le processus |

Pour un diagnostic automatique :

```bash
bun raiton doctor
```

## Prochaines étapes

- [Démarrage rapide](/docs/quickstart)
- [Structure du projet](/docs/project-structure)
- [Configuration](/docs/configuration)
