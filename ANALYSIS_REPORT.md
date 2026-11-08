# Analysis Report — Assignment #04

## Task 01: Repository structure and architecture

### Repository structure

The project is a Vite + React + TypeScript single-page application. All source
code lives under `src/`. There is no backend, database, login, or external API.

```
src/
├── App.tsx                          # Main UI: room finder + availability form + result + bookings list
├── main.tsx                         # React DOM entry point (StrictMode + createRoot)
├── index.css                        # Tailwind CSS directives (base, components, utilities)
├── vite-env.d.ts                    # Vite client type declarations
├── data/
│   └── campus.ts                    # Types (Room, Booking, EquipmentOption), seed rooms/bookings, EQUIPMENT_OPTIONS
└── lib/
    ├── time.ts                      # timeToMinutes, minutesToTime, nowHHMM, MINUTES_IN_DAY
    ├── validation.ts                # validateIntervalBounds, validateStartInFuture, validateMaxDuration,
    │                                #   validateRoomNotBlocked, validateNoOverlap, MAX_BOOKING_DURATION
    ├── availability.ts              # checkAvailability — composes validation rules into a Verdict
    ├── filtering.ts                 # filterByCapacity, filterByEquipment, excludeBlockedRooms, filterAvailableRooms
    ├── availability.test.ts         # 15 tests — AC1–AC6 composite + fixture immutability
    ├── validation.test.ts           # 14 tests — AC1–AC4 unit tests
    ├── filtering.test.ts            # 18 tests — F1–F4 filtering unit tests
    └── integration.test.ts          # 10 tests — F5, duration/overlap boundaries, pipeline
```

### Architecture

The application follows a **layered pure-function architecture**:

1. **Data layer** (`src/data/campus.ts`) — defines types and holds fictional
   seed data. No logic; only types and constants.
2. **Logic layer** (`src/lib/`) — pure functions with no side effects:
   - `time.ts` — time conversion utilities.
   - `validation.ts` — individual validation rules (AC1–AC4).
   - `availability.ts` — composes validation rules into a `Verdict`.
   - `filtering.ts` — filters rooms by capacity, equipment, and blocked status.
3. **Presentation layer** (`src/App.tsx`) — a single React component that
   manages UI state and calls the logic-layer functions.

Dependencies flow strictly downward: `App.tsx` → `availability.ts` /
`filtering.ts` → `validation.ts` / `time.ts` → `campus.ts` (types only). No
logic-layer module imports React or depends on the UI.

### Original acceptance criteria (AC1–AC6)

These criteria were defined before Assignment #04 and are preserved unchanged.

| Criterion | Description |
|---|---|
| AC1 | Interval must satisfy 0 ≤ start < end ≤ 1440 minutes, and start must be strictly after the current time. |
| AC2 | Bookings may not exceed 120 minutes. |
| AC3 | A blocked room must be rejected regardless of the time slot. |
| AC4 | Overlapping bookings must be rejected; bookings touching only at endpoints are allowed. |
| AC5 | A room must be selected before checking (null room → unavailable). |
| AC6 | When all rules pass, the verdict must be "available" and carry the room, start, and end. |

### Maintainability risks

1. **`src/App.tsx` is a single 430-line component** (after Task 02 additions)
   that handles room-finder state, form state, verdict rendering, and the
   bookings list. It violates the Single Responsibility Principle and is hard
   to unit-test. Splitting into `RoomFinder`, `AvailabilityForm`, `VerdictCard`,
   and `BookingsList` components would improve testability and readability.

2. **No UI/component tests exist.** All 57 tests run in the `node` environment
   against pure functions. There is no `@testing-library/react`, `jsdom`, or
   `happy-dom` setup. The `useEffect` that clears the verdict on room change
   (F5 behavior) is verified only through integration tests of the underlying
   `checkAvailability` function, not through an actual component render.

3. **No CI configuration.** There is no GitHub Actions workflow or similar CI
   pipeline. The four quality gates (`test`, `typecheck`, `lint`, `build`) must
   be run manually. A developer could merge code that fails one or more gates
   without detection.

### Prioritized improvement plan

| Priority | Improvement | Rationale |
|---|---|---|
| 1 | Add a CI workflow that runs `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` on every push | Prevents regressions from reaching the main branch; highest leverage, lowest effort |
| 2 | Split `App.tsx` into focused components (`RoomFinder`, `AvailabilityForm`, `VerdictCard`, `BookingsList`) | Reduces the 430-line monolith; enables component-level testing; improves readability |
| 3 | Add `@testing-library/react` + `jsdom` and write component tests for the room-finder and verdict-refresh behavior | Currently F5's UI behavior is inferred from logic tests, not verified by rendering |
| 4 | Install `@vitest/coverage-v8` and add a coverage threshold | Ensures new code stays tested; surfaces untested branches |

### AI suggestion that was rejected or modified

**Suggestion (Task 04):** The AI initially considered installing
`@testing-library/react` and `jsdom` to write a true UI rendering test for F5
(room-switch refreshing the verdict).

**Decision:** Rejected for this task. The assignment required "at least one
integration or UI behavior test" but also said "do not install new
dependencies without explaining why they are necessary." The existing Vitest
`node` environment was sufficient to write integration tests that exercise the
full `checkAvailability` pipeline with seed booking data, proving that
switching rooms produces different results based on each room's own bookings.
Installing `@testing-library/react` + `jsdom` would have been a larger change
better deferred to the CI/component-split improvement (priority 3 above). The
documentation explicitly states that no UI rendering test exists.

