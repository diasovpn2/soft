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

### Architecture diagram — before (baseline)

```
┌─────────────────────────────────────────────────┐
│                  App.tsx (319 lines)             │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Room    │  │  Time    │  │    Verdict     │  │
│  │ dropdown │  │  inputs  │  │    panel       │  │
│  └────┬─────┘  └────┬─────┘  └────────┬───────┘  │
│       │              │                  │         │
└───────┼──────────────┼──────────────────┼────────┘
        │              │                  │
        ▼              ▼                  ▼
┌──────────────┐ ┌───────────┐ ┌──────────────────┐
│ availability │ │   time    │ │   validation     │
│     .ts      │ │   .ts     │ │      .ts         │
│  checkAvail  │ │  time↔min │ │  5 validators    │
└──────┬───────┘ └───────────┘ │  MAX_BOOKING_DUR │
       │                      └────────┬─────────┘
       ▼                               │
┌──────────────┐                       │
│  campus.ts   │◄──────────────────────┘
│  Room, Booking│
│  seed data    │
└──────────────┘

Tests: 29 (2 files, node env, no UI tests)
```

### Architecture diagram — after (current)

```
┌──────────────────────────────────────────────────────────────┐
│                   App.tsx (493 lines)                        │
│  ┌────────────┐  ┌─────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Room      │  │  Time   │  │ Verdict  │  │  Bookings  │  │
│  │  Finder    │  │ inputs  │  │  panel   │  │    list    │  │
│  │ (attendees,│  └────┬────┘  └────┬─────┘  └─────┬──────┘  │
│  │ equipment, │       │            │              │          │
│  │  cards)    │       │            │              │          │
│  └─────┬──────┘       │            │              │          │
│        │              │            │              │          │
└────────┼──────────────┼────────────┼──────────────┼──────────┘
         │              │            │              │
         ▼              ▼            ▼              ▼
┌──────────────┐ ┌───────────┐ ┌──────────────┐ ┌───────────┐
│  filtering   │ │   time    │ │ availability │ │  campus   │
│    .ts       │ │   .ts     │ │     .ts      │ │  .ts      │
│ filterByCap  │ │  time↔min │ │  checkAvail  │ │ Room,     │
│ filterByEquip│ └───────────┘ └──────┬───────┘ │ Booking,  │
│ excludeBlock│                      │          │ Equipment │
│ filterAvail │                      ▼          │ seed data │
└──────┬───────┘               ┌──────────────┐ └─────┬─────┘
       │                       │ validation   │       │
       └──────────────────────►│    .ts       │◄──────┘
                               │ 5 validators │
                               │ MAX_BOOKING  │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │  campus.ts   │
                               └──────────────┘

Tests: 57 (4 files, node env, no UI tests)
New: filtering.ts, filtering.test.ts, integration.test.ts
```

### Repository map

**Counting method:** All files under `src/` with extensions `.ts`, `.tsx`, or
`.css`, including test files. Config and documentation files in the project
root are listed separately. Excludes `node_modules/` and `dist/`.

**Source and test files under `src/` (13 files, 1317 lines):**

| File | Lines | Type | Purpose |
|---|---|---|---|
| `src/App.tsx` | 493 | Source | Main UI: room finder, availability form, verdict, bookings list |
| `src/main.tsx` | 10 | Source | React DOM entry point |
| `src/index.css` | 3 | Source | Tailwind CSS directives |
| `src/vite-env.d.ts` | 1 | Source | Vite client type declarations |
| `src/data/campus.ts` | 103 | Source | Room, Booking, EquipmentOption types; seed data; EQUIPMENT_OPTIONS |
| `src/lib/time.ts` | 24 | Source | timeToMinutes, minutesToTime, nowHHMM, MINUTES_IN_DAY |
| `src/lib/validation.ts` | 62 | Source | 5 validation functions (AC1–AC4), MAX_BOOKING_DURATION |
| `src/lib/availability.ts` | 37 | Source | checkAvailability — composes validation into Verdict |
| `src/lib/filtering.ts` | 33 | Source | filterByCapacity, filterByEquipment, excludeBlockedRooms, filterAvailableRooms |
| `src/lib/validation.test.ts` | 121 | Test | 14 tests — AC1–AC4 validation unit tests |
| `src/lib/availability.test.ts` | 126 | Test | 15 tests — AC1–AC6 composite + fixture immutability |
| `src/lib/filtering.test.ts` | 191 | Test | 18 tests — F1–F4 filtering unit tests |
| `src/lib/integration.test.ts` | 113 | Test | 10 tests — F5, duration/overlap boundaries, pipeline |

