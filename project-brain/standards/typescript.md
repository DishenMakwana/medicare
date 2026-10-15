# TypeScript Standards

## Core Rules
1. **Strict Type Checking**:
   - `strict: true` in `tsconfig.json` must always be respected.
   - Avoid `any` wherever possible. Use precise interfaces or generics.
2. **Centralized Types**:
   - All shared data models belong in `src/types/models.ts`.
   - All component props, state types, and UI filters belong in `src/types/components.ts`.
   - `src/types/index.ts` is the clean barrel export (`export * from "./models"; export * from "./components";`).
   - Never define inline `type` or `interface` declarations inside component files (`src/components/` or `src/features/**/components/`).
3. **No Circular Dependencies**:
   - `models.ts` has zero imports from other type files.
   - `components.ts` imports from `./models` using `import type`.
   - `index.ts` re-exports both without circular references.
4. **Strict Top-Level Imports (Zero In-Between Imports)**:
   - All `import` statements must be placed strictly at the top of the file, directly following file directives (`"use client";` or `"use server";`).
   - In-between or mid-file imports are strictly prohibited:
     ```typescript
     // ❌ FORBIDDEN (in-between dynamic import)
     async function seed() {
       const { initialTestPresets } = await import("../src/lib/seed-data");
     }

     // ✅ REQUIRED (top-level import)
     import { initialTestPresets } from "../src/lib/seed-data";
     async function seed() {
       ...
     }
     ```
   - Never use inline `require()` or dynamic `import()` within component bodies, server actions, functions, or utility scripts.
5. **Next.js 16 Dynamic Route Params**:
   - Page params in Next.js 16 are Promises:
     ```typescript
     export interface PageProps {
       params: Promise<{ id: string }>;
     }
     export default async function Page({ params }: PageProps) {
       const { id } = await params;
       ...
     }
     ```