---

## Task 03: Architecture before and after refactoring

### Architecture before (baseline)

Before Assignment #04, the project had:

- `src/data/campus.ts` — `Room` (no `equipment` field), `Booking`, seed data
  (4 rooms, 4 bookings).
- `src/lib/time.ts` — time conversion utilities.
- `src/lib/validation.ts` — 5 validation functions (AC1–AC4) +
  `MAX_BOOKING_DURATION` constant.
- `src/lib/availability.ts` — `checkAvailability` composing the rules.
- `src/App.tsx` (319 lines) — a single component with a room dropdown, time
  inputs, a verdict panel, and a bookings list. No room-finder, no equipment
  filtering, no capacity filtering.
- Tests: 29 tests across 2 files (`validation.test.ts`, `availability.test.ts`),
  all in the `node` environment.

### Architecture after (current)

After Assignment #04 (Tasks 02 and 04):

- `src/data/campus.ts` — `Room` now has `equipment: string[]`; new
  `EquipmentOption` type and `EQUIPMENT_OPTIONS` constant; all 4 rooms have
  equipment data.
- `src/lib/filtering.ts` (new) — 4 pure filtering functions.
- `src/App.tsx` (430 lines) — added a "Find a room" panel (attendees input +
  equipment toggle chips + matching-room cards + empty state), equipment tags
  on selected-room detail, and a `useEffect` that clears the verdict when the
  selected room changes. Replaced the duplicated `MAX_DURATION` local constant
  with an import of `MAX_BOOKING_DURATION` from `validation.ts`.
- Tests: 57 tests across 4 files (added `filtering.test.ts` with 18 tests and
  `integration.test.ts` with 10 tests).

### Responsibilities of each module

| Module | Responsibility |
|---|---|
| `src/data/campus.ts` | Define `Room`, `Booking`, `EquipmentOption` types; hold seed data; export `EQUIPMENT_OPTIONS` for UI |
| `src/lib/time.ts` | Convert between `HH:MM` strings and minutes-since-midnight integers; provide current time |
| `src/lib/validation.ts` | Individual validation rules for AC1–AC4; export `MAX_BOOKING_DURATION` |
| `src/lib/availability.ts` | Compose validation rules into a `Verdict` (available/unavailable) |
| `src/lib/filtering.ts` | Filter rooms by capacity (≥), equipment (ALL), and blocked status; compose into `filterAvailableRooms` |
| `src/App.tsx` | Manage UI state; render room finder, availability form, verdict, and bookings list; call logic-layer functions |
| `src/main.tsx` | Mount the React app |

### Design decisions with justification

1. **Filtering logic separated into `src/lib/filtering.ts` rather than embedded
   in `App.tsx`.** This follows the existing pattern where logic lives in
   `src/lib/` and the UI only calls pure functions. It made the filtering
   functions independently unit-testable (18 tests in `filtering.test.ts`)
   without rendering React, and keeps `App.tsx` focused on presentation.

2. **`filterAvailableRooms` composes `filterByCapacity`, `filterByEquipment`,
   and `excludeBlockedRooms` rather than reimplementing all conditions in one
   function.** Each sub-filter is independently testable and reusable. The
   composition function provides a single call site for the UI. All functions
   use `.filter()` and return new arrays — inputs are never mutated, preserving
   the fixture-immutability requirement.

### Before/after quality comparison

| Metric | Before (baseline) | After (current) |
|---|---|---|
| Source files under `src/` | 10 | 12 (added `filtering.ts`, `filtering.test.ts`, `integration.test.ts`; `campus.ts` extended) |
| Total tests | 29 | 57 |
| Test files | 2 | 4 |
| `MAX_DURATION` duplication | Yes (`App.tsx` line 19 + `validation.ts` line 4) | No (consolidated — `App.tsx` imports `MAX_BOOKING_DURATION`) |
| Equipment field on `Room` | No | Yes (`equipment: string[]`) |
| Capacity filtering | No | Yes (`filterByCapacity`) |
| Equipment filtering | No | Yes (`filterByEquipment`) |
| Blocked-room exclusion in finder | No | Yes (`excludeBlockedRooms`) |
| Empty state when no rooms match | No | Yes (UI + tested via `filterAvailableRooms` F4 tests) |
| Verdict refresh on room change | No | Yes (`useEffect` on `roomCode`; F5 logic verified via integration tests) |
| Integration tests | 0 | 10 |
| UI/component tests | 0 | 0 (no change — explicitly not claimed) |
| Typecheck | PASS | PASS |
| Lint | PASS | PASS |
| Build | PASS (1572 modules) | PASS (1573 modules) |

### Remaining limitations

- **No UI/component tests.** The F5 room-switch behavior is verified through
  integration tests of `checkAvailability`, not by rendering the React
  component. The `useEffect` that clears the verdict is not directly tested.
- **`App.tsx` remains a single 430-line component.** Task 02 added the
  room-finder UI to the existing monolith rather than splitting it, to keep
  changes minimal as required.
- **No CI configuration.** Quality gates must be run manually.
- **No coverage reporting.** `@vitest/coverage-v8` is not installed.
- **All data is in-memory seed data.** No persistence across page reloads.
