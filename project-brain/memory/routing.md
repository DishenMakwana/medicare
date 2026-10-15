# App Routing Specification

## Route Map (`src/app/`)

| Route Path | Type | File Path | Description | Data Fetched |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Server Component | `src/app/page.tsx` | Dashboard with family overview, quick stats, abnormal biomarker alerts, recent vitals | `db.getMembers()`, `db.getReports()`, `db.getVitals()` in parallel |
| `/members` | Server Component | `src/app/members/page.tsx` | Family members directory with add/edit member modal | `db.getMembers()` |
| `/members/[id]` | Server Component | `src/app/members/[id]/page.tsx` | Member profile with health metrics, vitals log, historical reports | `db.getMemberById(id)`, `db.getFamilyMembers()` in parallel |
| `/reports` | Server Component | `src/app/reports/page.tsx` | Searchable medical reports vault with member and status filters | `db.getReports()`, `db.getFamilyMembers()` in parallel |
| `/reports/[id]` | Server Component | `src/app/reports/[id]/page.tsx` | Report detail view, biomarker list, image viewer, page inspection | `db.getReportById(id)`, `db.getTestPresets()` in parallel |
| `/reports/upload` | Server Component | `src/app/reports/upload/page.tsx` | Upload interface for scans/PDFs and review table | `db.getMembers()` pre-warmed for instant dropzone availability |
| `/vitals` | Server Component | `src/app/vitals/page.tsx` | Daily BP and Blood Sugar telemetry dashboard and trends chart | `db.getVitals()`, `db.getFamilyMembers()` in parallel |
| `/api/members` | Route Handler | `src/app/api/members/route.ts` | GET/POST JSON endpoint for family members | `db.getMembers()`, `db.createMember()` |
| `/api/reports/extract` | Route Handler | `src/app/api/reports/extract/route.ts` | POST multipart/form-data for OCR processing | Runs Python script `scripts/extract_report.py` |

## Route Configuration Rules
- All pages declare `export const dynamic = "force-dynamic";` and `export const revalidate = 0;` to ensure live database state is always rendered.
- Dynamic route segments use typed async params: `params: Promise<{ id: string }>`.
