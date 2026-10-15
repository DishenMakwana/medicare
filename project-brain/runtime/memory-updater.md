# Memory Updater Specification

## Responsibility
Applies targeted, incremental updates to `project-brain/memory/` after an engineering task has successfully passed review and confidence scoring.

## Synchronization Protocol
1. Identify which memory domains were touched by the accepted changes (e.g., if a new route was added, update `memory/routing.md`; if a database model changed, update `memory/database.md`).
2. Apply surgical text replacements rather than rewriting entire files.
3. Keep each file under the 300–500 line threshold.
4. Record the update in `tasks/completed.md` and `tasks/changelog.md`.
