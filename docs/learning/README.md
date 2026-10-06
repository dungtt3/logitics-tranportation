# Learning Roadmap

This repository is a training environment for international remote Full-stack .NET / Product
Engineer roles. The aim is not to write the most code but to learn the most engineering: making
decisions, implementing them by hand, breaking them, and explaining them in English.

## Files in this folder

| File | Purpose |
|---|---|
| [`progress.md`](progress.md) | Session log and current status — read first every session |
| [`checklist.md`](checklist.md) | Every task in order, with the per-exercise working loop |
| `<module>/concept.md` | Concepts behind a module (created when the module is built) |
| `<module>/exercises.md` | Practice exercises for the module |
| `<module>/interview-questions.md` | Questions to answer out loud |
| `<module>/production-failures.md` | Realistic incidents and how to diagnose them |

Exercise task files live in [`../backlog/`](../backlog/README.md).

## Skills by phase

| Phase | Main skills trained | Key exercises |
|---|---|---|
| 0 Foundation | Solution structure, health checks, configuration and secrets, structured logging, CI | EX-01 – EX-03 |
| 1 Identity + Fleet | REST API design, EF Core, migrations, validation, indexing, optimistic concurrency, JWT + refresh tokens, permission-based authorization, React forms and tables | EX-04 – EX-11 |
| 2 Logistics domain | Domain modelling, state machines, integration boundaries (anti-corruption layer), idempotent import, retry | EX-12 – EX-17 |
| 3 Telemetry | Kafka producers/consumers, partitioning, at-least-once delivery, deduplication, event time vs processing time, dead-letter queues, Redis, degradation when dependencies fail | EX-18 – EX-27 |
| 4 Real-time fleet | SignalR, fan-out, throttling and batching, map rendering performance | EX-28 – EX-31 |
| 5 Dispatch | Constraint filtering, deterministic explainable scoring, concurrency, idempotent commands, audit trails | EX-32 – EX-38 |
| 6 Analytics | Analytical vs transactional stores, KPIs, time-series queries | EX-39 – EX-41 |
| 7 AI assistant | LLM tool calling over real application services, guardrails, permissions | EX-42 – EX-44 |
| 8 Production | Docker images, Azure deployment, secrets, OpenTelemetry, load testing, failure testing, incident runbooks | EX-45 – EX-52 |

## How to work an exercise

1. Ask the agent for the task file if it does not exist yet (`docs/backlog/EX-xx-*.md`).
2. Read the context it lists before writing code.
3. Implement it yourself on `feature/EX-xx-<short-name>`. Ask for hints, not solutions.
4. Ask the agent to **review** and then to **test** (try to break) your work.
5. Fix, open a PR in English, get CI green, merge.
6. Answer the interview questions out loud in English; note weak answers in `progress.md`.

## Rules for the agent

- Do not implement an owner exercise unless the owner explicitly asks for the solution.
- When reviewing, explain what is wrong and why; do not rewrite everything.
- Evaluate correctness, maintainability, architecture, security, performance, testability,
  observability and failure handling.
