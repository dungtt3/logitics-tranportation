# ADR-010: Dispatch scoring design

- Status: **Proposed** — to be decided by the owner in EX-32 and EX-33
- Date: 2026-10-06

## Context

For each trip, dispatchers need a ranked list of suitable vehicles. Recommendations must be
**deterministic** (same inputs → same ranking) and **explainable** ("why this vehicle?"), because
dispatchers can override them and every override is audited. No LLM is involved in the decision.

Flow:

```
Order → candidate vehicles → constraint filtering → scoring → recommendation → dispatcher approval → dispatch
```

## Decision

*Not decided yet.* The owner designs and documents the model in EX-32/EX-33.

## Inputs to consider

Hard constraints (filter out): vehicle active and available, sufficient capacity, driver available,
device online, no trip conflict, can meet the delivery deadline.

Soft factors (score): proximity to pickup, availability, capacity fit, route compatibility, SLA suitability.

## Questions the decision must answer

1. Which factors are hard constraints and which are scored?
2. How is each factor normalised to a common scale? What are the weights, and where are they configured?
3. How are ties broken deterministically?
4. How is "proximity" computed before a routing engine exists (straight-line distance? with what correction?)
5. What does the explanation contain, so a dispatcher (or the AI assistant later) can show it?
6. What is stored with each recommendation so an override can later be compared with it?
7. Which business KPI tells us the scoring works (acceptance rate, manual override rate, on-time rate)?

## Alternatives to evaluate

- Weighted linear sum of normalised factors.
- Lexicographic ordering (sort by factor 1, then factor 2, …).
- Optimisation over all open trips at once (assignment problem) — likely a later phase.

## Trade-offs and consequences

*To be completed with the decision.*
