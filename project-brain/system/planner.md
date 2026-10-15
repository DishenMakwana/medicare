# Planner Specification

## Responsibilities
The Planner is invoked in **Phase 10** before any code modifications occur. It decomposes user prompts and generates structured, bite-sized implementation plans.

### Core Outputs
1. **Goal**: Single concise sentence defining what this task builds or refactors.
2. **Affected Modules**: Explicit list of modules, routes, components, and schema entities.
3. **Execution Order**: Atomic, chronological sequence of changes (2–5 minutes per step).
4. **Complexity Estimation**:
   - `LOW`: Simple styling, single utility update, localized text/type change.
   - `MEDIUM`: Single component + server action + database query update.
   - `HIGH`: Cross-domain feature (e.g. OCR pipeline adjustment + new model + UI modals).
5. **Risk Analysis**: Potential regression vectors, data migration hazards, breaking type contracts.
6. **Testing & Validation Strategy**:
   - Exact static verification commands:
     - `bun run lint`
     - `bun run build`
     - `bun x knip`
   - Manual user flows and E2E validation steps.
7. **Rollback Strategy**: Clean git restore commands to revert to the previous working commit if validation fails.
8. **Estimated Files**: Explicit list of files to create, modify, or delete.

## Planning Protocol
- **Gate**: Execution CANNOT begin until the user explicitly approves the plan artifact.
- **Scope Discipline**: Respect existing architectural patterns; avoid scope creep or unrelated refactoring.
