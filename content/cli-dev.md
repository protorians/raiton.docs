---
title: "Développer, builder, démarrer"
description: "Utiliser dev, build et start, comprendre le HMR, les artefacts rechargés et le comportement de production."
section: cli
order: 43
since: "6.0"
---

Le cycle local repose sur trois commandes : `dev`, `build` et `start`.

## `dev`

```bash
bun raiton dev
```

- démarre le serveur ;
- active le HMR ;
- observe le dossier source de façon récursive ;
- recharge les contrôleurs, services, middlewares, hooks, sockets, MCP et jobs ;
- affiche les URL locale et LAN.

```text
[HMR] activated
[INFO] Local access: http://localhost:5711/api
[INFO] LAN access: http://192.168.1.42:5711/api
```

Les artifacts rechargés sont déterminés par leur suffixe. Un fichier sans
suffixe connu n'est pas rechargé à chaud.

## `build`

```bash
bun raiton build
bun raiton build --develop   # inclut les stacks de debug
```

`build` vérifie les types puis compile le bootstrapper avec esbuild vers
`.raiton/server/main.mjs`. Sur Node.js, `start` utilise ce fichier compilé ; sur
Bun et Deno, le bootstrapper TypeScript reste exécuté directement.

Le typecheck du build **signale** les erreurs sans toujours bloquer. Pour une
garantie stricte, lancez `tsc --noEmit` dans votre CI.

## `start`

```bash
bun raiton start
```

- aucun HMR ;
- performances optimales ;
- utilise le build précédent ;
- démarre le scheduler et l'observabilité configurée.

Sur Node.js :

```bash
node build/bin/index.mjs start
# ou
node .raiton/server/main.mjs
```

## Scripts npm

```json
{
  "scripts": {
    "dev": "bun raiton dev",
    "build": "bun raiton build",
    "start": "bun raiton start",
    "test": "bun test"
  }
}
```

## Mode développement vs production

| Aspect | `dev` | `start` |
|---|---|---|
| HMR | Oui | Non |
| Stacks d'erreur | Oui | Non |
| Page `/__dev` | Oui | Non |
| Validation de sortie | Oui (`auto`) | Non |
| Scheduler | Oui | Oui |
| Observabilité | Selon config | Selon config |

## HMR en détail

Le watcher observe `rootDir` et dispatch un signal `hmr:artifact` pour chaque
fichier modifié. Le framework :

1. réimporte le module ;
2. met à jour le constructeur dans le conteneur ;
3. recompile les routes ou jobs concernés ;
4. conserve les autres instances.

Les middlewares et hooks sont remplacés proprement ; les contrôleurs modifiés
sont recompilés sans redémarrer le processus.

## Dépannage

| Problème | Solution |
|---|---|
| HMR ne recharge rien | Vérifiez le suffixe du fichier |
| Port occupé | Changez `port` ou tuez le processus |
| `start` échoue après un changement | Relancez `build` |
| Build Node incomplet | Vérifiez `.raiton/server/main.mjs` |

## Voir aussi

- [CLI : inspecter](/docs/cli-inspect)
- [Runtimes](/docs/runtimes)
- [Déploiement](/docs/deployment)
