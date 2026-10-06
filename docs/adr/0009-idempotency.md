# ADR-009: Idempotency strategy

- Status: **Proposed** — to be decided by the owner in EX-14 (orders), EX-21 (telemetry), EX-36 (dispatch)
- Date: 2026-10-06

## Context

Every external input can be repeated:

- Kafka delivers **at least once**: a consumer that crashes before committing its offset sees messages again.
- Devices resend telemetry after reconnecting.
- APPLX can return the same order in several sync runs.
- A dispatcher (or the browser, or a retry policy) can submit the same dispatch command twice.

In all cases the resulting state must be the same as if the input had been processed once.

## Decision

*Not decided yet.* The owner fills this in per input type as the related exercises are completed.
The final ADR should contain one row per input:

| Input | Identity of "the same" message | Where duplicates are detected | What happens on a duplicate | Retention of dedup data |
|---|---|---|---|---|
| Telemetry event | ? | ? | ? | ? |
| APPLX order | ? | ? | ? | ? |
| Dispatch command | ? | ? | ? | ? |

## Questions the decision must answer

1. What identifies a duplicate: a producer-supplied ID, a natural key (`source + externalId`), or a content hash?
2. Where is it enforced: database unique constraint, processed-message table, Redis set with TTL, or idempotency-key header?
3. Is the check and the state change atomic? What if the process crashes between them?
4. For an API retry, does the second request return the original result or an error?
5. How long must deduplication data be kept, and what does it cost at 1,000 messages/second?

## Alternatives to evaluate

- Unique constraints + upsert (`INSERT … ON CONFLICT`).
- Inbox / processed-messages table written in the same transaction as the state change.
- Redis `SET NX` with TTL.
- `Idempotency-Key` HTTP header with stored responses.
- Naturally idempotent operations (set-to-value instead of increment).

## Trade-offs and consequences

*To be completed with the decision.*
