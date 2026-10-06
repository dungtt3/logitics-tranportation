# Backlog

Each task or exercise is one Markdown file: `EX-xx-<short-name>.md` for owner exercises,
`T-xx-<short-name>.md` for agent/golden-path tasks when they need a written definition.
The full ordered list is in [`../learning/checklist.md`](../learning/checklist.md).

Task files describe the problem and how to judge a solution. **They never contain the solution.**

| ID | Title | Phase | Status |
|---|---|---|---|
| [EX-01](EX-01-postgresql-readiness-check.md) | PostgreSQL readiness check | 0 | Open |

## Task format

```markdown
# EX-xx: Title

- Phase: N
- Type: Owner exercise | Agent task
- Status: Open | In progress | In review | Done
- Branch: feature/EX-xx-<short-name>

## Problem
What is wrong or missing, from the user's or operator's point of view.

## Context
Where this fits in the system; relevant files, docs and ADRs.

## Goal
The outcome in one or two sentences.

## Constraints
Rules the solution must respect (architecture, security, no new dependency without reason, …).

## Acceptance Criteria
- [ ] Observable, testable statements.

## Technical Notes
Hints and things to investigate. No solution code.

## Learning Objectives
What the owner should understand after finishing.

## Interview Topics
Questions to answer out loud in English.

## Definition of Done
- [ ] Acceptance criteria met and proven by tests
- [ ] Build green with no warnings, all tests pass
- [ ] Docs/ADRs updated where behaviour or decisions changed
- [ ] Reviewed by the agent, findings addressed
- [ ] PR merged into `develop`, `progress.md` updated
```
