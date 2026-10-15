# Code Quality Review Rubric

## Checklist
- [ ] Has the mandatory 3-step static validation pipeline passed completely?
  1. `bun run lint` (0 errors)
  2. `bun run build` (0 type errors, successful build)
  3. `bun x knip` (0 dead files, 0 unused exports, 0 unused dependencies)
- [ ] Are all imports at the top level of the file (zero in-between dynamic imports)?
- [ ] Are all types and interfaces extracted to `src/types/` (zero inline component types)?
- [ ] Are function arguments and returns explicitly typed where not trivially inferred?
- [ ] Is code formatted cleanly with Prettier?

## Scoring Threshold
- Minimum acceptable score: 90 / 100.
