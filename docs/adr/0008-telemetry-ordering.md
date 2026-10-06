# ADR-008: Telemetry ordering strategy

- Status: **Proposed** — to be decided by the owner in EX-22
- Date: 2026-10-06

## Context

Devices send telemetry over unreliable mobile networks. Events can arrive late, out of order, or
after a device reconnects with a buffered batch. Example:

```
Event A  eventTime 10:01:05  arrives first
Event B  eventTime 10:01:03  arrives second
```

If `VehicleState` is blindly overwritten by the last *arrived* event, the map shows the vehicle
jumping backwards and "last seen" becomes wrong. Kafka only guarantees order within a partition,
and only in the order the producer sent, which is not necessarily event-time order.

## Decision

*Not decided yet.* The owner writes this section after implementing EX-22. It must state an
explicit, testable policy.

## Questions the decision must answer

1. Which timestamp orders events for `VehicleState`: event time, received time, or both?
2. What happens to an event older than the current state — dropped, stored for history only, or merged?
3. What if a device clock is wrong (far in the future or past)? What tolerance is accepted?
4. What is the partition key for `telemetry.received`, and what ordering does it give us? (EX-18)
5. How is the comparison made safe when two processors update the same vehicle concurrently?
6. Do history consumers (analytics) need different rules from the current-state projection?

## Alternatives to evaluate

- Last-arrived wins.
- Last-event-time wins (compare against the stored state's event time).
- Buffer/watermark: hold events for a short window and process in event-time order.
- Per-field rules (for example position by event time, `LastSeenAt` by received time).

## Trade-offs and consequences

*To be completed with the decision.* Must include the required tests (out-of-order, equal timestamps, future timestamps, duplicates).
