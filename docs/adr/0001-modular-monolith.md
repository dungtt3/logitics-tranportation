# ADR-001: Modular monolith

- Status: Accepted
- Date: 2026-10-06

## Context

The platform has many business areas (fleet, devices, orders, trips, dispatch, telemetry, identity)
that will grow at different speeds. The team is one engineer. Requirements are still being
discovered, so module boundaries will move. We need clear boundaries without paying the
operational cost of distribution.

## Decision

Build a **modular monolith**:

- One API host and one PostgreSQL database, deployed as one unit (background workers may run as
  separate processes from the same codebase).
- Four layer projects: `Domain`, `Application`, `Infrastructure`, `Api`, with one-way dependencies
  enforced by architecture tests.
- Business modules are **folders/namespaces inside each layer** (`Domain/Fleet`, `Application/Fleet`, …).
- Each module owns its tables; other modules use its public application interface or its events.

## Alternatives

- **Project per module** (`Fleet.Domain`, `Fleet.Application`, …): stronger compile-time isolation,
  but 4 × 11 projects for an early-stage codebase, slower builds, and boundaries that are expensive
  to move while we are still learning the domain.
- **Classic layered monolith without modules**: simplest, but business areas leak into each other
  and nothing guides a future split.
- **Microservices from day one**: see [ADR-007](0007-no-microservices-initially.md).

## Trade-offs

- Gain: one build, one deployment, in-process calls, transactions across a module's tables, cheap refactoring.
- Give up: compile-time module isolation — a developer *can* reference another module's internals;
  only architecture tests and review prevent it.

## Consequences

- Add architecture tests for module isolation as soon as a second module exists.
- If one module's boundary is stable and leaks keep happening, promote it to its own project.
- Extraction into a service becomes possible later because modules already communicate through
  interfaces and events rather than shared tables.
