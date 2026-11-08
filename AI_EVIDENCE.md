# AI Evidence — Assignment #04

## AI tool and model used

- **Tool:** Bolt (bolt.new) — AI-powered web development environment
- **Model:** Claude (Anthropic) — accessed via the Bolt assistant

## Date of use

2026-11-08

## Main prompts provided

1. **Task 02 prompt:** "Implement Task 02 of Software Engineering Assignment #04.
   Extend the existing Smart Campus project." — Specified adding `equipment:
   string[]` to the `Room` type, equipment data for all rooms, capacity
   filtering, equipment filtering (ALL items), blocked-room exclusion, empty
   state, room-switch verdict refresh, and separation of filtering logic into
   `src/lib/filtering.ts`. Required preserving AC1–AC6, no booking-validation
   changes, no fixture mutation, minimal changes, no backend/database/login.

2. **Task 04 prompt:** "Continue with Task 04 of Software Engineering Assignment
   #04." — Specified adding executable tests for F1–F5, boundary tests (exact
   capacity, insufficient capacity, empty equipment, multiple equipment,
   120/121 minutes, touching/overlapping bookings), at least one integration
   test, no new dependencies without explanation, no removed/weakened tests,
   no AC1–AC6 changes. Required running all four quality gates and reporting
   exact results.

3. **Documentation prompt:** "Prepare the documentation required for Software
   Engineering Assignment #04." — Specified creating `README.md`,
   `ANALYSIS_REPORT.md`, and `AI_EVIDENCE.md` with exact content requirements.
   Required basing all documentation on actual source code, not inventing
   history or metrics, and reporting the inspected directory if `AGENTS.md`/
   `1.md` could not be found.

## AI suggestions used

1. **Add `equipment: string[]` to the `Room` interface and populate all four
   rooms with fictional equipment.** Used as specified in Task 02.
2. **Create `src/lib/filtering.ts` with `filterByCapacity`,
   `filterByEquipment`, `excludeBlockedRooms`, and a composed
   `filterAvailableRooms`.** Used as specified — all functions use `.filter()`
   and return new arrays to avoid mutating fixtures.
3. **Add a "Find a room" panel to `App.tsx`** with an attendees input,
   equipment toggle chips, matching-room cards, and an empty state. Used as
   specified.
4. **Add a `useEffect` on `roomCode` to clear the stale verdict when the
   selected room changes.** Used as specified for F5 behavior.
5. **Consolidate the duplicated `MAX_DURATION` constant** by importing
   `MAX_BOOKING_DURATION` from `validation.ts` instead of redefining it in
   `App.tsx`. Used — this resolved the duplication noted in `BASELINE.md`.
6. **Write 18 unit tests in `src/lib/filtering.test.ts`** covering F1–F4 and
   boundary cases (exact capacity, insufficient capacity, empty equipment,
   multiple equipment, input immutability). Used as specified.
7. **Write 10 integration tests in `src/lib/integration.test.ts`** covering F5
   (room-switch with each room's own bookings), 120/121-minute boundary,
   touching/overlapping boundary, and a filter→availability pipeline. Used as
   specified.

## Suggestions rejected or modified

1. **Installing `@testing-library/react` and `jsdom` for a UI rendering test
   (F5).** Rejected. The assignment said "do not install new dependencies
   without explaining why they are necessary." The existing Vitest `node`
   environment was sufficient for integration tests that verify the
   `checkAvailability` pipeline produces room-specific results. Adding
   `@testing-library/react` + `jsdom` would have been a larger change better
   deferred to a future improvement. The documentation explicitly states that
   no UI rendering test exists.

2. **Splitting `App.tsx` into sub-components during Task 02.** Not done. The
   assignment required "minimal changes," so the room-finder UI was added to
   the existing component rather than refactoring it. This is noted as a
   remaining limitation and a prioritized future improvement.

## Problems discovered

1. **`MAX_DURATION` was duplicated** — defined as `120` in `App.tsx` (line 19)
   and as `MAX_BOOKING_DURATION = 120` in `validation.ts` (line 4). This was
   recorded in `BASELINE.md`. During Task 02, the duplicate in `App.tsx` was
   replaced with an import of `MAX_BOOKING_DURATION` from `validation.ts`.

2. **`AGENTS.md` / `1.md` not found.** The documentation prompt instructed
   reading these files. A recursive glob of `/home/project` found no such
   files. The inspected directory was `/home/project` (including `src/`,
   `src/lib/`, `src/data/`). This is reported here as required.

3. **`Room` interface change required updating existing test fixtures.** Adding
   `equipment: string[]` to `Room` made the two inline `Room` fixtures in
   `validation.test.ts` fail type-checking. `equipment: []` was added to both
   fixtures. No test logic was changed — only the fixture objects were extended
   to satisfy the updated interface.

## Changes made manually or with AI

All code changes in Tasks 02 and 04 were made with AI assistance within the
Bolt environment:

- **Task 02 (AI-assisted):**
  - `src/data/campus.ts` — added `equipment` field, equipment data,
    `EquipmentOption` type, `EQUIPMENT_OPTIONS`.
  - `src/lib/filtering.ts` — new file with 4 filtering functions.
  - `src/App.tsx` — added room-finder panel, equipment tags, `useEffect` for
    verdict refresh, consolidated `MAX_BOOKING_DURATION` import.
  - `src/lib/validation.test.ts` — added `equipment: []` to two fixtures.

- **Task 04 (AI-assisted):**
  - `src/lib/filtering.test.ts` — new file with 18 unit tests.
  - `src/lib/integration.test.ts` — new file with 10 integration tests.

- **Documentation (AI-assisted):**
  - `README.md`, `ANALYSIS_REPORT.md`, `AI_EVIDENCE.md` — new files.

No changes were made manually outside the Bolt environment. No application
source code was modified during the documentation task.

## How changes were verified

All four quality gates were run after Task 02 and again after Task 04. The
results below are from the final run after Task 04 (verified, not invented):

| Command | Result |
|---|---|
| `npm test` | PASS (exit 0) — 57 tests, 4 files, all passing |
| `npm run typecheck` | PASS (exit 0) — no type errors |
| `npm run lint` | PASS (exit 0) — no warnings or errors |
| `npm run build` | PASS (exit 0) — 1573 modules transformed |

Test breakdown (verified output):

```
 ✓ src/lib/filtering.test.ts (18 tests)
 ✓ src/lib/availability.test.ts (15 tests)
 ✓ src/lib/integration.test.ts (10 tests)
 ✓ src/lib/validation.test.ts (14 tests)

 Test Files  4 passed (4)
      Tests  57 passed (57)
```

Baseline comparison (from `BASELINE.md`, recorded 2026-11-08 before
Assignment #04): 29 tests across 2 files. After: 57 tests across 4 files. No
existing tests were removed or weakened.
