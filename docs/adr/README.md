# Architecture Decision Records

An ADR records one significant decision: the context, what we chose, what we rejected, and what it
costs us. ADRs are immutable once accepted; to change a decision, write a new ADR that supersedes the old one.

| # | Title | Status |
|---|---|---|
| [001](0001-modular-monolith.md) | Modular monolith | Accepted |
| [002](0002-postgresql.md) | PostgreSQL as the transactional database | Accepted |
| [003](0003-redis-current-vehicle-state.md) | Redis for current vehicle state | Accepted |
| [004](0004-kafka.md) | Kafka for event-driven processing | Accepted |
| [005](0005-signalr.md) | SignalR for real-time updates | Accepted |
| [006](0006-react-typescript.md) | React + TypeScript frontend | Accepted |
| [007](0007-no-microservices-initially.md) | No microservices initially | Accepted |
| [008](0008-telemetry-ordering.md) | Telemetry ordering strategy | Proposed — decided in EX-22 |
| [009](0009-idempotency.md) | Idempotency strategy | Proposed — decided in EX-14, EX-21, EX-36 |
| [010](0010-dispatch-scoring.md) | Dispatch scoring design | Proposed — decided in EX-33 |

## Statuses

`Proposed` → `Accepted` → (`Deprecated` | `Superseded by ADR-xxx`)

## Template

```markdown
# ADR-XXX: Title

- Status: Proposed | Accepted | Superseded by ADR-YYY
- Date: YYYY-MM-DD

## Context
What problem or force makes a decision necessary? What constraints apply?

## Decision
What we chose, stated so that someone can check whether the code follows it.

## Alternatives
Options considered and why they were not chosen.

## Trade-offs
What we gain and what we give up.

## Consequences
What becomes easier, what becomes harder, what we must now do or watch.
```
