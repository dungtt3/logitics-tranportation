# Domain

This is the **initial** domain model. It is a starting proposal to be challenged as modules are
built; significant changes must be recorded in an ADR.

## Users

| User | Goal |
|---|---|
| Dispatcher | Assign the right vehicle and driver to each trip, react to delays |
| Fleet manager | Keep vehicles, drivers and devices available and healthy |
| Admin | Manage users, roles, permissions |
| Viewer | Read-only monitoring |

## Ubiquitous language

| Term | Meaning |
|---|---|
| **Vehicle** | A truck (tractor/rigid) that can carry containers or cargo. Identified by plate number. |
| **Driver** | A person licensed to drive vehicles. |
| **Device** | A black-box / GPS unit installed in a vehicle that sends telemetry. |
| **Container** | A shipping container moved by a trip. |
| **Order** | A customer request to move cargo from pickup to delivery within time constraints. Usually imported from APPLX. |
| **Trip** | The execution of (part of) an order by one vehicle and one driver. |
| **Dispatch** | The decision that assigns a vehicle and driver to a trip. |
| **Recommendation** | The system's ranked suggestion of vehicles for a trip, with an explanation. |
| **Override** | A dispatcher choosing a vehicle other than the top recommendation. Always audited. |
| **Telemetry event** | One message from a device: position, speed, heading, ignition at a point in time. |
| **Event time** | When the device says the event happened (`timestamp` in the payload). |
| **Received time** | When our system received the event. |
| **VehicleState** | Current derived view of a vehicle: last position, online/offline, current trip. |
| **APPLX** | External logistics system that is the source of orders and trips. Its real API is not available; we use a mock behind an integration boundary. |

## Events vs current state

The most important domain rule:

- A **telemetry event** such as `VehicleLocationReceived` is an **immutable fact**. It is stored as
  received and never edited.
- **VehicleState** is **derived** from those facts. It can be recomputed and is not the historical
  source of truth.

Consequences:

- Redis holds `VehicleState`; losing Redis must not lose history.
- Late or duplicate events must not corrupt `VehicleState`
  ([ADR-008](adr/0008-telemetry-ordering.md), [ADR-009](adr/0009-idempotency.md)).

## Modules

| Module | Owns | Phase |
|---|---|---|
| Identity | Users, roles, permissions, refresh tokens | 1 |
| Fleet | Vehicles | 1 |
| Driver | Drivers | 1 |
| Device | Devices, device ↔ vehicle assignment | 1 |
| Container | Containers | 2 |
| Order | Orders, external IDs, import status | 2 |
| Trip | Trips and their lifecycle | 2 |
| Telemetry | Telemetry ingestion and processing, `VehicleState` | 3 |
| Dispatch | Candidates, scoring, recommendations, dispatch decisions, overrides | 5 |
| Notifications | Alerts to users (delays, offline devices) | 4–5 |
| Audit | Append-only record of sensitive actions | 5 |

## Entities (initial)

### Vehicle

| Field | Notes |
|---|---|
| `Id` | |
| `PlateNumber` | Unique. Normalized (upper case, no spaces) before comparing. |
| `VehicleType` | For example Tractor, Rigid. |
| `Capacity` | Maximum payload in kg. Must be > 0. |
| `Status` | Operational status (see lifecycle). |
| `Active` | Inactive vehicles are kept for history but never dispatched. |
| `CreatedAt`, `UpdatedAt` | UTC. |

Vehicle status (proposal): `Available` → `OnTrip` → `Available`; `Available` ⇄ `Maintenance`;
any → `OutOfService`.

### Driver

`Id`, `Name`, `Phone`, `LicenseNumber` (unique), `Status` (`Available`, `OnTrip`, `OffDuty`), `Active`.

### Device

`Id`, `DeviceSerialNumber` (unique), `VehicleId` (nullable), `DeviceType`, `Status`, `LastSeenAt`.

Rules (proposal): a vehicle has at most one active device; a device is installed in at most one
vehicle at a time. `LastSeenAt` is updated from telemetry, not by users.

### Container

`Id`, `ContainerNumber` (unique, ISO 6346 format), `ContainerType`, `Size` (20/40/45 ft), `Weight`, `Status`.

### Order

`Id`, `ExternalId` (unique per source), `Customer`, `PickupLocation`, `DeliveryLocation`,
`PickupWindow` (start–end), `DeliveryDeadline`, `Weight`, `Status`.

Order status (proposal): `Imported` → `Planned` → `InTransit` → `Delivered`; `Imported`/`Planned` → `Cancelled`.

### Trip

`Id`, `OrderId`, `VehicleId`, `DriverId`, `Status`, `PlannedStartAt`, `PlannedArrivalAt`,
`ActualStartAt`, `ActualArrivalAt`.

Trip status (proposal): `Planned` → `Dispatched` → `InProgress` → `Completed`;
`Planned`/`Dispatched` → `Cancelled`.

Rules (proposal): a vehicle and a driver cannot be on two overlapping active trips; actual times
are set by state transitions, not edited freely.

### TelemetryEvent

`Id`, `DeviceId`, `VehicleId`, `EventTime`, `ReceivedAt`, `Latitude`, `Longitude`, `Speed`,
`Heading`, `Ignition`, `RawPayload`, `EventType`, `ProcessingStatus`.

Validation (proposal): latitude in [-90, 90], longitude in [-180, 180], speed ≥ 0, heading in [0, 360),
event time not unreasonably far in the future. Invalid events are kept and marked, not silently dropped.

## Example telemetry payload

```json
{
  "deviceId": "DEV-000001",
  "timestamp": "2026-10-06T08:00:00Z",
  "latitude": 20.8449,
  "longitude": 106.6881,
  "speed": 42.5,
  "heading": 90,
  "ignition": true
}
```

## Open questions

- Is a Trip always one Order, or can one trip carry several orders (consolidation)?
- Is `Capacity` enough, or do we need container slots (for example 1×40ft or 2×20ft)?
- Who owns `Driver` ↔ `Vehicle` pairing: fixed assignment or per trip?
- What counts as "offline" for a device — no telemetry for how long? (EX-24)
