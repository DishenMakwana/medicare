# React 19 Standards

## Principles
1. **Server vs Client Component Boundaries**:
   - Default to Server Components for data fetching (`src/app/**/page.tsx`).
   - Use `"use client";` only at leaves where interactivity (state, effects, event handlers, canvas, drag-and-drop) is required.
   - Example pattern:
     - `src/app/members/page.tsx` (Server) fetches data and passes it to `src/features/members/components/MembersListClient.tsx` (Client).
2. **Minimal State**:
   - Derive state during render instead of syncing redundant state in `useEffect`.
   - Use memoization (`useMemo`, `useCallback`) strategically for heavy computations (such as biomarker calculations or graph render points).
3. **Modal & Portal Design**:
   - Modals should lock background scrolling when active.
   - Modals must provide explicit escape mechanisms (ESC key, backdrop click, cancel button, close X).
   - Use deletion confirmation dialogs (`DeleteConfirmModal`) for all irreversible deletions.
4. **Icons**:
   - Use `lucide-react` with standard icon sizes (`w-4 h-4`, `w-5 h-5`) and consistent stroke weights.
