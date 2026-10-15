# Backend & Server Actions Specification

## Server Actions (`src/features/*/actions.ts`)

### Members Actions (`src/features/members/actions.ts`)
- `createFamilyMember(data)`: Creates member, cleans and normalizes aliases, calculates age, calls `db.createMember()`, revalidates paths.
- `updateFamilyMember(id, data)`: Modifies existing member properties, revalidates paths.
- `deleteFamilyMember(id)`: Deletes member, cascade deletes reports and vitals, cleans disk images, revalidates paths.

### Reports Actions (`src/features/reports/actions.ts`)
- `saveVerifiedReport(reportData)`: Persists reviewed report, associated page images, and clinical parameters into Prisma; matches or creates `TestPreset` records.
- `deleteReportAction(id)`: Deletes report, cascade deletes parameters/images, deletes physical disk files from `public/uploads/`.
- `deleteReportImageAction(imageId)`: Deletes single page scan and removes the file from disk.
- `getTestPresetsAction(labName)`: Fetches clinical test presets filtered by lab or generic defaults.
- `saveTestPresetAction(presetData)`: Manually registers or updates a biomarker test preset.
- `updateTestPresetByIdAction(presetId, data)`: Updates clinical reference range boundaries (`refMin`, `refMax`, `refText`, `unit`).

### Vitals Actions (`src/features/vitals/actions.ts`)
- `createDailyVitalAction(data)`: Records blood pressure or blood sugar telemetry log for a member.
- `deleteDailyVitalAction(vitalId)`: Removes specific vital log and invalidates cache.

### Cache Actions (`src/lib/cache-actions.ts`)
- `revalidateAllCachesAction()`: Clears in-memory cache, touches `.cache-timestamp`, and revalidates all Next.js routes (`/`, `/members`, `/reports`, `/vitals`).

## Route Handlers (`src/app/api/`)
- `GET /api/members`: Returns all family members JSON with `no-store` headers.
- `POST /api/members`: Creates new member directly from JSON body.
- `POST /api/reports/extract`: Ingests multipart/form-data containing files, writes files to `public/uploads/`, calls `runPythonExtraction()`, and returns parsed clinical report JSON.
