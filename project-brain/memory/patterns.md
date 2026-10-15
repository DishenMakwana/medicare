# Architecture & Code Patterns

## Key Patterns in Medicare

### 1. Zero In-Between Imports
- All `import` declarations must strictly reside at the top of every file, following `"use client";` or `"use server";` where applicable.
- No dynamic `await import(...)` inside functions or lifecycle loops.

### 2. Parallel Database Loading (`Promise.all`)
- Whenever multiple database records are required for a view, fetch them concurrently:
  ```typescript
  const [reports, members] = await Promise.all([
    db.getReports(),
    db.getFamilyMembers(),
  ]);
  ```

### 3. Multi-Tier Cache with Epoch Invalidation
- High performance reads use in-memory caching with a short TTL.
- When any write occurs, call `memoryCache.invalidatePrefix(...)` and update `.cache-timestamp`.
- Reads verify `entry.created >= globalEpoch`, preventing stale reads across worker processes.

### 4. Patient Name Normalization & Member Matching (`src/lib/name-normalizer.ts`)
- OCR extracted names often have suffixes/prefixes (`Mr.`, `Mrs.`, `Dr.`, `Baby of`).
- `cleanPersonName` removes titles and trims excessive whitespace.
- `matchFamilyMember` checks exact names, lowercase match, first/last name overlap, and configured member `aliases`.

### 5. Biological Range Valuation (`src/lib/utils.ts`)
- Biomarker evaluation checks:
  - If numerical value exceeds `refMax` $\rightarrow$ `HIGH`.
  - If numerical value falls below `refMin` $\rightarrow$ `LOW`.
  - If text contains `positive`, `reactive`, or `abnormal` $\rightarrow$ `ABNORMAL`.
  - Otherwise $\rightarrow$ `NORMAL` / `OPTIMAL`.
