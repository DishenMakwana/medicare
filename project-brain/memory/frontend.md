# Frontend & Interactive Components Specification

## Key Client Components (`"use client"`)

### Reports Feature (`src/features/reports/components/`)
1. **`ReportsVaultClient.tsx`**:
   - Filter controls: Search input (title, lab, biomarker, doctor), Member dropdown, and Status filter (`ALL`, `FLAGGED`, `OPTIMAL`).
   - Summary statistics banner: Total Reports, Total Biomarkers, Flagged Count, Optimal Count.
   - Grid of `ReportCard` items.
2. **`ReportDetailClient.tsx`**:
   - Report overview header with member age/relation pill, collection date, registration number, and delete report button.
   - Biomarkers categorized by clinical group (CBC, Lipid, Metabolic, etc.).
   - Interactive `RangeBar` rendering relative marker position against biological normal intervals.
   - Highlighting out-of-range rows in red/amber alerts.
3. **`PageInspectModal.tsx`**:
   - High-performance pan, zoom (1x to 4x), and rotate canvas controls for original report scans.
   - Tabs: `ADD_TEST` (manual biomarker entry) and `VIEW_TESTS` (all extracted parameters for that page).
   - In-line reference range editing and deletion dialogs.
4. **`MultiPhotoDropzone.tsx` & `ExtractionReviewTable.tsx`**:
   - Multi-file dropzone supporting PDF and image uploads.
   - Progress bar and OCR extraction loading state.
   - Tabular parameter review allowing inline corrections before saving to database.
   - Quick family member creation modal (`MemberModal`) with automatic patient name matching.

### Vitals Feature (`src/features/vitals/components/`)
1. **`VitalsDashboardClient.tsx`**:
   - Telemetry cards for 7-day average Blood Pressure and Blood Sugar.
   - Filtering by family member and vital type (`ALL`, `BLOOD_PRESSURE`, `BLOOD_SUGAR`).
   - Chronological log tables with deletion confirmations.
2. **`VitalsModal.tsx`**:
   - Modal for logging daily readings: BP (Systolic, Diastolic, Pulse) or Blood Sugar (mg/dL with context: Fasting, Post-Prandial, Random, Bedtime).
3. **`VitalsTrendChart.tsx` (`src/features/analytics/components/`)**:
   - Recharts responsive dual-line chart visualizing blood pressure trends (systolic/diastolic thresholds) and blood sugar trends over time.

### Shared UI (`src/components/`)
- **`Navbar.tsx`**: Top navigation with active route highlights, Quick "+ Log Vitals" trigger, and cache status button.
- **`RefreshCacheButton.tsx`**: Tactile cache reload button matching application design language, providing spinner during revalidation and checkmark on success.
- **`DeleteConfirmModal.tsx`**: Standardized destructive confirmation modal with thumbnail preview and warning text.
- **`RangeBar.tsx`**: Visual biomarker range bar showing LOW (amber), NORMAL (emerald), and HIGH (rose) zones.
