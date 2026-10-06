# ADR-003: Redis for current vehicle state

- Status: Accepted
- Date: 2026-10-06

## Context

Dispatchers need the **current** state of every vehicle (position, speed, online/offline, current
trip) with low latency. At the stress target of 10,000 vehicles × 1 message / 10 s, that is about
1,000 state updates per second. Writing each update to PostgreSQL would turn the transactional
database into a hot write path for data that is overwritten seconds later.

## Decision

Store derived **`VehicleState` in Redis**, one entry per vehicle, written by the telemetry processor
and read by the API and SignalR. Redis is **not** a source of truth: `VehicleState` must be
rebuildable from telemetry, and business data stays in PostgreSQL.

Key naming, TTL and invalidation will be documented when the processor is built (EX-20), following
the convention `<module>:<entity>:<id>`, for example `telemetry:vehicle-state:{vehicleId}`.

## Alternatives

- **PostgreSQL table with upserts**: one store to operate, but high write amplification (MVCC,
  WAL, vacuum) for data that is constantly overwritten.
- **In-memory state in the API process**: fastest, but lost on restart and not shared across instances.
- **Read directly from Kafka on demand**: no extra store, but answering "where is vehicle X now" would require replaying a partition.

## Trade-offs

- Gain: sub-millisecond reads and writes, natural fit for "latest value per key", TTL, pub/sub if needed.
- Give up: another moving part; state can be lost or stale; no relational queries across vehicles.

## Consequences

- We must define behaviour when Redis is unavailable (EX-26): what the UI shows, whether ingestion continues.
- We must be able to rebuild state (replay recent telemetry) and show "last seen" so users can judge staleness.
- Redis persistence (AOF) is enabled locally to reduce cold starts, but correctness must not depend on it.
