# Project Checklist

Tick items as you finish them (`- [ ]` → `- [x]`), commit, and push. This file plus
[`progress.md`](progress.md) is everything needed to resume on any machine.

Legend:

- **[Agent]** — golden path: reference implementation the agent builds; you read and understand it.
- **[Owner]** — challenge path: you implement it by hand. The agent only explains, hints, reviews and tests.
- `EX-xx` — owner exercise. When you start one, ask the agent to write the full task in
  `docs/backlog/EX-xx-<name>.md` (problem, constraints, acceptance criteria, hints — no solution).

---

## Working loop (repeat for every exercise)

```
Agent builds foundation → You read the architecture → You implement EX-xx
  → Agent reviews → Agent tests → You fix → Merge → next exercise
```

Copy this block into the exercise's backlog file and tick it as you go:

```markdown
- [ ] Ask the agent for the task file `docs/backlog/EX-xx-<name>.md`
- [ ] Read the relevant code / docs listed in the task
- [ ] Create branch `feature/EX-xx-<short-name>` from `develop`
- [ ] Implement it yourself (ask for hints only when stuck)
- [ ] Write tests that prove the behavior
- [ ] `dotnet test` and `npm test` green locally
- [ ] Ask the agent: "review EX-xx" (correctness, design, security, tests, failure handling)
- [ ] Ask the agent: "test EX-xx" (agent tries to break it with edge cases)
- [ ] Fix review findings
- [ ] Open PR to `develop` (English description), CI green
- [ ] Merge
- [ ] Update `progress.md`: session log, lessons, interview question answered out loud
```

---

## Phase 0 — Foundation

- [x] [Agent] Step 1–8: solution, frontend, Docker Compose, health endpoints, CI
- [x] [Agent] Progress log and `CLAUDE.md` session rules
- [x] [Agent] Step 9: `README.md`, `docs/architecture.md`, `docs/domain.md`, `docs/local-development.md`
- [x] [Agent] Step 9: ADR-001 … ADR-007 (architecture choices)
- [x] [Agent] Step 9: ADR-008 … ADR-010 as *open questions* (you make the decisions in later exercises)
- [x] [Agent] Step 9: backlog format + EX-01 task file, learning roadmap (`docs/learning/README.md`)
- [ ] [Owner] Read `architecture.md` and ADR-001 … ADR-007; write 3 questions or disagreements in `progress.md`
- [ ] [Owner] Explain in English, out loud or in writing: "Why a modular monolith and not microservices?"
- [ ] [Owner] **EX-01** [PostgreSQL readiness check](../backlog/EX-01-postgresql-readiness-check.md) (`/health/ready` → 503 when the DB is down)
- [ ] [Owner] **EX-02** Redis and Kafka readiness checks — decide which dependencies should make the API "not ready"
- [ ] [Owner] **EX-03** Structured logging + correlation ID middleware (header in, header out, in every log line)
- [ ] [Owner] Open the first PR `feature/000-foundation` → `develop` and get CI green on GitHub

## Phase 1 — Identity + Fleet

- [ ] [Agent] Step 10: Vehicle CRUD vertical slice (API, domain/application split, EF Core, migration,
      validation, auth foundation, tests, React page)
- [ ] [Owner] Trace one request end to end (React → API → handler → EF Core → PostgreSQL) and document it
      in `docs/learning/fleet/concept.md`
- [ ] [Owner] **EX-04** Driver CRUD following the Vehicle pattern (backend + tests)
- [ ] [Owner] **EX-05** Device CRUD and assign device to vehicle (at most one active device per vehicle)
- [ ] [Owner] **EX-06** Vehicles list: pagination, filtering, sorting — justify every index you add
- [ ] [Owner] **EX-07** Optimistic concurrency on vehicle update (two dispatchers edit at once → `409`)
- [ ] [Agent] Auth baseline: users, login, access token
- [ ] [Owner] **EX-08** Refresh tokens with rotation and revocation
- [ ] [Owner] **EX-09** Permission-based authorization (`fleet.vehicle.*`), roles Admin/Dispatcher/FleetManager/Viewer,
      tests for every unauthorized action
- [ ] [Owner] **EX-10** Frontend: Drivers and Devices pages (loading / error / empty states, typed API client)
- [ ] [Owner] **EX-11** Permission-aware UI (hide or disable actions the user cannot perform)
- [ ] **Checkpoint (§41)** — verify before moving on:
  - [ ] repository builds, backend tests pass, frontend builds
  - [ ] Docker environment works from a clean clone
  - [ ] database migrations apply from scratch
  - [ ] login, authorization and Vehicle CRUD work end to end

## Phase 2 — Logistics Domain

