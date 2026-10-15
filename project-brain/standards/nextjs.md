# Next.js 16 Standards

## Architecture & Conventions
1. **App Router Structure**:
   - Follow the App Router directory structure in `src/app/`.
   - Dynamic page routes declare:
     ```typescript
     export const dynamic = "force-dynamic";
     export const revalidate = 0;
     ```
2. **Server Actions**:
   - Declare `"use server";` at the top of action files in `src/features/*/actions.ts`.
   - Never expose Prisma client directly to the client; all mutations go through typed Server Actions.
3. **Route Handlers**:
   - Located in `src/app/api/*/route.ts`.
   - Handle multipart/form-data for report uploads (`/api/reports/extract`).
   - Use standard `NextResponse.json()` responses with appropriate status codes and error messaging.
4. **Cache Revalidation**:
   - After database mutations, invoke `db.clearCache()` and `revalidatePath("/", "layout")` to keep Server Component pages synchronized.
