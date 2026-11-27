---
title: "Codes d'erreur"
description: "Catalogue stable des codes d'erreur, format du payload, comportement en production et gestion côté client."
section: reference
order: 54
since: "6.9"
---

Raiton expose un catalogue d'erreurs **stable**. Un code publié ne change plus ;
les nouveaux codes sont additifs.

## Format

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "message": "Invalid request",
  "details": [],
  "requestId": "req_…",
  "docsUrl": "https://…"
}
```

| Champ | Présent | Rôle |
|---|---|---|
| `error` | Toujours | `true` pour une erreur |
| `code` | Toujours | Code stable |
| `statusCode` | Toujours | Statut HTTP |
| `message` | Toujours | Message lisible |
| `details` | Selon le code | Détails de validation |
| `requestId` | Si corrélation | Identifiant de requête |
| `docsUrl` | Toujours | Documentation du code |

En production, aucune pile d'appels n'est renvoyée.

## Catalogue

| Code | Statut | Message |
|---|---|---|
| `BAD_REQUEST` | 400 | Bad request |
| `VALIDATION_ERROR` | 400 | Invalid request |
| `UNAUTHORIZED` | 401 | Unauthorized |
| `FORBIDDEN` | 403 | Forbidden |
| `NOT_FOUND` | 404 | Not found |
| `METHOD_NOT_ALLOWED` | 405 | Method not allowed |
| `CONFLICT` | 409 | Conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |
| `OUTPUT_VALIDATION_ERROR` | 500 | Response does not match its contract |
| `SERVICE_UNAVAILABLE` | 503 | Service unavailable |
| `CONFIGURATION_ERROR` | 500 | Invalid application configuration |

## Erreurs de validation

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "statusCode": 400,
  "details": [
    {
      "path": "email",
      "code": "invalid_format",
      "message": "Expected string to match 'email' format"
    }
  ]
}
```

- `path` est relatif au corps, ou préfixé (`query.page`, `params.id`).
- `code` décrit le type d'échec.
- Le handler n'est jamais exécuté.

## Erreurs de sortie

`OUTPUT_VALIDATION_ERROR` n'apparaît qu'en développement (`validation.responses`
à `auto` ou `true`). Il indique une réponse qui ne correspond pas à `@Output`.

## Erreurs MCP

Le transport MCP utilise JSON-RPC :

| Code | Signification |
|---|---|
| `-32700` | Parse error |
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |
| `-32002` | Server not initialized |

## Gérer côté client

```ts
if (!response.ok) {
  const body = await response.json()
  switch (body.code) {
    case "VALIDATION_ERROR":
      showFieldErrors(body.details)
      break
    case "RATE_LIMITED":
      retryAfter(response.headers.get("retry-after"))
      break
    default:
      report(body.requestId)
  }
}
```

Le client généré expose `statusCode`, `code`, `details`, `docsUrl` et
`requestId` sur `RaitonClientError`.

## Logs

- Les erreurs 5xx sont journalisées avec la pile côté serveur.
- Les erreurs 4xx ne sont pas des incidents.
- `requestId` permet de corréler une plainte utilisateur avec les logs.
- Ne loggez jamais le corps complet d'une requête contenant des secrets.

## Voir aussi

- [Réponses et erreurs](/docs/responses)
- [Validation](/docs/validation)
- [Observabilité](/docs/observability)
