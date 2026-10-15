# Performance Standards

## Rules
1. **Parallel Database Queries**:
   - In all Server Component pages, use `Promise.all` to query independent data sources concurrently rather than sequential `await` chains:
     ```typescript
     const [members, reports, vitals] = await Promise.all([
       db.getMembers(),
       db.getReports(),
       db.getVitals(),
     ]);
     ```
2. **Multi-Tier Local Caching**:
   - Tier 1: React Server Component `cache()` deduplication within a single request.
   - Tier 2: In-memory `memoryCache` with 3000ms default TTL for sub-millisecond route transitions.
   - Tier 3: File-backed epoch synchronization (`.cache-timestamp`) across concurrent Node.js processes.
3. **No Unnecessary Client Re-fetching**:
   - Server Components must pass pre-fetched initial data to client components (e.g., `ReportUploadPage` passing `initialMembers` to `ReportUploadClient`). Avoid `useEffect(..., [fetch("/api/...")])` waterfalls.
4. **Client Bundle & Asset Optimization**:
   - Keep icons tree-shakeable from `lucide-react`.
   - Use Next.js `<Image>` or CSS lazy-rendering for high-resolution document previews.
