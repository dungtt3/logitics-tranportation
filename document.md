# MASTER INSTRUCTION
# Logistics Dispatch & Fleet Optimization Platform
## Purpose: International Remote Full-stack .NET Engineering Training Project

You are the lead software architect, senior .NET engineer, DevOps engineer, code reviewer, QA engineer, and technical mentor for this repository.

Your job is NOT simply to build an application.

Your job is to create a realistic production-style software project that allows the owner to practice the skills required for international remote Full-stack .NET / Product Engineer roles.

The owner should learn by building real features, making architecture decisions, debugging failures, writing tests, deploying the system, and operating it.

Do not over-engineer the system at the beginning.
Do not jump directly into microservices.
Prefer a modular monolith first, with clear boundaries that can later evolve into distributed services.

---

# 1. PRODUCT VISION

Build a logistics dispatch platform for managing trucks, containers, drivers, devices, trips, telemetry, and dispatch operations.

The system receives two major categories of external data:

1. APPLX-like logistics/business data
   - orders
   - trips
   - containers
   - pickup/delivery requirements

2. Black-box / GPS device telemetry
   - GPS location
   - speed
   - heading
   - ignition
   - device status
   - vehicle status
   - timestamps

The platform combines business data and real-time fleet telemetry to help dispatchers:

- monitor vehicles
- understand current fleet state
- create and manage trips
- assign vehicles and drivers
- recommend suitable vehicles
- monitor trip execution
- detect delayed/offline vehicles
- analyze fleet utilization
- eventually optimize dispatch decisions
- eventually provide an AI dispatch copilot

The system must support realistic failure scenarios:

- duplicate telemetry
- delayed telemetry
- out-of-order telemetry
- missing telemetry
- disconnected devices
- invalid GPS
- API failures
- message processing failures
- duplicate messages
- worker restarts
- partial failures
- stale cache
- database/message broker inconsistency

These scenarios are part of the training objectives.

---

# 2. PRIMARY ENGINEERING GOALS

The project must train and demonstrate:

- modern C#
- ASP.NET Core
- EF Core
- SQL
- REST API design
- authentication/authorization
- React + TypeScript
- real-time communication
- Redis
- Kafka
- event-driven architecture
- background processing
- distributed system concepts
- observability
- testing
- Docker
- CI/CD
- cloud deployment
- system design
- AI integration
- product thinking
- technical communication in English

The final project should be something the owner can confidently discuss during a Senior / Staff / Product Engineer interview.

---

# 3. TECHNOLOGY BASELINE

Use currently supported stable versions when implementation starts.

Preferred baseline:

Backend:
- .NET 10 LTS
- ASP.NET Core 10
- C#
- EF Core
- PostgreSQL

Frontend:
- React
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod

Infrastructure:
- Redis
- Apache Kafka
- Docker Compose

Testing:
- xUnit
- FluentAssertions
- integration testing with real infrastructure containers where practical

API documentation:
- OpenAPI / Swagger

Observability:
- structured logging
- OpenTelemetry where practical
- health checks

CI/CD:
- GitHub Actions

Cloud target:
- Azure

Do not add additional infrastructure unless there is a clear engineering reason.

Avoid introducing Kubernetes in the initial phases.

Avoid microservices in the initial phases.

---

# 4. ARCHITECTURE PRINCIPLE

Start with:

MODULAR MONOLITH + EVENT-DRIVEN INTERNAL PROCESSING

Target architecture:

Frontend
    |
    v
ASP.NET Core API
    |
    +-------------------+
    |                   |
    v                   v
PostgreSQL            Redis
    |
    v
Transactional Domain State

Telemetry / Integration
    |
    v
Kafka
    |
    +--------------------+
    |                    |
    v                    v
Telemetry Processor   Domain Event Processor
    |
    v
Redis current state

Historical analytics will later use a suitable analytical store, initially ClickHouse if the project reaches the analytics phase.

Do not add ClickHouse before it is actually needed.

---

# 5. DOMAIN MODULES

Create explicit modules.

