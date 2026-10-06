# ADR-004: Kafka for event-driven processing

- Status: Accepted
- Date: 2026-10-06

## Context

Telemetry arrives continuously from unreliable devices, potentially ~1,000 messages/second.
Ingestion must not block on processing, processing must survive worker crashes and restarts, and
several consumers (state projection, history, alerts) need the same stream. External integration
(APPLX) also produces events that several modules care about.

## Decision

Use **Apache Kafka** (KRaft mode, no ZooKeeper) as the event backbone for telemetry and
integration events. The ingestion endpoint validates minimally and publishes; processors consume in
consumer groups and commit offsets after successful processing.

Initial topics: `telemetry.received`, `vehicle.state.changed`, `order.imported`, `trip.created`,
`trip.dispatched`. Topics are created explicitly (auto-creation disabled). For each topic we will
document contract, partition key, consumer group, retry and dead-letter strategy, and idempotency.

## Alternatives

- **RabbitMQ / Azure Service Bus**: simpler queue semantics and per-message acknowledgement, but no
  durable replayable log; adding consumers later or rebuilding state from history is harder.
- **PostgreSQL outbox + polling only**: no new infrastructure, but does not scale to the telemetry
  stream and offers no partitioned parallelism.
- **Azure Event Hubs**: Kafka-compatible managed option; a candidate for the cloud deployment, but
  we want a local, inspectable broker for learning.

## Trade-offs

- Gain: durable, replayable log; ordering per partition; horizontal consumer scaling; decoupled producers and consumers.
- Give up: operational complexity, at-least-once delivery (duplicates are normal), ordering only within a partition.

## Consequences

- Consumers must be idempotent ([ADR-009](0009-idempotency.md)) and tolerate out-of-order data across partitions ([ADR-008](0008-telemetry-ordering.md)).
- The choice of partition key is a design decision per topic (EX-18).
- Database writes and Kafka publishes are not atomic; where both must happen, use an outbox pattern rather than hoping both succeed.
- In Azure, evaluate Event Hubs (Kafka endpoint) versus a self-managed or Confluent cluster.
