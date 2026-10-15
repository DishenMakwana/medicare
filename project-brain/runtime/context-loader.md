# Context Loader Specification

## Responsibility
Selectively loads the minimum required memory markdown files into AI context based on the affected nodes identified by the Graph Retriever.

## Loading Policy
- **Never load all memory files simultaneously**.
- Map task domains to minimal memory sets:
  - If task is **Reports Upload / Inspection**: Load `memory/frontend.md`, `memory/backend.md`, `memory/database.md`.
  - If task is **Vitals Telemetry**: Load `memory/frontend.md`, `memory/backend.md`.
  - If task is **Database / Caching**: Load `memory/database.md`, `memory/architecture.md`, `memory/patterns.md`.
- Always reference `standards/validation.md` for static validation instructions.