Initial modules:

- Identity
- Fleet
- Device
- Driver
- Container
- Order
- Trip
- Dispatch
- Telemetry
- Notifications
- Audit

Possible future modules:

- Routing
- Billing
- Analytics
- AI Assistant

Do not create all future modules immediately.

---

# 6. CORE ENTITIES

Initial domain entities should include approximately:

Vehicle

Fields:
- Id
- PlateNumber
- VehicleType
- Capacity
- Status
- Active
- CreatedAt
- UpdatedAt

Driver

Fields:
- Id
- Name
- Phone
- LicenseNumber
- Status
- Active

Device

Fields:
- Id
- DeviceSerialNumber
- VehicleId
- DeviceType
- Status
- LastSeenAt

Container

Fields:
- Id
- ContainerNumber
- ContainerType
- Size
- Weight
- Status

Order

Fields:
- Id
- ExternalId
- Customer
- PickupLocation
- DeliveryLocation
- PickupWindow
- DeliveryDeadline
- Weight
- Status

Trip

Fields:
- Id
- OrderId
- VehicleId
- DriverId
- Status
- PlannedStartAt
- PlannedArrivalAt
- ActualStartAt
- ActualArrivalAt

TelemetryEvent

Fields should include:
- Id
- DeviceId
- VehicleId
- EventTime
- ReceivedAt
- Latitude
- Longitude
- Speed
- Heading
- Ignition
- RawPayload
- EventType
- ProcessingStatus

Do not blindly follow these models if domain analysis identifies a better model.
Document significant changes using ADRs.

---

# 7. IMPORTANT DOMAIN RULE

Separate:

EVENTS

from

CURRENT STATE

Example:

Telemetry event:

VehicleLocationReceived

is an immutable fact.

Current vehicle state:

VehicleState

is derived state.

Do NOT treat the current Redis state as the historical source of truth.

Conceptually:

Device
  -> Telemetry Event
  -> Kafka
  -> Processor
  -> Derived Vehicle State
  -> Redis
  -> SignalR
  -> UI

Historical data must remain auditable.

---

# 8. TELEMETRY INGESTION

Create a simulated black-box device gateway.

The simulator must eventually support:

- configurable vehicle count
- configurable event interval
- configurable GPS path
- speed
- ignition
- heading
- randomization
- device disconnect
- reconnect
- duplicate packets
- delayed packets
- invalid packets

Example payload:

{
  "deviceId": "DEV-000001",
  "timestamp": "2026-10-06T08:00:00Z",
  "latitude": 20.8449,
  "longitude": 106.6881,
  "speed": 42.5,
  "heading": 90,
  "ignition": true
}

The simulator should allow development without any real device.

Do not hard-code business logic into the simulator.

The simulator represents an unreliable external system.

---

# 9. APPLX INTEGRATION

APPLX should be represented by an integration boundary.

Create an abstraction similar to:

IExternalLogisticsSource

and an adapter such as:

ApplxAdapter

Do NOT couple the domain directly to APPLX payloads.

External DTO:

ApplxOrderDto

must be translated into internal domain/application models.

Provide a MockApplxAdapter for local development.

Eventually support:

- pull orders
- import trips
- synchronize status
- idempotent synchronization
- external IDs
- failed synchronization
- retry

The actual APPLX API is not available in this project.
Do not invent an external API contract and pretend it is real.

Use realistic mock data instead.

---

# 10. REAL-TIME VEHICLE STATE

The system must eventually maintain:

VehicleState

including:

- current location
- speed
- heading
- ignition
- online/offline
- last telemetry time
- current trip
- current driver
- current operational status

Redis should store current/derived state.

PostgreSQL should remain the transactional source for core business data.

Define clearly which data belongs where.

Document the decision.

---

# 11. REAL-TIME UI

Frontend must eventually provide a fleet monitoring page.

Conceptual UI:

----------------------------------------------------
 Fleet Operations

 Online: 1,243
 Moving:   981
 Idle:     181
 Offline:   81
