# Database & Prisma Specification

## ORM Configuration
- Schema file: `prisma/schema.prisma`
- Provider: PostgreSQL
- Direct connection pooling configured in `src/lib/db.ts` with singleton protection.

## Data Models

```mermaid
erDiagram
    FamilyMember ||--o{ MedicalReport : "has many"
    FamilyMember ||--o{ DailyVital : "has many"
    MedicalReport ||--o{ ReportImage : "contains"
    MedicalReport ||--o{ ReportParameter : "contains"
    TestPreset ||--o{ ReportParameter : "references"

    FamilyMember {
        int id PK
        string customId
        string name
        string aliases
        string gender
        datetime dateOfBirth
        int ageYears
        string bloodGroup
        string relation
        string notes
    }

    MedicalReport {
        int id PK
        string customId
        int familyMemberId FK
        string title
        string labName
        string registrationNo
        datetime reportDate
        datetime collectionDate
        string doctorRef
        string rawPatientName
        string overallStatus
    }

    ReportImage {
        int id PK
        int reportId FK
        string imageUrl
        int pageNumber
        string ocrStatus
    }

    ReportParameter {
        int id PK
        int reportId FK
        int testPresetId FK
        string category
        string paramName
        string paramSlug
        float valueNumber
        string valueText
        string unit
        float refMin
        float refMax
        string refText
        string status
        string clinicalMethod
    }

    TestPreset {
        int id PK
        string customId
        string labName
        string name
        string category
        string unit
        float refMin
        float refMax
        string refText
        string clinicalMethod
        string source
    }

    DailyVital {
        int id PK
        int familyMemberId FK
        datetime recordDate
        string vitalType
        int systolic
        int diastolic
        int pulseRate
        float sugarValue
        string sugarContext
    }
```

## Seeding & Scripts
- `prisma/seed.ts`: Seeds initial family members, sample historical reports, daily vitals, and ~50 standard clinical test presets (`initialTestPresets`).
- `scripts/seed_postgres.ts`: Direct PostgreSQL seeding script.
- `scripts/clear_database.ts`: Safe database wipe script for testing environments.
