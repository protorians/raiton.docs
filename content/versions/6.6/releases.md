---
title: "Notes de version 6.6"
description: "Health checks, CSRF et chargement des artefacts DI dans Raiton 6.6."
section: versions
order: 70
since: "6.0"
---

## 6.6.0-beta.14

**4 septembre 2026** · `v6.6.0-beta.14`

### Health checks

- Endpoint `GET /health` par défaut.
- Décorateur `@HealthCheck()`.
- `HealthCheckManager` : chemin, réponse, vérifications personnalisées.
- Statuts `healthy`, `degraded`, `unhealthy`.

### CSRF

- Mode double-submit (stateless).
- Mode synchronizer (stateful avec TTL).
- Détection des clients mobile/desktop.
- Décorateurs `@CsrfToken()` et `@CsrfGuard()`.

### Injection de dépendances

- Chargement des artefacts DI avec classification.
- Cache par timestamp.
- Amélioration des traces lorsqu'une dépendance manque.

### Migration depuis 6.5

Aucun changement cassant. Les health checks et CSRF sont opt-in, à l'exception
du `/health` par défaut.

### Limites connues

- Les vérifications de santé s'exécutent à chaque appel ; gardez-les légères.
- Le rate limit CSRF dépend du stockage serveur en mode synchronizer.
