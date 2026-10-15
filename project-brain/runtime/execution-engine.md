# Execution Engine Specification

## Responsibility
Applies code edits planned during Phase 10 after user approval has been granted.

## Execution Invariants
1. **Atomic Modifications**: Modify one logical slice of code at a time (2–5 minutes of work).
2. **Respect Existing Architecture**:
   - Preserve decoupled type system (`src/types/models.ts` vs `src/types/components.ts` vs `src/types/index.ts`).
   - Maintain strict top-level imports (strictly zero in-between or mid-file imports anywhere in the code).
   - Maintain parallel `Promise.all` database queries in Server Component routes.
3. **No Unrelated Refactoring**: Focus strictly on the approved plan.
4. **Immediate Static Validation Gate**:
   Once edits are generated, execute the mandatory 3-step verification pipeline in order:
   1. `bun run lint`
   2. `bun run build`
   3. `bun x knip`
   - If any step fails, do not proceed to AI review; immediately repair the failure.
