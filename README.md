# Logistics Dispatch & Fleet Optimization Platform

A production-style logistics dispatch platform for trucks, containers, drivers, devices and trips.
It combines business data (orders, trips) from an external logistics system with real-time GPS
telemetry from black-box devices, and helps dispatchers monitor the fleet and assign vehicles.

This is also a **training project** for international remote Full-stack .NET / Product Engineer roles:
some features are reference implementations, others are deliberately left as exercises.
See [How this repository is used for learning](#how-this-repository-is-used-for-learning).

## Status

**Phase 0 — Foundation.** The solution skeleton, local infrastructure, health endpoints and CI exist.
No business feature is implemented yet; the first vertical slice (Vehicle CRUD) is next.

Progress and the full task list: [`docs/learning/progress.md`](docs/learning/progress.md),
[`docs/learning/checklist.md`](docs/learning/checklist.md).

## Tech stack

| Area | Choice |
|---|---|
| Backend | .NET 10, ASP.NET Core, EF Core (planned), PostgreSQL |
| Frontend | React 19, TypeScript, Vite; TanStack Query, React Hook Form, Zod (planned) |
| Messaging / state | Apache Kafka (KRaft), Redis |
| Real-time | SignalR (planned) |
| Testing | xUnit, FluentAssertions, NetArchTest, WebApplicationFactory, Vitest, Testing Library |
| Delivery | Docker Compose, GitHub Actions; Azure (planned) |

Why these choices: [`docs/adr/`](docs/adr/README.md).

## Repository layout

```
src/
  Api/               ASP.NET Core host: endpoints, middleware, composition root
  Application/       use cases, application services, ports to external systems
  Domain/            entities, value objects, domain rules — no framework dependencies
  Infrastructure/    EF Core, Redis, Kafka, external adapters
tests/
  UnitTests/         domain and application rules
  IntegrationTests/  API and infrastructure through real HTTP / containers
  ArchitectureTests/ dependency rules between layers and modules
frontend/            React + TypeScript app
infrastructure/
  docker/            local PostgreSQL, Redis and Kafka
.github/workflows/   CI
docs/                architecture, domain, ADRs, backlog, learning material
```

## Quick start

Prerequisites: .NET SDK 10.0.1xx, Node.js 24, Docker Desktop.

```bash
cp infrastructure/docker/.env.example infrastructure/docker/.env
docker compose -f infrastructure/docker/compose.yaml up -d --wait

dotnet test
dotnet run --project src/Api                  # http://localhost:5140/health/ready

cd frontend
npm ci
npm run dev                                   # http://localhost:5173
```

Details, ports and troubleshooting: [`docs/local-development.md`](docs/local-development.md).

## Documentation

| Document | Purpose |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | System shape, layers, data ownership, event flow |
| [`docs/domain.md`](docs/domain.md) | Ubiquitous language, entities, lifecycles, domain rules |
| [`docs/local-development.md`](docs/local-development.md) | Running and debugging locally |
| [`docs/adr/`](docs/adr/README.md) | Architecture Decision Records |
| [`docs/backlog/`](docs/backlog/README.md) | Task and exercise definitions |
| [`docs/learning/`](docs/learning/README.md) | Learning roadmap, progress, checklist |

## How this repository is used for learning

- **Golden path** — reference implementations (for example Vehicle CRUD, authentication baseline,
  Docker setup) that show the expected engineering standard.
- **Challenge path** — features left for the owner to implement by hand (for example telemetry
  deduplication, out-of-order processing, dispatch scoring). Each one has a task file in
  `docs/backlog/` with acceptance criteria and hints, but no solution.

## Contributing workflow

- Branches: `main` (released), `develop` (integration), `feature/<ticket>-<short-description>`,
  `fix/<ticket>-<short-description>`.
- Commits follow Conventional Commits, for example `feat(telemetry): add device location ingestion`.
- Every pull request must keep CI green: build with warnings as errors, backend and frontend tests,
  frontend lint, Docker Compose validation.
