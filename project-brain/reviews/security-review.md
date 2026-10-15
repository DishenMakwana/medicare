# Security Review Rubric

## Checklist
- [ ] Are sensitive health metrics, patient names, and document scans protected locally?
- [ ] Are file uploads restricted to allowed MIME types (`application/pdf`, `image/*`)?
- [ ] Are uploaded filenames sanitized against path traversal (`..`, `/`)?
- [ ] Are database operations conducted via Prisma parameterized queries (zero raw SQL string interpolation)?
- [ ] Are physical image files on disk deleted whenever their parent database records are deleted?

## Scoring Threshold
- Minimum acceptable score: 95 / 100.