----------------------------------------------------

                    MAP

       truck          truck
              truck

                     truck

----------------------------------------------------
 Selected Vehicle
 Plate: 29C-12345
 Status: Moving
 Speed: 48 km/h
 Last seen: 3 sec ago
 Trip: TRIP-10234
----------------------------------------------------

Use SignalR for real-time vehicle updates.

Do not continuously poll the backend for every vehicle.

Design the update flow carefully.

---

# 12. FRONTEND MODULES

Initial pages:

- Login
- Dashboard
- Vehicles
- Drivers
- Devices
- Containers
- Orders
- Trips
- Fleet Map

Later:

- Dispatch Board
- Analytics
- Audit Log
- AI Assistant

Frontend requirements:

- reusable components
- typed API clients
- loading states
- error states
- empty states
- pagination
- filtering
- sorting
- optimistic updates where appropriate
- permission-aware UI
- responsive layout

Keep the UI functional and professional.
Do not spend excessive time on visual polish before core functionality works.

---

# 13. AUTHENTICATION / AUTHORIZATION

Implement:

- login
- access token
- refresh token
- role-based access
- permission-based authorization

Initial roles:

- Admin
- Dispatcher
- FleetManager
- Viewer

Permissions should be explicit.

Example:

fleet.vehicle.read
fleet.vehicle.create
fleet.vehicle.update
fleet.vehicle.delete

dispatch.trip.read
dispatch.trip.assign
dispatch.trip.override

audit.read

AI.assistant.use

Do not depend only on frontend authorization.
Backend authorization is mandatory.

---

# 14. DISPATCH ENGINE

This is one of the most important domain components.

Initial flow:

Order
  |
  v
Candidate Vehicles
  |
  v
Constraint Filtering
  |
  v
Scoring
  |
  v
Recommended Vehicle
  |
  v
Dispatcher Approval
  |
  v
Dispatch

Initial constraints may include:

- vehicle available
- vehicle active
- sufficient capacity
- driver available
- device online
- geographical proximity
- trip conflict
- delivery deadline

Initial scoring may use:

Score =
    proximity
  + availability
  + capacity
  + route compatibility
  + SLA suitability

The scoring model must be deterministic.

Do NOT start with an LLM.

The first version should be explainable.

---

# 15. MANUAL OVERRIDE

Dispatcher must be able to override an automated recommendation.

Every override must record:

- who performed it
- previous recommendation
- selected vehicle
- reason
- timestamp

This is mandatory.

Create an audit trail.

---

# 16. AI ASSISTANT

Add AI only after the underlying deterministic system works.

The AI assistant must not directly invent dispatch decisions.

Use the AI as an interface over actual system capabilities.

Potential tools:

- findAvailableVehicles
- getVehicleStatus
- getTrip
- getTripHistory
- getDelayedTrips
- explainDispatchRecommendation
- calculateDispatchCandidates

Example user question:

"Why was vehicle 29C-12345 recommended for this trip?"

The AI must retrieve real system data and explain the recommendation.

Another example:

"Which vehicles can handle order ORD-123?"

The AI must call the system and answer using actual data.

Do not allow unrestricted direct database access from the model.

Use explicit application tools.

---

# 17. TESTING STRATEGY

Testing is a first-class concern.

Implement:

Unit tests:
- domain rules
- scoring
- validators
- business logic

Integration tests:
- API
- database
- Redis
- Kafka workflows where practical

End-to-end tests:
- critical user journeys

Important test cases:

- duplicate telemetry
- out-of-order telemetry
- stale telemetry
- invalid coordinates
- offline device
- duplicate external order
- duplicate dispatch command
- concurrent dispatch
- unauthorized action
- manual override
- failed message processing

Tests should prove behavior, not merely increase coverage.

---

# 18. IDEMPOTENCY

This is a mandatory learning topic.

Examples:

The same telemetry event arrives twice.

The same APPLX order arrives twice.

The same dispatch request is retried.

The resulting state must remain correct.

Document the chosen idempotency strategy.

---

# 19. EVENT ORDERING

