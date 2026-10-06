# ADR-002: PostgreSQL as the transactional database

- Status: Accepted
- Date: 2026-10-06

## Context

Core business data — vehicles, drivers, devices, orders, trips, dispatch decisions, audit — is
relational, needs strong consistency (no vehicle on two overlapping trips), unique constraints
(plate numbers, external order IDs) and concurrency control. The project targets Azure and must run
locally in Docker.

## Decision

Use **PostgreSQL** as the single source of truth for business data, accessed through **EF Core**
(Npgsql provider). Use database constraints (primary, foreign, unique keys) as the last line of
defence for invariants, and optimistic concurrency where concurrent edits are expected.

## Alternatives

- **SQL Server / Azure SQL**: excellent EF Core support, but licence cost outside Azure and a
  heavier local container; no capability we need that PostgreSQL lacks.
- **Document database (MongoDB, Cosmos DB)**: flexible schema, but our data is relational and
  cross-entity invariants would move into application code.
- **Event store as the source of truth**: powerful audit and replay, but a much larger learning and
  operational cost; we apply the event-vs-state idea only to telemetry for now.

## Trade-offs

- Gain: ACID transactions, rich constraints and indexes, mature tooling, free, first-class on Azure
  (Azure Database for PostgreSQL – Flexible Server), JSONB when we need semi-structured data
  (for example raw external payloads).
- Give up: not designed for unbounded high-frequency time series; telemetry history at 10,000
  vehicles must not live in ordinary tables forever.

## Consequences

- Schema changes go through EF Core migrations, applied reproducibly in CI and locally.
- Every important query is designed with its cardinality, filters, sort and pagination in mind; indexes are justified, not guessed.
- Telemetry history needs a separate decision in Phase 6 (partitioning, retention, or an analytical store).
