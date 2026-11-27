---
title: "Notes de version 6.8"
description: "Scheduler déclaratif, files d'attente et corrections HMR de Raiton 6.8."
section: versions
order: 70
since: "6.0"
---

## 6.8.9-beta.25

**26 novembre 2026** · `v6.8.9-beta.25`

### Scheduler

- Décorateurs `@Scheduler`, `@Cron`, `@Every`, `@Timeout` et `@Task`.
- Expressions cron 5 ou 6 champs, macros et fuseaux horaires.
- Backends mémoire, Redis et RabbitMQ.
- Options `retries`, `retryDelay`, `timeout`, `concurrency`, `singleton`,
  `catchUp`, `priority`.
- HMR des jobs et injection de dépendances.
- API de contrôle : `dispatch`, `enqueue`, `pause`, `resume`, `cancel`.

### Corrections

- Rechargement HMR sécurisé des middlewares et hooks.
- Détection de l'adresse LAN réelle du serveur.

### Migration depuis 6.7

Aucun changement cassant. Le scheduler est opt-in : les jobs ne démarrent que si
un fichier `*.scheduler.ts` (ou variante) est détecté.

### Limites connues

- File mémoire locale au processus.
- Pas de file dead-letter dédiée.
- Redis et RabbitMQ nécessitent l'installation des paquets correspondants.
