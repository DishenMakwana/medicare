# Engineering Execution Lifecycle Workflow

## Lifecycle Pipeline

```
1. Receive Prompt
      ↓
2. Task Classification (Low / Medium / High, Domain: Frontend / Backend / DB)
      ↓
3. Graph Retrieval (Identify affected nodes from graph/nodes.json and graph/edges.json)
      ↓
4. Context Loading (Selectively load relevant files from memory/*.md into context)
      ↓
5. Planning (Phase 10: Produce plan with goal, risk, files, testing, rollback)
      ↓
   [User Approval Gate]
      ↓
6. Execution (Phase 11: Implement atomic code edits, preserve existing architecture)
      ↓
7. Static Validation Pipeline (Phase 12: Mandatory Tooling Verification)
      ├── 7a. bun run lint      (ESLint code style & syntax validation)
      ├── 7b. bun run build     (Next.js compilation & TypeScript typecheck)
      └── 7c. bun x knip        (Dead code, unused exports & unused deps check)
      ↓
   [Did all 3 Static Checks Pass?]
      ├── NO  ──> Loop back directly to Step 6 (Fix code). AI Review is skipped!
      └── YES ──> Proceed to Step 8
      ↓
8. AI Review (Phase 13: Architecture, Security, Performance, Code Quality)
      ↓
9. Confidence Scoring (Phase 14: Quantitative score >= 90 required for acceptance)
      ├── Score < 90  ──> Improve code and re-validate
      └── Score >= 90 ──> Proceed to Step 10
      ↓
10. Knowledge Synchronization (Phase 15: Incrementally update memory/, graph/, tasks/)
      ↓
11. Return Final Response
```

## Non-Skippable Stages
No stage in this workflow may be bypassed. Specifically:
- **Never skip Static Validation**: `bun run lint`, `bun run build`, and `bun x knip` MUST pass without error.
- **Never allow In-Between Imports**: All imports must be positioned strictly at the top of each file (zero mid-file dynamic imports).
- **Never skip Plan Approval**: User confirmation must precede modifying codebase files.
- **Never skip Knowledge Synchronization**: Memory and graph files must be kept synchronized with the real state of the repository.
