# Static Validation Standards & Pipeline

## Mandatory Deterministic Verification Sequence
Before committing, creating pull requests, or requesting AI code review, deterministic static tooling must validate the implementation.

### The 3-Step Verification Pipeline:

```
[ Step 1: Linting ] ──────> [ Step 2: Build & Types ] ──────> [ Step 3: Dead Code / Knip ]
  bun run lint                bun run build                     bun x knip
  (ESLint syntax/style)       (Next.js & TypeScript)           (Unused files/exports/deps)
```

> [!IMPORTANT]
> **Pre-Condition: Strict Top-Level Imports Only**
> Before executing the validation pipeline, verify that **all imports across every file are placed strictly at the top level**. In-between dynamic imports or mid-function `require()`/`import()` statements are strictly prohibited.

### 1. Step 1: Lint Check
Run the ESLint verification suite across all TypeScript and React files:
```bash
bun run lint
```
*(or `bun --bun x eslint src/`)*
- **Requirement**: Must exit with code `0`.
- **Constraint**: Zero lint errors and zero unhandled warnings allowed.

### 2. Step 2: Build Check
Run the complete production Next.js compilation and strict TypeScript type-checking:
```bash
bun run build
```
*(or `next build --webpack`)*
- **Requirement**: Must compile successfully and exit with code `0`.
- **Constraint**: Strict TypeScript type-checking must pass. All dynamic and static routes must finalize page optimization cleanly.

### 3. Step 3: Knip Dead Code & Unused Exports Check
Run the Knip dead code analysis tool:
```bash
bun x knip
```
- **Requirement**: Must report `✂️ Excellent, Knip found no issues.` (exit code `0`).
- **Constraint**: Zero unused files, zero unused exports, and zero unused dependencies. If any unused dead code is identified, clean it up before proceeding.

---

## Failure Protocol
If any of the 3 checks fails:
1. **Execution returns directly to the coding phase**.
2. **AI review is strictly skipped** to avoid wasting context tokens on broken or un-compilable code.
3. Fix the compiler/lint/knip error, re-run all 3 checks, and only proceed once all three pass cleanly.
