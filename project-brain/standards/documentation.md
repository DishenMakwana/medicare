# Documentation Standards

## Principles
1. **Never Regenerate Monolithic Docs**:
   - Updates must be incremental. Only modify the specific domain file in `project-brain/memory/` corresponding to the code changed.
2. **File Size Budget**:
   - Each markdown documentation file in `project-brain/memory/` must remain under 300–500 lines to preserve context token efficiency.
3. **Accuracy Over Redundancy**:
   - Document the "why", data structures, integration boundaries, and tricky edge cases (e.g. OCR regex fallback patterns, cache epoch synchronization) rather than reciting boilerplate.
4. **Code References**:
   - Use exact filepaths (`src/lib/db.ts`, `src/features/reports/actions.ts`) when referencing codebase implementations.
