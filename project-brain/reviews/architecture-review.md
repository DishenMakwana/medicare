# Architecture Review Rubric

## Checklist
- [ ] Are Next.js App Router boundaries respected (Server Components by default, Client Components at interactive leaves)?
- [ ] Are type definitions decoupled (models in `models.ts`, component types in `components.ts`, zero circular imports)?
- [ ] Are data mutations routed exclusively through Server Actions or typed API route handlers?
- [ ] Are disk file operations isolated and accompanied by database cascade cleanups?
- [ ] Is global state minimized and scoped strictly to local component trees?

## Scoring Threshold
- Minimum acceptable score: 90 / 100.
