# Architecture Specification

## System Topology & Flow

```
User Browser
  ├── UI Pages (Next.js 16 Server Components)
  │     ├── / (Dashboard)
  │     ├── /members, /members/[id]
  │     ├── /reports, /reports/[id], /reports/upload
  │     └── /vitals
  │
  ├── Interactive Leaves (React 19 Client Components)
  │     ├── ReportsVaultClient, ReportDetailClient, PageInspectModal
  │     ├── VitalsDashboardClient, VitalsTrendChart, VitalsModal
  │     ├── MultiPhotoDropzone, ExtractionReviewTable
  │     └── RefreshCacheButton, DeleteConfirmModal
  │
  ├── Data Access & Mutations Layer
  │     ├── Server Actions (src/features/*/actions.ts)
  │     ├── Route Handlers (/api/members, /api/reports/extract)
  │     └── Python Subprocess Runner (src/lib/python-runner.ts -> scripts/extract_report.py)
  │
  ├── Multi-Tier Local Cache (src/lib/db.ts)
  │     ├── React Server Component cache()
  │     ├── Global In-Memory memoryCache (3000ms TTL)
  │     └── File-backed Epoch Sync (.cache-timestamp)
  │
  └── Database (Prisma ORM 6 -> PostgreSQL)
```

## Architectural Highlights

### 1. Hybrid Server / Client Rendering
- All page entries (`src/app/**/page.tsx`) act as async Server Components.
- Parallel database queries (`Promise.all`) execute on the server and pass fully hydrated objects to interactive client components.
- Zero client-side data waterfalls or loading spinners on initial route visits.

### 2. Multi-Tier Cache Layer (`src/lib/db.ts`)
- **React `cache()`**: Deduplicates queries made within the same request lifecycle (e.g. `RootLayout` fetching members for `Navbar` while `DashboardPage` also queries members).
- **In-Memory Cache (`memoryCache`)**: Global Map storing queried models with a short TTL (3000ms), giving instant response times on navigation without stale reads.
- **Cross-Process Cache Epoch (`.cache-timestamp`)**: When mutations occur in any process (API route, server action, CLI script), `updateGlobalCacheEpoch()` updates the file timestamp on disk, instantly invalidating stale in-memory entries across all workers.

### 3. Decoupled Type System (`src/types/`)
- `models.ts`: Pure database and OCR extraction interfaces with zero dependencies.
- `components.ts`: UI prop interfaces, modal state types, and filters, importing from `models.ts`.
- `index.ts`: Barrel export exporting both. Zero circular dependencies.

### 4. Local Python OCR Engine Pipeline
- User uploads PDF or scanned images $\rightarrow$ saved to `public/uploads/`.
- Next.js invokes `runPythonExtraction` (`src/lib/python-runner.ts`), which runs `scripts/extract_report.py` via Python 3 subprocess.
- Outputs structured JSON with detected patient name, lab, report date, test parameters, reference ranges, and incomplete lines for review.
