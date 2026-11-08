# Assignment #04 — Project Baseline

Recorded: 2026-11-08

This document captures the state of the Smart Campus room availability checker
immediately before implementing Assignment #04. All measurements below were
produced by running the project's own commands; none are invented.

## Commands and results

### Tests

**Command:** `npm run test` (runs `vitest run`)

**Result: PASS (exit 0)**

```
 RUN  v2.1.9 /home/project

 ✓ src/lib/availability.test.ts (15 tests) 7ms
 ✓ src/lib/validation.test.ts (14 tests) 5ms

 Test Files  2 passed (2)
      Tests  29 passed (29)
   Start at  15:48:20
   Duration  517ms (transform 70ms, setup 0ms, collect 83ms, tests 12ms, environment 0ms, prepare 154ms)
```

- Test files: 2
- Total tests: 29
- Passing tests: 29
- Failing tests: 0
- Test runner: Vitest 2.1.9
- Test environment: node
- Test file pattern: `src/**/*.test.ts`

### TypeScript typecheck

**Command:** `npm run typecheck` (runs `tsc --noEmit -p tsconfig.app.json`)

**Result: PASS (exit 0, no output)**

No type errors reported.

### ESLint

**Command:** `npm run lint` (runs `eslint .`)

**Result: PASS (exit 0, no output)**

No lint warnings or errors reported.

### Production build

**Command:** `npm run build` (runs `vite build`)

**Result: PASS (exit 0)**

```
vite v5.4.8 building for production...
transforming...
Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-browserslist-db#readme
✓ 1572 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.70 kB │ gzip:  0.38 kB
dist/assets/index-Dwf9FGZ0.css   11.17 kB │ gzip:  3.00 kB
dist/assets/index-BdQdKeTN.js   155.20 kB │ gzip: 49.63 kB
✓ built in 2.02s
```

Note: The Browserslist "caniuse-lite is outdated" message is an informational
warning from Vite, not a build error. The build completed successfully.

## Source file inventory

Source files under `src/` (10 files total):

| File | Lines |
|---|---|
| `src/App.tsx` | 319 |
| `src/main.tsx` | 10 |
| `src/index.css` | 3 |
| `src/vite-env.d.ts` | 1 |
| `src/data/campus.ts` | 84 |
| `src/lib/availability.ts` | 37 |
| `src/lib/availability.test.ts` | 126 |
| `src/lib/validation.ts` | 62 |
| `src/lib/validation.test.ts` | 119 |
| `src/lib/time.ts` | 24 |
| **Total** | **785** |

- Current source file count: 10
- `src/App.tsx` line count: 319

## Existing test coverage by acceptance criterion

| Criterion | Unit tests (`validation.test.ts`) | Composite tests (`availability.test.ts`) |
|---|---|---|
| AC1 — interval bounds + start in future | 6 | 6 |
| AC2 — max 120-minute duration | 2 | 2 |
| AC3 — blocked room | 2 | 1 |
| AC4 — overlap + touching endpoints | 4 | 3 |
| AC5 — no room selected | — | 1 |
| AC6 — available verdict shape | — | 1 |
| Fixture immutability | 1 | 1 |
| **Totals** | **15** | **14** |

No integration or UI tests exist. All tests run in the `node` environment
against pure functions.

## Tooling versions

| Tool | Version |
|---|---|
| Vite | 5.4.8 |
| Vitest | 2.1.9 |
| TypeScript | 5.5.3 |
| ESLint | 9.9.1 |
| React | 18.3.1 |
| Node.js | (runtime) |

## Known gaps relative to Assignment #04

These gaps are recorded here so the post-implementation comparison can reference
them. They are not yet addressed.

- No `equipment` field on the `Room` type.
- No capacity or equipment filtering logic or UI.
- No filtering module (e.g. `src/lib/filter.ts`).
- No F1–F5 feature tests.
- No integration or UI tests (no `@testing-library/react`, no `jsdom`/`happy-dom`).
- No coverage reporting (`@vitest/coverage-v8` not installed).
- `src/App.tsx` is a single 319-line component with no sub-component split.
- `MAX_DURATION` is duplicated in `App.tsx` (line 19) and `validation.ts` (line 4 as `MAX_BOOKING_DURATION`).
- No CI configuration.
