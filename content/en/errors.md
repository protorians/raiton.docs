---
title: "Error codes"
description: "Stable catalog of error codes, payload format, production behavior and client-side handling."
section: reference
order: 54
since: "6.9"
---

Raiton exposes a **stable** error catalog. A published code no longer changes;
new codes are additive.

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

| Field | Present | Role |
|---|---|---|
| `error` | Always | `true` for an error |
| `code` | Always | Stable code |
| `statusCode` | Always | HTTP status |
| `message` | Always | Readable message |
| `details` | Depends on the code | Validation details |
| `requestId` | If correlation | Request identifier |
| `docsUrl` | Always | Documentation for the code |

In production, no stack trace is returned.

## Catalog

| Code | Status | Message |
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

## Validation errors

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

- `path` is relative to the body, or prefixed (`query.page`, `params.id`).
- `code` describes the type of failure.
- The handler is never executed.

## Output errors

`OUTPUT_VALIDATION_ERROR` only appears in development (`validation.responses`
set to `auto` or `true`). It indicates a response that does not match `@Output`.

## MCP errors

The MCP transport uses JSON-RPC:

| Code | Meaning |
|---|---|
| `-32700` | Parse error |
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |
| `-32002` | Server not initialized |

## Handle on the client side

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

The generated client exposes `statusCode`, `code`, `details`, `docsUrl` and
`requestId` on `RaitonClientError`.

## Logs

- 5xx errors are logged with the stack trace on the server side.
- 4xx errors are not incidents.
- `requestId` lets you correlate a user complaint with the logs.
- Never log the full body of a request containing secrets.

## See also

- [Responses and errors](/docs/responses)
- [Validation](/docs/validation)
- [Observability](/docs/observability)
