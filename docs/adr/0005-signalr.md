# ADR-005: SignalR for real-time updates

- Status: Accepted
- Date: 2026-10-06

## Context

The fleet map must show vehicle movement within seconds. Polling an endpoint for every vehicle (or
the whole fleet every second) from every open browser would multiply load on the API and Redis by
the number of users, and still lag.

## Decision

Use **ASP.NET Core SignalR** to push vehicle state changes from the server to connected clients.
The initial page load fetches a snapshot over REST; SignalR then delivers incremental updates.

## Alternatives

- **Polling**: simplest, works everywhere, but wasteful and laggy at fleet scale.
- **Raw WebSockets**: full control, but we would rebuild reconnection, groups, transport fallback and auth integration.
- **Server-Sent Events**: simple one-way push, but no built-in groups or scale-out story in ASP.NET Core.

## Trade-offs

- Gain: first-class ASP.NET Core integration (auth, DI), automatic reconnect, groups, typed hubs, TypeScript client.
- Give up: stateful long-lived connections; multi-instance deployments need a backplane (Redis) or Azure SignalR Service.

## Consequences

- We must design the fan-out: which clients receive which updates (groups by region/viewport?), and how often (throttling, batching) — EX-30.
- Clients must handle reconnects by re-fetching the snapshot so they do not miss updates.
- Hub methods enforce the same permissions as REST endpoints.