**Config and documentation files in project root (12 files):**

| File | Purpose |
|---|---|
| `package.json` | Dependencies and npm scripts |
| `package-lock.json` | Locked dependency versions |
| `vite.config.ts` | Vite build config with `@` alias |
| `vitest.config.ts` | Vitest config (node env, `src/**/*.test.ts`) |
| `tsconfig.json` | TypeScript project root config |
| `tsconfig.app.json` | TypeScript app config |
| `tsconfig.node.json` | TypeScript node config |
| `eslint.config.js` | ESLint flat config |
| `postcss.config.js` | PostCSS config for Tailwind |
| `tailwind.config.js` | Tailwind CSS config |
| `index.html` | HTML entry point |
| `.gitignore` | Git ignore rules |

**Documentation files (5 files):**

| File | Purpose |
|---|---|
| `BASELINE.md` | Pre-assignment baseline metrics |
| `README.md` | Project documentation |
| `ANALYSIS_REPORT.md` | Task 01 and Task 03 analysis |
| `AI_EVIDENCE.md` | AI usage evidence and reflection |
| `TEST_RESULTS.txt` | Real terminal output from test/typecheck/lint/build |

### Original acceptance criteria (AC1–AC6)

No original assignment specification document is present in the repository.
The AC1–AC6 descriptions below are derived from the test assertions and code
comments in `src/lib/availability.test.ts` and `src/lib/validation.test.ts`,
which were written before Assignment #04 and are preserved unchanged. If the
original assignment text differs from these interpretations, the original text
takes precedence.

| Criterion | Description (derived from existing test code) |
|---|---|
| AC1 | Interval must satisfy 0 ≤ start < end ≤ 1440 minutes, and the proposed start must be strictly after the current time. |
| AC2 | Bookings may not exceed 120 minutes. |
| AC3 | A blocked room must be rejected regardless of the time slot. |
| AC4 | Overlapping bookings must be rejected; bookings touching only at endpoints are allowed. |
| AC5 | A room must be selected before checking (null room → unavailable). |
| AC6 | When all rules pass, the verdict must be "available" and carry the room, start, and end. |

### Maintainability risks

1. **`src/App.tsx` is a single 493-line component** (verified by `wc -l`) that
   handles room-finder state, form state, verdict rendering, and the bookings
   list. It violates the Single Responsibility Principle and is hard to
   unit-test. Splitting into `RoomFinder`, `AvailabilityForm`, `VerdictCard`,
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
| 2 | Split `App.tsx` into focused components (`RoomFinder`, `AvailabilityForm`, `VerdictCard`, `BookingsList`) | Reduces the 493-line monolith; enables component-level testing; improves readability |
| 3 | Add `@testing-library/react` + `jsdom` and write component tests for the room-finder and verdict-refresh behavior | Currently F5's UI behavior is inferred from logic tests, not verified by rendering |
| 4 | Install `@vitest/coverage-v8` and add a coverage threshold | Ensures new code stays tested; surfaces untested branches |

### AI suggestion that was rejected or modified

During Task 04, a decision was made not to install `@testing-library/react`
and `jsdom` to write a UI rendering test for F5. The assignment required "at
least one integration or UI behavior test" and also said "do not install new
dependencies without explaining why they are necessary." The existing Vitest
`node` environment was sufficient for integration tests that exercise the full
`checkAvailability` pipeline, proving that switching rooms produces different
results based on each room's own bookings. Adding `@testing-library/react` +
`jsdom` was deferred to the improvement plan (priority 3 above). This is a
constraint-driven decision, not a rejected AI proposal — no AI-suggested
alternative was overturned during implementation.