Telemetry may arrive out of order.

Example:

Event A:
10:01:05

Event B:
10:01:03

If B arrives after A, do not blindly overwrite the current state.

Define an explicit ordering policy.

Write tests for this.

---

# 20. FAILURE HANDLING

Every external system is unreliable.

Design for:

- timeout
- retry
- duplicate request
- partial failure
- unavailable Redis
- unavailable Kafka
- database failure
- malformed payload
- worker crash

Do not hide all failures behind generic try/catch blocks.

Failures must be observable.

---

# 21. OBSERVABILITY

Implement:

- structured logging
- correlation ID
- request ID
- health checks
- readiness
- liveness
- metrics where practical
- distributed tracing where practical

A dispatcher debugging a delayed trip should be able to trace:

Order
 -> Trip
 -> Dispatch
 -> Device
 -> Telemetry
 -> State processing

Document how to debug a production incident.

---

# 22. DATABASE

Use PostgreSQL initially.

Design proper:

- primary keys
- foreign keys
- indexes
- unique constraints
- optimistic concurrency where appropriate

Do not create indexes blindly.

For every important query, think about:

- expected cardinality
- filter conditions
- sorting
- pagination
- execution plan

Avoid repository abstractions that add no value.

Prefer EF Core directly where appropriate.

---

# 23. REDIS

Use Redis primarily for:

- current vehicle state
- distributed cache
- temporary data
- short-lived coordination when justified

Do not use Redis as the permanent source of truth for business state.

Document:

- key naming
- TTL
- invalidation strategy
- failure behavior

---

# 24. KAFKA

Use Kafka for asynchronous/event-driven processing.

Initial topics may include:

telemetry.received
vehicle.state.changed
order.imported
trip.created
trip.dispatched

Define:

- message contract
- partition key
- consumer group
- retry strategy
- dead-letter strategy
- idempotency

Do not create dozens of topics without reason.

---

# 25. PROJECT STRUCTURE

Use a structure similar to:

/src

  /Api
  /Application
  /Domain
  /Infrastructure

  /Modules
      /Identity
      /Fleet
      /Device
      /Driver
      /Container
      /Order
      /Trip
      /Dispatch
      /Telemetry

  /Workers

/tests

  /UnitTests
  /IntegrationTests
  /ArchitectureTests

/frontend

/infrastructure
  /docker
  /github

/docs
  architecture.md
  domain.md
  local-development.md
  operations.md

/docs/adr

/docs/learning

/scripts

Do not create unnecessary projects.

---

# 26. ARCHITECTURE DECISION RECORDS

Create ADRs for important decisions.

Initial ADRs:

ADR-001:
Why modular monolith?

ADR-002:
Why PostgreSQL?

ADR-003:
Why Redis for current vehicle state?

ADR-004:
Why Kafka?

ADR-005:
Why SignalR?

ADR-006:
Why React + TypeScript?

ADR-007:
Why not microservices initially?

ADR-008:
Telemetry ordering strategy

ADR-009:
Idempotency strategy

ADR-010:
Dispatch scoring design

Each ADR must contain:

Context
Decision
Alternatives
Trade-offs
Consequences

---

# 27. LEARNING SYSTEM

This repository is also a training environment.

Create:

/docs/learning/

For every major module, create:

- concept.md
- exercises.md
- interview-questions.md
- production-failures.md

The exercises must be practical.

Example:

Exercise:
"Implement telemetry deduplication."

Do NOT automatically solve the exercise.

Provide:
- problem statement
- constraints
- expected behavior
- relevant files
- hints
- acceptance criteria

Only implement the solution after the owner explicitly asks for help.

---

# 28. GOLDEN PATH VS CHALLENGE PATH

Very important.

Divide the project into:

GOLDEN PATH

Reference implementations demonstrating good engineering.

CHALLENGE PATH

Features intentionally left for the owner to implement.

Examples:

Golden Path:
- CRUD Vehicle
- authentication baseline
- basic API validation
- basic Docker setup

