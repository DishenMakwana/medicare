# Naming Conventions

## Standards
1. **Directories**: Lowercase kebab-case (`components`, `features`, `project-brain`, `seed-data`).
2. **Components**: PascalCase matching the exported component name (`ReportsVaultClient.tsx`, `StatCard.tsx`, `PageInspectModal.tsx`).
3. **Server Actions**: CamelCase action verbs (`createFamilyMember`, `deleteReportAction`, `getTestPresetsAction`).
4. **Types & Interfaces**: PascalCase (`FamilyMember`, `MedicalReport`, `StatCardProps`).
   - Prop interfaces: `[ComponentName]Props` (`ReportsVaultClientProps`).
   - State union types: `[Noun]Type` or `[Noun]Filter` (`ReportStatusFilterType`, `VitalTypeFilter`).
5. **Database Models & Tables**:
   - Prisma Model: PascalCase singular (`FamilyMember`, `MedicalReport`, `DailyVital`, `TestPreset`).
   - Table name: Snake_case or PascalCase mapped in schema.
6. **Route Handlers**: `src/app/api/**/route.ts` with standard exported uppercase HTTP handlers (`GET`, `POST`, `DELETE`).
