---
title: "Notes de version"
description: "Nouveautés, corrections et points de migration de Raiton 6.10."
section: versions
order: 70
since: "6.0"
---

## 6.10.0-beta.28

**27 novembre 2026** · `v6.10.0-beta.28` · [Comparer sur GitHub](https://github.com/protorians/raiton/compare/v6.9.1-beta.27...v6.10.0-beta.28)

La version 6.10 consolide les acquis de la 6.9 et se concentre sur les
performances.

### Performance

- Routage, pipeline HTTP et démarrage optimisés.
- Benchmarks ajoutés pour le routage, le pipeline et le démarrage.
- Budgets de benchmark calibrés sur les runners partagés.
- Tests de non-régression pour surveiller les performances.

### Consolidation

- Contrats schema-first, manifeste, MCP stdio, observabilité et CLI réunis dans
  la même release.
- Aucun changement d'API par rapport à la 6.9.

### Migration depuis 6.9

Aucun changement cassant. Mettez à jour le package `raiton` et la CLI ; le reste
du code applicatif reste compatible.

## 6.9.0-beta.26

**27 novembre 2026** · `v6.9.0-beta.26` · [Comparer sur GitHub](https://github.com/protorians/raiton/compare/v6.8.9-beta.25...v6.9.0-beta.26)

La version 6.9 est la plus grande mise à jour depuis la création du framework.
Elle ajoute les contrats schema-first, le manifeste, MCP stdio, l'observabilité et
une CLI complète.

### Contrats schema-first

- Module `raiton/contracts` basé sur TypeBox.
- Façade `t` avec contraintes chaînables (`min`, `max`, `email`, `optional`…).
- `@Input` et `@Output` pour valider les entrées et les sorties.
- Payload `VALIDATION_ERROR` stable.
- Validation de sortie en développement uniquement (`OUTPUT_VALIDATION_ERROR`).
- Support des schémas Standard Schema v1 (Zod, Valibot, ArkType).

```bash
bun raiton openapi export --out openapi.json
bun raiton client --out ./sdk
```

### Manifeste versionné

- Inventaire complet : routes, artefacts, graphe DI, configuration, env, MCP.
- Schéma JSON publié et validable.
- Cache invalidé par le HMR.
- Commandes `inspect`, `routes`, `why`, `doctor`, `artifact`.

### MCP

- Transport **stdio** en plus de Streamable HTTP.
- Suite de conformité partagée HTTP / stdio.
- Schémas d'entrée et de sortie par outil.
- Annotations de sûreté et outils destructifs masqués par défaut.
- Scopes, audit avec expurgation des secrets, rate limit par outil.

### Observabilité

- Identifiants de corrélation (`x-request-id`).
- Métriques Prometheus (`/metrics`).
- Traces OTLP/HTTP.
- Catalogue d'erreurs stable.
- Readiness et arrêt gracieux borné.

### CLI

- `new` avec templates `api`, `minimal`, `mcp-agent`.
- `generate` pour contrôleur, service, dépôt, DTO, MCP, test, ressource.
- `openapi export`, `client`, `contract check|snapshot`.
- `mcp list|inspect|test|serve|conformance`.
- `docs agents` pour `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CLAUDE.md`.
- Sortie JSON unique, logs sur `stderr`, codes de sortie stables.

### Découverte

- Page de développement `/__dev`.
- Suggestions de routes sur 404 en développement.
- Interface OpenAPI Redoc par défaut.

### Corrections

- `Application.handle` respecte `statusCode` des objets de réponse simples.
- L'interface OpenAPI n'envoie plus de corps vide.
- Le bootstrapper n'installe plus le body parser deux fois et ne démarre plus
  le scheduler hors mode serveur.

### Migration depuis 6.8

- Aucun changement cassant connu.
- Les DTO `class-validator` restent supportés ; les contrats sont recommandés.
- `inspect`, `why` et `doctor` nécessitent la CLI 6.9.

## Historique

| Version | Point clé |
|---|---|
| 6.10 | Performance, benchmarks et consolidation |
| 6.9 | Contrats, manifeste, MCP stdio, observabilité, CLI |
| 6.8 | Scheduler et files d'attente |
| 6.7 | Cache HTTP et ETag |
| 6.6 | Health checks, CSRF, artefacts DI |

Voir [toutes les versions](/docs/versioning).
