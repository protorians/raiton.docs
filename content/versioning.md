---
title: "Politique de versions"
description: "Comprendre le versionnement de Raiton, les versions supportées et les chemins de migration."
section: versions
order: 71
since: "6.0"
---

## Schéma de version

Raiton suit un versionnement `MAJOR.MINOR.PATCH` avec un suffixe de pré-release
pendant la beta :

```text
6.10.0-beta.28
│ │ │  │   └─ numéro de build beta
│ │ │  └───── pré-release
│ │ └──────── patch
│ └────────── minor
└──────────── major
```

- **major** : changements cassants.
- **minor** : fonctionnalités compatibles.
- **patch** : corrections compatibles.

Pendant la beta, une minor peut contenir des ajustements d'API, mais les codes
d'erreur et les contrats publiés restent stables.

## Versions documentées

| Version | Statut | Documentation |
|---|---|---|
| 6.10 | **latest** | [Lire](/docs/6.10) |
| 6.9 | archivée | [Lire](/docs/6.9) |
| 6.8 | archivée | [Lire](/docs/6.8) |
| 6.7 | archivée | [Lire](/docs/6.7) |
| 6.6 | archivée | [Lire](/docs/6.6) |

Le sélecteur de version, en haut de page, permet de basculer entre les
documentations. Une page marquée « Depuis 6.9 » n'existe pas dans les versions
antérieures.

## Support

- La dernière version reçoit les correctifs et les fonctionnalités.
- Les versions archivées restent consultables mais ne reçoivent plus de
  correctifs.
- Les codes d'erreur publics ne sont jamais réutilisés.

## Migration

### 6.9 → 6.10

Aucun changement cassant. La 6.10 est consacrée aux performances : le routage,
le pipeline HTTP et le démarrage sont plus rapides, avec des benchmarks et des
tests de non-régression. Les contrats, le manifeste, MCP et l'observabilité
introduits en 6.9 restent inchangés.

### 6.8 → 6.9

1. Mettez à jour `raiton` et la CLI.
2. Ajoutez `raiton/contracts` si vous adoptez les contrats.
3. Remplacez progressivement les DTO par `@Input` / `@Output`.
4. Générez le manifeste : `bun raiton inspect --json`.
5. Générez le client : `bun raiton client`.
6. Activez l'observabilité si nécessaire.

Les routes, décorateurs et DTO existants continuent de fonctionner.

### 6.7 → 6.8

Le scheduler est additif. Aucun changement de route ou de contrôleur n'est
requis. Vérifiez que les jobs ne s'exécutent pas en double si vous déployez
plusieurs instances.

### 6.6 → 6.7

Le cache est additif. `@Cache` est opt-in ; `etag()` doit être branché
explicitement. Aucun changement cassant.

## Compatibilité des runtimes

| Runtime | Support |
|---|---|
| Bun | Complet, recommandé |
| Node.js 22+ | Complet (CLI précompilée) |
| Deno 2+ | Complet, quelques limites sockets |

Les fonctionnalités spécifiques à un runtime sont signalées dans la
documentation.

## Dépréciations

Une API dépréciée :

1. est documentée comme telle ;
2. émet un avertissement en développement ;
3. reste disponible pendant au moins une minor ;
4. est retirée lors d'une major.

## Vérifier sa version

```bash
bun raiton --version
bun raiton doctor --json
```

`doctor` compare la version du CLI, celle du package et celle du manifeste.

## Voir aussi

- [Notes de version](/docs/releases)
- [Contribuer](/docs/contributing)
- [Déploiement](/docs/deployment)
