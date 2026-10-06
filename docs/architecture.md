# Architecture

This document describes the system as it is **now** and the **target** it is growing towards.
Anything not built yet is marked *(planned)*. Decisions and their trade-offs live in [`adr/`](adr/README.md).

## 1. Architectural style

**Modular monolith with event-driven internal processing** ([ADR-001](adr/0001-modular-monolith.md),
[ADR-007](adr/0007-no-microservices-initially.md)).

- One deployable API process plus background workers, one PostgreSQL database.
- The code is split into **business modules** (Fleet, Trip, Dispatch, Telemetry, …) with explicit
  boundaries, so a module can later be extracted into a service if there is a measured reason.
- High-volume and asynchronous work (telemetry, integration) goes through Kafka; transactional
  business operations go through the API and PostgreSQL.

## 2. Current state (Phase 0)

```
Browser (React, :5173)
    |  /health/*, /api/* via Vite dev proxy
    v
ASP.NET Core API (:5140)
    - /health/live    process is running
    - /health/ready   dependencies tagged "ready" are healthy (none registered yet)
    - /openapi/v1.json (Development only)

Docker Compose: PostgreSQL 18 (:5432), Redis 8 (:6379), Kafka 4 KRaft (:9092 host, :29092 internal)
                — running, not yet used by the API
```

## 3. Target architecture

```
                 React + TypeScript
                   |            ^
            REST   |            |  SignalR (vehicle state pushes)
                   v            |
            +-------------------------------+
            |        ASP.NET Core API       |
            |  Identity Fleet Device Driver |
            |  Container Order Trip Dispatch|
            |  Notifications Audit          |
            +-------------------------------+
               |            |           ^
     EF Core   |            | read      |
               v            v           |
          PostgreSQL      Redis --------+
       (business truth)  (derived state, cache)
                            ^
                            | write VehicleState
                            |
Device simulator --> Telemetry ingestion --> Kafka --> Telemetry processor
APPLX (mock)     --> Integration adapter --> Kafka --> Domain event processor
```

Telemetry flow (the most important rule — see [domain.md](domain.md#events-vs-current-state)):

```
Device -> telemetry event (immutable fact) -> Kafka -> processor -> derived VehicleState -> Redis -> SignalR -> UI
```

## 4. Code structure and dependency rule

```
Api  ──>  Infrastructure  ──>  Application  ──>  Domain
 └──────────────────────────────>┘
```

| Project | Contains | May depend on |
|---|---|---|
| `Domain` | Entities, value objects, domain rules, domain events | nothing (BCL only) |
| `Application` | Use cases, validation, ports (interfaces) to external systems | `Domain` |
| `Infrastructure` | EF Core `DbContext`, Redis, Kafka, external adapters | `Application`, `Domain` |
| `Api` | HTTP endpoints, auth, middleware, DI composition, health checks | all of the above |

The rule is enforced by [`tests/ArchitectureTests`](../tests/ArchitectureTests/LayerDependencyTests.cs).

**Modules inside layers.** Business modules are folders and namespaces inside each layer project,
for example `Domain/Fleet`, `Application/Fleet`, `Infrastructure/Fleet`. We do not create one
project per module yet (see ADR-001 for the trade-off). Module rules *(to be enforced by
architecture tests as modules appear)*:

- A module owns its tables. Other modules do not query them directly.
- Cross-module calls go through a module's public application interface or through events.
- No shared "Common" bucket for business logic; shared code must be genuinely generic.

**Pragmatism rules** (from the project brief):

- Use EF Core directly in application handlers; no generic repository wrapper over `DbContext`.
- Add an abstraction only when there are two real implementations or a real boundary
  (for example `IExternalLogisticsSource` with `ApplxAdapter` and `MockApplxAdapter`).

## 5. Data ownership

| Data | Store | Source of truth? | Notes |
|---|---|---|---|
| Users, roles, permissions | PostgreSQL | Yes | |
| Vehicles, drivers, devices, containers | PostgreSQL | Yes | |
| Orders, trips, dispatch decisions | PostgreSQL | Yes | |
| Audit trail (overrides, sensitive actions) | PostgreSQL | Yes | Append-only |
| Telemetry events | Kafka (retention-limited) | Yes, for the retention window | Long-term history store decided in Phase 6 |
| Current `VehicleState` | Redis | **No** — derived | Rebuildable from telemetry; may be lost |
| Cached read models | Redis | No | TTL + explicit invalidation |

If Redis is lost, the system must be able to rebuild `VehicleState`; if PostgreSQL is lost, the
business is lost — this asymmetry drives backup and consistency decisions
([ADR-002](adr/0002-postgresql.md), [ADR-003](adr/0003-redis-current-vehicle-state.md)).

## 6. Messaging *(planned)*

Initial topics: `telemetry.received`, `vehicle.state.changed`, `order.imported`, `trip.created`,
`trip.dispatched`. Topic auto-creation is disabled in local Kafka; every topic is created explicitly.

For every topic we must document: message contract, partition key, consumer group, retry strategy,
dead-letter strategy, and idempotency. Open decisions:
[ADR-008 ordering](adr/0008-telemetry-ordering.md), [ADR-009 idempotency](adr/0009-idempotency.md).

## 7. Cross-cutting concerns

| Concern | Now | Planned |
|---|---|---|
| Health | `/health/live`, `/health/ready` | Readiness checks for PostgreSQL, Redis, Kafka (EX-01, EX-02) |
| Logging | Default ASP.NET Core console logging | Structured logs with correlation ID (EX-03) |
| Tracing / metrics | — | OpenTelemetry (Phase 8) |
| Errors | Default | RFC 7807 `ProblemDetails` for all API errors |
| Configuration | `appsettings*.json`, environment variables | Azure Key Vault in cloud; never secrets in git |
| AuthN / AuthZ | — | Access + refresh tokens, permission-based policies enforced in the backend |
| API docs | OpenAPI document (Development) | Swagger UI / Scalar |

**Liveness vs readiness:** liveness never checks external dependencies, so a database outage does
not cause healthy API instances to be restarted. Readiness checks dependencies the API cannot serve
traffic without.

## 8. Quality gates

- `TreatWarningsAsErrors` + .NET analyzers (`latest-recommended`) for all projects.
- Central package versions (`Directory.Packages.props`); vulnerable packages fail the restore.
- CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)): backend build + tests,
  frontend lint + tests + build, Docker Compose validation.

## 9. Testing strategy

| Level | Project | What it proves |
|---|---|---|
| Unit | `tests/UnitTests` | Domain rules, scoring, validators — fast, no I/O |
| Integration | `tests/IntegrationTests` | HTTP endpoints, EF Core against real PostgreSQL, Redis, Kafka where practical |
| Architecture | `tests/ArchitectureTests` | Layer and module dependency rules |
| Frontend | `frontend/src/**/*.test.tsx` | Component behavior including loading, error and empty states |
| End-to-end | *(planned)* | Critical user journeys |

Tests prove behavior (duplicate, out-of-order, concurrent, unauthorized cases), not coverage numbers.
