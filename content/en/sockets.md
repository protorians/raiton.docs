---
title: "Sockets"
description: "Declare real-time controllers with @Socket and handle connections, messages and events."
section: fonctionnalites
order: 26
since: "6.0"
---

Sockets enable real-time exchanges on the same server as the HTTP
API. A socket controller is a class decorated with `@Socket(namespace)`.

## Declaring a controller

```ts
import {
  OnSocketConnect,
  OnSocketDisconnect,
  OnSocketEvent,
  OnSocketMessage,
  Socket,
} from "raiton/framework"

@Socket("/chat")
export class ChatSocket {
  private clients = new Set<WebSocket>()

  @OnSocketConnect()
  connect(client: WebSocket) {
    this.clients.add(client)
    return { connected: true }
  }

  @OnSocketMessage("message")
  message(payload: { text: string }) {
    return { ok: true, text: payload.text }
  }

  @OnSocketEvent("typing")
  typing(payload: { user: string }) {
    return { user: payload.user, typing: true }
  }

  @OnSocketDisconnect()
  disconnect(client: WebSocket) {
    this.clients.delete(client)
  }
}
```

| Decorator | Role |
|---|---|
| `@Socket(namespace)` | Marks the class and its namespace |
| `@OnSocketConnect()` | New connection |
| `@OnSocketMessage(name?)` | Raw or named message |
| `@OnSocketEvent(name)` | Application event |
| `@OnSocketDisconnect()` | Disconnection |

## Namespaces

The namespace is a logical prefix, not an HTTP route. It lets you separate
domains (`/chat`, `/notifications`, `/presence`) and locate the
handlers.

```ts
@Socket("/notifications")
export class NotificationSocket {
  @OnSocketMessage("notify")
  notify(payload: { userId: string; message: string }) {
    return { delivered: true }
  }
}
```

## Lifecycle

1. The scanner detects `*.socket.ts`.
2. The controller is resolved by the DI container.
3. The runtime adapts the WebSocket connection (`Bun`, `Deno`, or Node depending on
   the adapter).
4. The handlers are associated with the namespace events.

## Good practices

- Keep socket handlers free of heavy business logic: call a service.
- Validate incoming messages like HTTP bodies.
- Explicitly close resources in `@OnSocketDisconnect()`.
- Test sockets on the production runtime: WebSocket implementations
  differ between Bun, Node and Deno.

## Limitations

- Support is more mature on Bun and Deno than on Node.js.
- There is no automatic reconnection on the client side: it belongs to your
  application.
- Sockets are not documented in OpenAPI.

## See also

- [Runtimes](/docs/runtimes)
- [Injection](/docs/injection)
- [Security](/docs/security)