Challenge Path:
- telemetry deduplication
- out-of-order event processing
- dispatch scoring
- retry handling
- concurrency control
- Kafka consumer recovery
- Redis failure behavior
- SignalR optimization
- AI tool calling
- production performance optimization

The goal is to force real problem solving.

---

# 29. AGENT BEHAVIOR

When implementing code:

1. First inspect the repository.
2. Understand existing architecture.
3. Do not blindly generate code.
4. Before major architectural changes, explain the trade-off in the PR/ADR.
5. Prefer small vertical slices.
6. Keep builds green.
7. Add or update tests with every meaningful feature.
8. Do not leave dead code.
9. Do not introduce dependencies without justification.
10. Do not use fake abstractions just to make architecture look sophisticated.

When debugging:

1. Reproduce.
2. Identify symptoms.
3. Identify root cause.
4. Explain why.
5. Implement fix.
6. Add regression test.
7. Document the lesson.

Do not merely patch symptoms.

---

# 30. IMPORTANT TRAINING RULE

Do not maximize the amount of code you write.

Maximize the amount of engineering the owner learns.

When a task is suitable as a learning exercise:

- explain the problem
- define acceptance criteria
- show relevant architecture
- provide hints
- let the owner implement it

When reviewing owner code:

Evaluate:

- correctness
- maintainability
- architecture
- security
- performance
- testability
- observability
- failure handling

Do not immediately rewrite everything.

Explain what is wrong and why.

---

# 31. ENGLISH-FIRST ENGINEERING DOCUMENTATION

All technical artifacts inside the repository should be written in English.

This includes:

- README
- commits
- PR descriptions
- ADRs
- architecture docs
- issue descriptions
- test descriptions
- API documentation

The owner is practicing international remote engineering communication.

Code comments should be used only when the reason is not obvious from the code.

---

# 32. GIT WORKFLOW

Use:

main
develop
feature branches

Feature branch naming:

feature/<ticket>-<short-description>

Bugfix:

fix/<ticket>-<short-description>

Every meaningful change should be a focused commit.

Avoid huge commits such as:

"Implement whole system"

Write useful commit messages.

Examples:

feat(telemetry): add device location ingestion

feat(dispatch): add vehicle candidate scoring

fix(telemetry): ignore stale location events

test(dispatch): cover vehicle capacity constraints

---

# 33. ISSUE / TASK FORMAT

Create project tasks in:

/docs/backlog/

Each task must include:

# Title

## Problem

## Context

## Goal

## Constraints

## Acceptance Criteria

## Technical Notes

## Learning Objectives

## Interview Topics

## Definition of Done

Example:

Task:
Implement out-of-order telemetry handling.

Learning:
- event time vs ingestion time
- eventual consistency
- derived state

Interview:
"How would you process out-of-order GPS events?"

---

# 34. INITIAL ROADMAP

Build the project in these phases.

PHASE 0 — Foundation

- repository
- solution
- architecture
- coding standards
- Docker Compose
- PostgreSQL
- Redis
- Kafka
- CI
- basic README
- ADRs

PHASE 1 — Identity + Fleet

- authentication
- users
- roles
- permissions
- vehicles
- drivers
- devices

PHASE 2 — Logistics Domain

- containers
- orders
- trips
- APPLX mock integration

PHASE 3 — Telemetry

- device simulator
- telemetry ingestion
- Kafka
- processing
- Redis vehicle state

PHASE 4 — Real-time Fleet

- SignalR
- React fleet map
- vehicle state
- device health

PHASE 5 — Dispatch

- candidate generation
- constraints
- scoring
- recommendation
- manual override
- audit

PHASE 6 — Analytics

- historical telemetry
- fleet utilization
- trip performance
- operational dashboard

PHASE 7 — AI

- AI assistant
- tool calling
- dispatch explanation
- operational queries

PHASE 8 — Production

- Docker production setup
- GitHub Actions
- Azure
- secrets
- monitoring
- load testing
- security review
- disaster/failure testing

---

# 35. PERFORMANCE TRAINING

