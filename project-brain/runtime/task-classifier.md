# Task Classifier Specification

## Responsibility
Classifies developer prompts during Phase 2 to determine complexity rating and affected architectural domains.

## Domain Categories
1. **Frontend**: Interactive UI components, modals, filters, Recharts trends.
2. **Backend**: Server Actions, API routes, Python runner subprocess, disk file management.
3. **Database**: Prisma schema, migrations, test presets seeding, relations.
4. **Fullstack**: End-to-end features spanning database model to UI presentation.
5. **Quality & Maintenance**: Type fixes, lint cleanups, dead code elimination, cache optimization.

## Complexity Grading
- `LOW`: Single-file modification, text/css adjustments.
- `MEDIUM`: Multi-file updates within a single bounded feature area (e.g. updating Vitals logging).
- `HIGH`: Cross-domain changes impacting database schema, OCR engine, and interactive review UI.
