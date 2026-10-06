# EX-01: PostgreSQL readiness check

- Phase: 0
- Type: Owner exercise
- Status: Open
- Branch: `feature/EX-01-postgresql-readiness`

## Problem

`/health/ready` currently always returns `Healthy`, because no dependency checks are registered.
Once the API stores data in PostgreSQL, an instance that cannot reach the database will still
report "ready" and keep receiving traffic it can only answer with errors.

## Context

- `src/Api/Program.cs` — health endpoints and the `HealthCheckTags.Ready` tag.
- `tests/IntegrationTests/HealthEndpointTests.cs` — existing health tests.
- [`docs/architecture.md`](../architecture.md) §7 — liveness vs readiness.
- `infrastructure/docker/compose.yaml` and `.env.example` — local PostgreSQL and its credentials.
- [ADR-002](../adr/0002-postgresql.md) — PostgreSQL.

## Goal

`/health/ready` reports whether the API can reach PostgreSQL, while `/health/live` stays independent
of every external dependency.

## Constraints

- Do not change the meaning of `/health/live`.
- The connection string comes from configuration (for example `ConnectionStrings:...`), and can be
  overridden by an environment variable. **No password is committed** — not in `appsettings.json`,
  not in tests.
- A new NuGet package is allowed only if you can explain why it is better than writing the check
  yourself. Add its version to `Directory.Packages.props`.
- The check must not hang: a slow or unreachable database must produce a result within a bounded time.
- Keep the build green with warnings as errors.

## Acceptance Criteria

- [ ] With PostgreSQL running, `GET /health/ready` returns `200` and body `Healthy`.
- [ ] With PostgreSQL stopped (`docker compose stop postgres`), `GET /health/ready` returns `503`
      within a few seconds, and `GET /health/live` still returns `200`.
- [ ] Starting PostgreSQL again makes `/health/ready` return `200` without restarting the API.
- [ ] An automated integration test proves the healthy case **and** the unhealthy case.
- [ ] `docs/local-development.md` explains how to configure the connection string locally.

## Technical Notes

Things to investigate — decide yourself:

- How `AddHealthChecks()` registers a check with tags, and how the `/health/ready` predicate selects it.
- Option A: an existing health-check package for Npgsql. Option B: your own `IHealthCheck`.
  Compare dependency cost, control over the query and timeout, and testability.
- Where does local configuration live without being committed? Look at **user secrets** and
  **environment variables**; consider how CI will provide the value.
- For the test, which database do you use?
  - the Docker Compose container (simple, but the test depends on something started outside the test), or
  - a container started by the test itself (Testcontainers — self-contained, works in CI, adds a dependency).
  Write down which you chose and why in the PR description.
- How can a test produce the "unhealthy" case reliably? (Hint: you do not need to stop a real
  database — think about what configuration makes the check fail.)
- What should the readiness response contain in production? Detailed check output can leak
  infrastructure details to anonymous callers.

## Learning Objectives

- Liveness vs readiness, and why liveness must not check dependencies.
- ASP.NET Core health checks: registration, tags, predicates, status codes.
- Configuration layering in ASP.NET Core (appsettings → user secrets → environment variables) and secret hygiene.
- Integration testing against real infrastructure.

## Interview Topics

- "Your readiness probe checks PostgreSQL. The database has a 30-second failover. What happens to
  your API pods, and is that the behaviour you want?"
- "Should a readiness probe check *every* dependency? What about one that is only used by one rarely called endpoint?"
- "How do you keep connection strings out of source control in development, CI and production?"

## Definition of Done

- [ ] Acceptance criteria met and proven by tests
- [ ] Build green with no warnings, all tests pass locally and in CI
- [ ] `docs/local-development.md` updated
- [ ] Reviewed by the agent ("review EX-01"), findings addressed
- [ ] PR merged into `develop`, `progress.md` and `checklist.md` updated
