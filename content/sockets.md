---
title: "Sockets"
description: "Déclarer des contrôleurs temps réel avec @Socket et gérer les connexions, messages et événements."
section: fonctionnalites
order: 26
since: "6.0"
---

Les sockets permettent des échanges temps réel sur le même serveur que l'API
HTTP. Un contrôleur socket est une classe décorée avec `@Socket(namespace)`.

## Déclarer un contrôleur

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

| Décorateur | Rôle |
|---|---|
| `@Socket(namespace)` | Marque la classe et son namespace |
| `@OnSocketConnect()` | Nouvelle connexion |
| `@OnSocketMessage(name?)` | Message brut ou nommé |
| `@OnSocketEvent(name)` | Événement applicatif |
| `@OnSocketDisconnect()` | Fermeture |

## Namespaces

Le namespace est un préfixe logique, pas une route HTTP. Il permet de séparer
les domaines (`/chat`, `/notifications`, `/presence`) et de retrouver les
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

## Cycle de vie

1. Le scanner détecte `*.socket.ts`.
2. Le contrôleur est résolu par le conteneur DI.
3. Le runtime adapte la connexion WebSocket (`Bun`, `Deno`, ou Node selon
   l'adaptateur).
4. Les handlers sont associés aux événements du namespace.

## Bonnes pratiques

- Gardez les handlers socket sans logique métier lourde : appelez un service.
- Validez les messages entrants comme les corps HTTP.
- Fermez explicitement les ressources dans `@OnSocketDisconnect()`.
- Testez les sockets sur le runtime de production : les implémentations WebSocket
  diffèrent entre Bun, Node et Deno.

## Limites

- Le support est plus mature sur Bun et Deno que sur Node.js.
- Il n'y a pas de reconnexion automatique côté client : elle appartient à votre
  application.
- Les sockets ne sont pas documentés dans OpenAPI.

## Voir aussi

- [Runtimes](/docs/runtimes)
- [Injection](/docs/injection)
- [Sécurité](/docs/security)