---

## Task 03: Architecture before and after refactoring

### What was completed

Assignment #04 completed the **separation of filtering logic** from the UI.
A new module `src/lib/filtering.ts` was created with four pure functions
(`filterByCapacity`, `filterByEquipment`, `excludeBlockedRooms`,
`filterAvailableRooms`) that are independently unit-tested (18 tests in
`filtering.test.ts`). This follows the existing architecture pattern where
all logic lives in `src/lib/` as pure functions and the UI only calls them.

### What was not completed

The **UI component refactoring** of `src/App.tsx` was not done. Task 02 added
the room-finder UI (attendees input, equipment toggle chips, matching-room
cards, empty state) and the verdict-refresh `useEffect` to the existing
single component rather than splitting it into sub-components. This was a
deliberate choice to keep changes minimal as required by the assignment, but
`App.tsx` remains a 493-line monolith. This is listed as a remaining
limitation and as priority 2 in the improvement plan.

### Architecture before (baseline)

Before Assignment #04, the project had:

- `src/data/campus.ts` — `Room` (no `equipment` field), `Booking`, seed data
  (4 rooms, 4 bookings).
- `src/lib/time.ts` — time conversion utilities.
- `src/lib/validation.ts` — 5 validation functions (AC1–AC4) +
  `MAX_BOOKING_DURATION` constant.
- `src/lib/availability.ts` — `checkAvailability` composing the rules.
- `src/App.tsx` (319 lines per `BASELINE.md`) — a single component with a room
  dropdown, time inputs, a verdict panel, and a bookings list. No room-finder,
  no equipment filtering, no capacity filtering.
- Tests: 29 tests across 2 files (`validation.test.ts`, `availability.test.ts`),
  all in the `node` environment.

### Architecture after (current)

After Assignment #04 (Tasks 02 and 04):

- `src/data/campus.ts` — `Room` now has `equipment: string[]`; new
  `EquipmentOption` type and `EQUIPMENT_OPTIONS` constant; all 4 rooms have
  equipment data.
- `src/lib/filtering.ts` (new) — 4 pure filtering functions.
- `src/App.tsx` (493 lines, verified by `wc -l`) — added a "Find a room" panel
  (attendees input + equipment toggle chips + matching-room cards + empty
  state), equipment tags on selected-room detail, and a `useEffect` that clears
  the verdict when the selected room changes. Replaced the duplicated
  `MAX_DURATION` local constant with an import of `MAX_BOOKING_DURATION` from
  `validation.ts`.
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

**Counting method:** All `.ts`, `.tsx`, and `.css` files under `src/`,
including test files. Counts verified by `find /home/project/src -type f`
on 2026-11-08.

| Metric | Before (baseline) | After (current) |
|---|---|---|
| Total files under `src/` | 10 | 13 |
| Source files (non-test) | 8 | 9 (`filtering.ts` added) |
| Test files | 2 | 4 (`filtering.test.ts`, `integration.test.ts` added) |
| Total tests | 29 | 57 |
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

Baseline file list (10): `App.tsx`, `main.tsx`, `index.css`, `vite-env.d.ts`,
`campus.ts`, `availability.ts`, `availability.test.ts`, `validation.ts`,
`validation.test.ts`, `time.ts`.

Current file list (13): the 10 above plus `filtering.ts`,
`filtering.test.ts`, `integration.test.ts`. `campus.ts` was extended, not
added.

### Remaining limitations

- **No UI/component tests.** The F5 room-switch behavior is verified through
  integration tests of `checkAvailability`, not by rendering the React
  component. The `useEffect` that clears the verdict is not directly tested.
- **`App.tsx` remains a single 493-line component.** Task 02 added the
  room-finder UI to the existing monolith rather than splitting it, to keep
  changes minimal as required. UI component refactoring was not completed.
- **No CI configuration.** Quality gates must be run manually.
- **No coverage reporting.** `@vitest/coverage-v8` is not installed.
- **All data is in-memory seed data.** No persistence across page reloads.
