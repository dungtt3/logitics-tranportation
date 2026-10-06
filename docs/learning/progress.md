# Learning Progress Log

This file is the hand-off between learning sessions. Read it first when resuming work on any machine.
The full project brief is in [`document.md`](../../document.md).

## Current status

| Item | State |
|---|---|
| Phase | Phase 0 — Foundation |
| First-execution steps (`document.md` §40) | Steps 1–8 done; Steps 9–10 not started |
| Working branch | `feature/000-foundation` (branched from `develop`) |
| Build / tests | Green: 0 warnings, 7 tests passing (4 backend, 3 frontend) |
| Pending owner exercise | [Readiness check for PostgreSQL](#open-owner-exercise) |

## Next session — start here

1. Review the open owner exercise below and implement it (or ask for hints).
2. Step 9: README, `docs/architecture.md`, `docs/domain.md`, `docs/local-development.md`,
   `docs/backlog/`, learning roadmap, ADR-001 … ADR-010.
3. Step 10: first vertical slice — Vehicle CRUD (API + domain/application split + EF Core +
   PostgreSQL + validation + auth foundation + tests + React UI).
4. After Step 10: open a PR `feature/000-foundation` → `develop` and confirm CI is green on GitHub.

## Resuming on a new machine

Prerequisites: .NET SDK 10.0.1xx, Node 24 (see `frontend/.nvmrc`), Docker Desktop, Git.

```bash
git clone https://github.com/dungtt3/logitics-tranportation.git
cd logitics-tranportation
git checkout feature/000-foundation

cp infrastructure/docker/.env.example infrastructure/docker/.env
docker compose -f infrastructure/docker/compose.yaml up -d --wait

dotnet test                               # backend build + tests
dotnet run --project src/Api              # http://localhost:5140/health/ready
cd frontend && npm ci && npm test && npm run dev   # http://localhost:5173
```

## Session log

### 2026-10-06 — Session 1: Foundation scaffold (Steps 1–8)

**What was built**

- `.NET 10` solution `LogisticsDispatch.slnx`: `src/Api`, `src/Application`, `src/Domain`,
  `src/Infrastructure`, `tests/UnitTests`, `tests/IntegrationTests`, `tests/ArchitectureTests`.
- Shared build settings in `Directory.Build.props` (nullable, warnings as errors, analyzers) and
  central package versions in `Directory.Packages.props`. SDK pinned in `global.json`.
- `/health/live` and `/health/ready` endpoints; OpenAPI at `/openapi/v1.json` (Development only).
- React 19 + TypeScript + Vite app in `frontend/` showing API readiness; Vitest + Testing Library.
- Docker Compose (`infrastructure/docker/compose.yaml`): PostgreSQL 18.6, Redis 8.10, Kafka 4.3
  single-node KRaft, all with health checks.
- GitHub Actions CI (`.github/workflows/ci.yml`): backend, frontend, compose validation.

**Decisions made (to be written up as ADRs in Step 9)**

- Layered projects with one-way references (`Api → Infrastructure → Application → Domain`),
  enforced by architecture tests.
- Liveness has no dependency checks; readiness checks only dependencies tagged `ready`.
  Reason: a database outage must not make the orchestrator restart healthy API instances.
- Kafka topic auto-creation is disabled: partition count, partition key and retention must be
  deliberate decisions.
- Kafka has two listeners: `INTERNAL` (`kafka:29092`, for containers) and `EXTERNAL`
  (`localhost:9092`, for apps on the host).
- FluentAssertions pinned to `7.2.0` (Apache-2.0). Version 8+ needs a paid licence for commercial use.
- HTTPS redirection removed; locally the API runs on HTTP, TLS will terminate at the Azure ingress.
- CI lives in `.github/workflows/` (GitHub requirement), not `/infrastructure/github` as the brief suggests.

**Problems hit and lessons**

| Problem | Root cause | Lesson |
|---|---|---|
| Restore failed with `NU1903` | Template pulled `Microsoft.OpenApi` 2.0.0 with a known high-severity vulnerability | Warnings-as-errors catches supply-chain issues early; bumped ASP.NET packages to 10.0.12 |
| `CA1707` on test method names | Analyzer forbids underscores | Disabled only for `tests/**` in `.editorconfig` |
| Vitest: `Cannot find package '@testing-library/dom'` | Required peer dependency not installed automatically | Install peer deps explicitly |
| `docker exec … /opt/kafka/bin/...` failed in Git Bash | MSYS converts `/opt/...` to a Windows path | Prefix with `MSYS_NO_PATHCONV=1` |
| `docker: command not found` right after install | Shell session started before Docker was added to `PATH` | Restart the terminal/IDE after installing tools |
| PostgreSQL 18 volume path | PG 18 images store data under `/var/lib/postgresql/<version>/` | Mount `/var/lib/postgresql`, not `/var/lib/postgresql/data` |

**Concepts covered**

- Liveness vs readiness probes.
- Kafka advertised listeners (container network vs host).
- Architecture tests as guardrails for module boundaries.
- Central package management and warnings-as-errors as quality gates.

**Interview question to practise (answer in English, out loud)**

> "Your readiness probe checks PostgreSQL. The database has a 30-second failover.
> What happens to your API pods, and is that the behavior you want?"

## Open owner exercise

### Add a PostgreSQL readiness check

Implement it yourself; ask for hints only if stuck.

**Acceptance criteria**

- With PostgreSQL stopped (`docker compose -f infrastructure/docker/compose.yaml stop postgres`),
  `/health/ready` returns `503` while `/health/live` still returns `200`.
- The connection string comes from configuration; no password is hard-coded or committed.
- An integration test proves both behaviors.

**Hints**

- Look at `HealthCheckTags.Ready` in `src/Api/Program.cs` and how `AddHealthChecks()` accepts tags.
- Think about what the integration test should use as the database: the Compose container,
  or a container started by the test itself? What are the trade-offs for CI?

## Exercise history

| Date | Exercise | Status | Notes |
|---|---|---|---|
| 2026-10-06 | PostgreSQL readiness check | Open | |
