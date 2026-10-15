# Recent Context Cache

## Current Operational State
- **Active Feature**: Zero-`any` refactor, domain types modularization into `extraction.ts` and `api.ts`, strict type contracts for UI and Prisma.
- **Key Modules in Focus**: `src/types/`, `src/app/api/`, `src/features/reports/components/`, `src/lib/db.ts`, `project-brain/`.
- **Validation Pipeline**: `bun --bun x tsc --noEmit` -> `bun run lint` -> `bun run build` -> `bun x knip` (all passing with 0 errors).
