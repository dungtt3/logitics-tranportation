# ADR-007: No microservices initially

- Status: Accepted
- Date: 2026-10-06

## Context

Logistics platforms are often described as microservice systems, and the telemetry path has very
different load characteristics from the CRUD modules. It is tempting to start distributed.

## Decision

Do **not** split into independently deployed services in the initial phases. Start with the
modular monolith ([ADR-001](0001-modular-monolith.md)); background workers may run as separate
processes from the same codebase where load or isolation requires it.

A module is extracted into a service only when at least one of these is **measured**, not assumed:

- it needs to scale independently and the monolith cannot (for example telemetry processing throughput),
- it needs a different deployment cadence or availability target,
- a separate team owns it.

## Alternatives

- **Microservices from the start**: independent scaling and deployment, but network calls,
  distributed transactions, versioned contracts, per-service CI/CD and observability — all before
  the domain boundaries are known.

## Trade-offs

- Gain: speed of change, simple debugging, local transactions, one pipeline.
- Give up: independent scaling and failure isolation of modules (partly recovered by running
  workers as separate processes).

## Consequences

- Boundaries must be real (module-owned tables, interfaces, events) so that extraction stays possible.
- Telemetry processing is the most likely first candidate for extraction; design it with that in mind.
- Being able to explain *why not* microservices is an explicit interview goal of this project.
