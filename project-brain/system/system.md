# System Layer - Global Engineering Workflow

## Purpose
Defines the global engineering runtime rules and operational invariant constraints for AI agents interacting with the Medicare codebase.

## Immutable Responsibilities
1. **Receive User Prompts**: Standard entrypoint for all developer instructions.
2. **Enforce Execution Order**: Enforce the deterministic 18-phase execution pipeline without skipping stages.
3. **Never Store Architecture**: Architectural models belong strictly in `memory/architecture.md` and `graph/`, never in `system/`.
4. **Never Store Project Memory**: Feature domain details, database schemas, and business logic belong in `memory/`.
5. **Never Store Implementation Details**: Implementation logic is isolated to code modules and documented in `memory/backend.md`, `memory/frontend.md`, etc.
6. **Strict Stability**: This file remains stable throughout the entire lifetime of the project.

## Non-Negotiable Operational Principles
- **Minimal Context Retrieval**: Never analyze or ingest the entire codebase unless explicitly ordered by the user.
- **Selective Memory Ingestion**: Load only the specific domain markdown files from `memory/` associated with the affected graph nodes.
- **Deterministic Pipeline**: Every engineering task follows:
  `Prompt` $\rightarrow$ `Classification` $\rightarrow$ `Graph Retrieval` $\rightarrow$ `Context Loading` $\rightarrow$ `Planning` $\rightarrow$ `Execution` $\rightarrow$ `Static Validation (Lint -> Build -> Knip)` $\rightarrow$ `AI Review` $\rightarrow$ `Confidence Scoring` $\rightarrow$ `Knowledge Sync`.
- **Static Validation Gate**: Static tooling (`bun run lint`, `bun run build`, `bun x knip`) must pass completely before consuming AI review tokens.
- **Top-Level Imports Only**: All module imports must be placed strictly at the top of the file; inline or in-between dynamic imports anywhere in executable code or scripts are strictly prohibited.
- **Incremental Growth**: Every accepted task updates only the affected files in `memory/`, `graph/`, and `tasks/`.
