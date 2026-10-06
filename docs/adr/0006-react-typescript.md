# ADR-006: React + TypeScript frontend

- Status: Accepted
- Date: 2026-10-06

## Context

The UI is an operations tool: data tables with paging/filtering, forms with validation, and a live
map. It must be maintainable by a .NET-focused engineer and representative of what international
product teams use.

## Decision

Use **React with TypeScript** built by **Vite**, with:

- **TanStack Query** for server state (caching, refetching, optimistic updates),
- **React Hook Form + Zod** for forms and validation,
- **Vitest + Testing Library** for component tests,
- **oxlint** for linting.

The frontend is a separate SPA that talks to the API over REST and SignalR.

## Alternatives

- **Blazor**: one language end to end, but a smaller ecosystem for maps/tables and less common in the target job market.
- **Angular**: complete framework, more ceremony for a small team.
- **Next.js**: server rendering is not needed for an authenticated internal tool and adds a Node server to operate.

## Trade-offs

- Gain: largest ecosystem and hiring market, strong typing across API boundaries, fast dev loop.
- Give up: two languages and two toolchains; API types must be kept in sync with the backend.

## Consequences

- Typed API clients (hand-written or generated from OpenAPI) are required to avoid contract drift.
- Authorization in the UI is only cosmetic; the backend always enforces permissions.