- [ ] [Agent] Order and Trip domain model proposal + ADR (state machines, ownership of `ExternalId`)
- [ ] [Owner] **EX-12** Container CRUD
- [ ] [Agent] `IExternalLogisticsSource` boundary + `MockApplxAdapter` with realistic mock data
- [ ] [Owner] **EX-13** Import orders from the mock source and translate `ApplxOrderDto` to the domain
- [ ] [Owner] **EX-14** Idempotent order import (same external order twice → one order)
- [ ] [Owner] **EX-15** Failed synchronization: retry with backoff, record failures, make them observable
- [ ] [Owner] **EX-16** Trip lifecycle: allowed status transitions, invalid transitions rejected and tested
- [ ] [Owner] **EX-17** Orders and Trips pages

## Phase 3 — Telemetry

- [ ] [Agent] Device simulator baseline (vehicle count, interval, GPS path)
- [ ] [Agent] Telemetry ingestion endpoint → `telemetry.received` topic (message contract draft)
- [ ] [Owner] **EX-18** Choose the partition key and consumer group; write it in an ADR
- [ ] [Owner] **EX-19** Validate telemetry (invalid coordinates, future timestamps, malformed payload)
- [ ] [Owner] **EX-20** Consumer that derives `VehicleState` and stores it in Redis (key naming, TTL documented)
- [ ] [Owner] **EX-21** Telemetry deduplication — complete ADR-009
- [ ] [Owner] **EX-22** Out-of-order and stale events — complete ADR-008
- [ ] [Owner] **EX-23** Retry and dead-letter topic for failed messages
- [ ] [Owner] **EX-24** Online/offline detection for devices
- [ ] [Owner] **EX-25** Simulator chaos modes: duplicate, delayed, invalid packets, disconnect/reconnect
- [ ] [Owner] **EX-26** Behavior when Redis is unavailable (what fails, what degrades, how it is observed)
- [ ] [Owner] **EX-27** Telemetry history: where it is stored and for how long — write the trade-offs

## Phase 4 — Real-time Fleet

- [ ] [Agent] SignalR hub baseline and Fleet Map page skeleton
- [ ] [Owner] **EX-28** Push vehicle state changes to the UI (no per-vehicle polling)
- [ ] [Owner] **EX-29** Fleet summary counters (online / moving / idle / offline) and selected vehicle panel
- [ ] [Owner] **EX-30** SignalR fan-out optimization (throttling, batching, groups) — measure before and after
- [ ] [Owner] **EX-31** Device health page

## Phase 5 — Dispatch

- [ ] [Agent] Dispatch module skeleton and recommendation API contract
- [ ] [Owner] **EX-32** Candidate generation and constraint filtering (capacity, availability, device online, trip conflict)
- [ ] [Owner] **EX-33** Deterministic, explainable scoring — complete ADR-010
- [ ] [Owner] **EX-34** Dispatcher approval flow
- [ ] [Owner] **EX-35** Manual override with mandatory audit record (who, previous, selected, reason, when)
- [ ] [Owner] **EX-36** Duplicate dispatch command (idempotency key)
- [ ] [Owner] **EX-37** Concurrent dispatch of the same vehicle (only one wins, tested)
- [ ] [Owner] **EX-38** Dispatch Board page and Audit Log page

## Phase 6 — Analytics

- [ ] [Owner] **EX-39** Decide the analytical store (ClickHouse or not yet) — ADR with measurements
- [ ] [Owner] **EX-40** KPIs: fleet utilization, idle time, on-time delivery rate, manual override rate
- [ ] [Owner] **EX-41** Operational dashboard

## Phase 7 — AI Assistant

- [ ] [Agent] AI assistant skeleton with one read-only tool (`getVehicleStatus`) and permission `AI.assistant.use`
- [ ] [Owner] **EX-42** Tools: `findAvailableVehicles`, `getTrip`, `getDelayedTrips`
- [ ] [Owner] **EX-43** `explainDispatchRecommendation` using real scoring data
- [ ] [Owner] **EX-44** Guardrails: no direct DB access, no invented decisions, tests with adversarial prompts

## Phase 8 — Production

- [ ] [Owner] **EX-45** Production Dockerfiles for API and frontend
- [ ] [Owner] **EX-46** CI builds and pushes images
- [ ] [Owner] **EX-47** Deploy to Azure; secrets in Key Vault, none in source control
- [ ] [Owner] **EX-48** OpenTelemetry tracing: Order → Trip → Dispatch → Device → Telemetry
- [ ] [Owner] **EX-49** Rate limiting and security review
- [ ] [Owner] **EX-50** Load test 1,000 then 10,000 vehicles — measure, find the bottleneck, fix one thing
- [ ] [Owner] **EX-51** Failure testing: kill Kafka, Redis, a worker; document what happened
- [ ] [Owner] **EX-52** `docs/operations.md`: incident debugging runbook

---

## Final goal

- [ ] Explain the whole system and its trade-offs in English in 10 minutes, as in a Senior / Staff interview (§43)
