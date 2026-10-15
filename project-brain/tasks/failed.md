# Failed Tasks & Resolution Log

## Incident 1: Circular Type Export During Next.js Production Build
- **Date**: 2026-10-14
- **Symptom**: `bun run build` failed with `Module '"@/types"' has no exported member 'MemberDetailPageProps'`, and callback parameters (`m`, `idx`, `r`, `p`) were inferred as implicit `any`.
- **Root Cause**: `src/types/components.ts` imported models from `./index`, while `src/types/index.ts` re-exported `components.ts`. Next.js webpack TypeScript compiler encountered a circular evaluation race condition.
- **Resolution**: Decoupled database models into a standalone `src/types/models.ts`. `components.ts` imports from `./models` via `import type`. `index.ts` cleanly re-exports both without circular dependencies.
- **Rule Added to Standards**: `standards/typescript.md` rule #3: No circular imports between type modules.