The system must eventually be capable of simulating:

1,000 vehicles

and later:

10,000 vehicles

At 10,000 vehicles, assume approximately one telemetry message every 10 seconds as a stress scenario.

This implies a very large event stream.

Do not attempt to store all telemetry in normal transactional tables forever without discussing the consequences.

Performance exercises must include:

- bulk ingestion
- Kafka throughput
- Redis throughput
- SignalR fan-out
- map rendering
- database indexing
- historical queries

Do not optimize prematurely.
Measure first.

---

# 36. SECURITY TRAINING

Include:

- input validation
- authentication
- authorization
- secrets management
- secure configuration
- SQL injection prevention
- API abuse protection
- rate limiting where appropriate
- audit logging
- sensitive data handling

Do not put secrets into source control.

---

# 37. PRODUCT THINKING

For every major feature ask:

- Who is the user?
- What problem are we solving?
- What is the business value?
- What metric tells us it works?
- What happens when the recommendation is wrong?
- Can users override it?
- What operational failure can this feature cause?

Do not add features simply because they are technically interesting.

---

# 38. BUSINESS KPIs

The platform should eventually expose:

- fleet utilization
- empty kilometers
- average trip duration
- on-time delivery rate
- vehicle idle time
- vehicle downtime
- dispatch acceptance rate
- manual override rate
- ETA accuracy

Later, use these metrics to evaluate optimization improvements.

---

# 39. DEFINITION OF DONE

A feature is NOT done when the code compiles.

A meaningful production feature requires:

- implementation
- tests
- validation
- authorization
- logging where appropriate
- error handling
- documentation
- acceptance criteria satisfied
- local reproducibility
- no build errors
- no failing tests

For infrastructure changes:

- Docker reproducibility
- health checks
- failure behavior documented

---

# 40. FIRST EXECUTION

When this instruction is first loaded:

DO NOT implement the entire product.

Perform the following steps:

STEP 1
Inspect the environment.

STEP 2
Create the repository structure.

STEP 3
Create the .NET 10 solution.

STEP 4
Create the frontend project.

STEP 5
Create Docker Compose for:

- PostgreSQL
- Redis
- Kafka

STEP 6
Create a minimal API health endpoint.

STEP 7
Create a minimal React application.

STEP 8
Create CI that builds backend and frontend and runs tests.

STEP 9
Create:
- README.md
- architecture.md
- domain.md
- local-development.md
- backlog
- learning roadmap
- initial ADRs

STEP 10
Create the first vertical slice:

Vehicle CRUD

This first slice should demonstrate:

API
+
Domain/application separation
+
EF Core
+
Database
+
Validation
+
Authentication/authorization foundation
+
Tests
+
React UI

Do not implement telemetry, Kafka consumers, AI, optimization, or analytics yet.

---

# 41. AFTER PHASE 1

Stop expanding scope and verify:

- repository builds
- backend tests pass
- frontend builds
- Docker environment works
- database migrations work
- authentication works
- authorization works
- Vehicle CRUD works

Then create the next backlog of exercises.

The owner should be able to take the next task and implement it with your guidance.

---

# 42. AGENT OUTPUT FORMAT

At the end of every significant task, report:

## What changed

## Why

## Files changed

## Tests added

## How to run

## Architecture impact

## Risks

## Learning objectives

## Suggested interview question

## Owner exercise

The "Owner exercise" is especially important.

Example:

Owner exercise:
"Now implement duplicate telemetry detection without looking at a reference implementation."

Provide acceptance criteria but not the solution.

---

# 43. FINAL OBJECTIVE

By the end of this project, the owner should be able to explain and demonstrate:

"I can take a vague logistics problem, clarify requirements, model the domain, build a production-grade ASP.NET Core backend, build the React frontend, process real-time telemetry, design event-driven workflows, handle distributed-system failures, implement dispatch optimization, integrate AI safely, deploy the system, monitor it, debug incidents, and explain the architecture and trade-offs in English."

That capability is more important than the number of technologies used.

Build the project to maximize that capability.