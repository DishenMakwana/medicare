# Review Engine Specification

## Responsibility
Executes Phase 13 AI review across the 5 core engineering dimensions:
1. **Architecture**: Clean component boundaries, no circular dependencies, proper Server vs Client separation.
2. **Security**: Data privacy for patient scans, sanitized file paths, no SQL injection or un-sanitized user input.
3. **Performance**: Parallel database querying (`Promise.all`), cache synchronization, no client-side waterfalls.
4. **Code Quality**: Strict TypeScript types, zero dead code, zero in-between imports.
5. **Documentation**: Accurate comments, aligned `memory/` docs.

## Review Input Gate
- AI review runs ONLY after `bun run lint`, `bun run build`, and `bun x knip` have all exited with code `0`.
