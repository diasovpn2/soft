# Smart Campus Room Availability

A single-page web application for checking whether a campus room is free for a
proposed time slot, and for finding rooms that match capacity and equipment
requirements.

## Project description

Smart Campus lets a user:

1. **Find a room** by minimum attendee count and required equipment. Blocked
   rooms are automatically excluded from results. A clear empty state appears
   when no room matches the filters.
2. **Check a room's availability** for a proposed start/end time against that
   room's existing bookings. The checker enforces six acceptance criteria
   (AC1–AC6): valid interval bounds, start in the future, max 120-minute
   duration, blocked-room rejection, overlap rejection (touching endpoints
   allowed), and a structured available/unavailable verdict.
3. **View existing bookings** for the currently selected room.

All data is fictional seed data stored in memory — there is no backend,
database, login, or external API.

## Technologies used

| Technology | Purpose | Version |
|---|---|---|
| React | UI component library | 18.3.1 |
| TypeScript | Static typing | 5.5.3 |
| Vite | Dev server and build tool | 5.4.8 |
| Vitest | Unit and integration testing | 2.1.9 |
| Tailwind CSS | Utility-first styling | 3.4.1 |
| ESLint | Linting | 9.9.1 |
| lucide-react | Icon set | 0.446.0 |

## Installation instructions

Prerequisites: Node.js 18+ and npm.

```bash
npm install
```

This installs all dependencies listed in `package.json`.

## How to run the application

```bash
npm run dev
```

Starts the Vite dev server. Open the printed local URL (typically
`http://localhost:5173`) in a browser. The page reloads automatically on
save.

To preview the production build locally:

```bash
npm run build
npm run preview
```

## How to run tests

```bash
npm test
```

Runs the full test suite once via `vitest run`. The project has 57 tests
across 4 test files:

| Test file | Tests | Scope |
|---|---|---|
| `src/lib/validation.test.ts` | 14 | AC1–AC4 validation rules (unit) |
| `src/lib/availability.test.ts` | 15 | AC1–AC6 composite checks + fixture immutability |
| `src/lib/filtering.test.ts` | 18 | F1–F4 filtering functions (unit) |
| `src/lib/integration.test.ts` | 10 | F5, duration/overlap boundaries, filter→availability pipeline |

For watch mode during development:

```bash
npm run test:watch
```

### Other quality-gate commands

```bash
npm run typecheck   # TypeScript type checking (tsc --noEmit)
npm run lint        # ESLint
npm run build       # Production build (vite build)
```

## Available npm scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start the dev server with hot reload |
| `build` | `vite build` | Produce a production build in `dist/` |
| `preview` | `vite preview` | Preview the production build locally |
| `lint` | `eslint .` | Run ESLint over the project |
| `typecheck` | `tsc --noEmit -p tsconfig.app.json` | Type-check without emitting |
| `test` | `vitest run` | Run all tests once |
| `test:watch` | `vitest` | Run tests in watch mode |

## Project structure

```
src/
├── App.tsx                    # Main UI component (room finder + availability form + result)
├── main.tsx                   # React entry point
├── index.css                  # Tailwind directives
├── data/
│   └── campus.ts              # Room and Booking types, seed data, equipment options
└── lib/
    ├── availability.ts        # checkAvailability — composes all validation rules
    ├── validation.ts          # Individual validation rules (AC1–AC4)
    ├── filtering.ts           # Room filtering by capacity, equipment, blocked status
    ├── time.ts                # Time-string ↔ minutes conversion utilities
    ├── availability.test.ts   # AC1–AC6 tests
    ├── validation.test.ts     # Validation unit tests
    ├── filtering.test.ts      # F1–F4 filtering unit tests
    └── integration.test.ts    # F5 + boundary + pipeline integration tests
```
