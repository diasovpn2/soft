# Project memory

## Product intent & audience

- Vite + React app with no backend, database, login, or external API; client-side only.
- Appears to involve campus-related data (`src/data/campus.ts`) with filtering, validation, integration, and availability logic.
- `@supabase/supabase-js` is listed as a dependency but never imported by any source file.

## Brand personality & voice

- Not yet inferred from UI copy or design assets.

## Visual design & UX direction

- Tailwind CSS 3.4.1 configured for styling.
- `lucide-react` (0.446.0) used for icons.
- Single-page React 18 app entry via `src/main.tsx` → `src/App.tsx`.

## Decisions, constraints & rationale

- Framework: vite-react (React 18.3.1, Vite 5.4.8, TypeScript 5.5.3).
- Quality gates all pass: `build`, `test` (57 tests across 4 files), `lint`, `typecheck`.
- Scripts: `dev`, `build`, `preview`, `lint` (`eslint .`), `typecheck` (`tsc --noEmit -p tsconfig.app.json`), `test` (`vitest run`), `test:watch` (`vitest`).
- Test files: `filtering.test.ts` (18), `validation.test.ts` (14), `integration.test.ts` (10), `availability.test.ts` (15) — total 57.
- README.md exists and accurately documents scripts, folder layout, and test counts.
- AGENTS.md does not exist.
- No `.bolt/prompt` provided this turn.

## Open questions & assumptions

- Product domain (campus features) and target audience not yet specified by user.
- Supabase dependency may be leftover or planned for future use.
- No AGENTS.md; unknown if user wants one created.
- Brand voice and visual direction pending UI review.