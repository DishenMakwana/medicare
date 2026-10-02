# Medicare - Family Medical Records & Health Analytics Platform
## Implementation Plan & Technical Architecture Specification
### 100% Free & Open-Source (No Paid Packages or Paid APIs)

---

## 1. Executive Summary & Problem Scope

**Medicare** is a private, family-centric health records management and medical parameter analytics web application built entirely on **100% free and open-source software (FOSS)**.

### Strict Open-Source Guarantee:
- **No Paid APIs**: No OpenAI, No Google Gemini Cloud billing, No AWS Textract, No Azure Cognitive Services.
- **No Paid Software / Packages**: Every library in both the JavaScript and Python ecosystems is licensed under permissive open-source licenses (MIT, Apache 2.0, BSD, PostgreSQL).
- **100% Privacy & Data Sovereignty**: All OCR and document parameter extraction runs **locally on your machine**. Sensitive medical records never leave your local environment.

### Core Capabilities:
1. **Multi-Photo Report Ingestion**: Upload one or multiple photos/scans of medical test reports.
2. **Open-Source Local Python OCR & Parameter Extraction**: Powered by `pytesseract` (Tesseract 5.5.3 is already installed on your Mac!), `opencv-python`, and `pillow` with smart clinical regex table parsers and optional local vision models via `Ollama` (`llama3.2-vision` / `moondream`).
3. **Smart Patient Name Normalization**: Strip titles (`Mr.`, `Mrs.`, `Shri`, etc.), clean casing, and match/associate with family member profiles.
4. **Manual Daily Vitals Logging**: Direct logging of Blood Pressure (Systolic / Diastolic / Pulse) and Blood Sugar (Fasting, Post-Prandial, Random) on any specific day without needing a lab report.
5. **Direct Full-Stack Architecture**: Next.js 15 directly connects to **PostgreSQL** via Prisma ORM (no separate backend server needed; utilizing Server Actions and API routes).
6. **Production Scalable Folder Structure**: Modular, **Feature-First / Domain-Driven Architecture** adhering to industry best practices from leading Medium engineering publications.

---

## 2. 100% Open-Source Technology Stack & Licenses

| Layer | Technology | License | Cost |
| :--- | :--- | :--- | :--- |
| **Package Manager** | Bun (v1.4.0) | MIT | $0 (Free) |
| **Framework** | Next.js 15 (App Router, Server Actions) | MIT | $0 (Free) |
| **Language** | TypeScript | Apache 2.0 | $0 (Free) |
| **UI Styling** | Tailwind CSS v4 | MIT | $0 (Free) |
| **Icons & Primitives** | Lucide React + Radix UI | ISC / MIT | $0 (Free) |
| **Data Visualization** | Recharts | MIT | $0 (Free) |
| **Database** | PostgreSQL | PostgreSQL License (OSI Approved) | $0 (Free) |
| **ORM Layer** | Prisma ORM | Apache 2.0 | $0 (Free) |
| **OCR Engine** | Tesseract OCR (v5.5.3 installed on Mac) | Apache 2.0 | $0 (Free) |
| **Python OCR Wrapper** | `pytesseract` | Apache 2.0 | $0 (Free) |
| **Image Processing** | `pillow` (PIL) + `opencv-python-headless` | HPND / Apache 2.0 | $0 (Free) |
| **Data Validation** | `pydantic` (Python) + `zod` (TypeScript) | MIT | $0 (Free) |
| **Optional Local Vision AI** | `ollama` (`llama3.2-vision` / `moondream`) | MIT / Apache 2.0 | $0 (Free) |

---

## 3. Analysis of Data Extracted from Sample Reports Provided

Based on the 5 provided test report images from **Unipath Specialty Laboratory Ltd.** (Patient: **JANE DOE**, Age: 43 Years, Gender: Female, Date: 07-Oct-2018), here is the structured clinical dataset our open-source extraction engine will parse and store in PostgreSQL:

### A. Report Metadata & Patient Header
* **Laboratory Information**: Unipath Specialty Laboratory Ltd., Rajkot.
* **Registration / Specimen No**: `REG-2024-00123`
* **Dates**:
  * Registration Date: `07-Oct-2018 00:00`
  * Sample Collected On: `07-Oct-2018 11:05`
  * Report Generated Date: `07-Oct-2018`
* **Raw Name on Report**: `JANE DOE`
* **Normalized Person Name**: `Jane Doe` (Cleaned of titles, uppercasing, honorifics)
* **Demographics**: Age: `43`, Gender: `Female`
* **Referring Doctor / Location**: `DIRECTION HEALTH ADVERTISING @ RAJKOT`

### B. Complete Clinical Parameters Extracted by Category

#### 1. Complete Blood Count (CBC) (Specimen: EDTA Blood) - [Image 1]
| Parameter | Test Method | Result | Unit | Reference Range | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Hemoglobin | SLS method | **13.1** | g/dL | 12.0 - 15.0 | Normal |
| Hematocrit (PCV) | Ele. impedance | **39.7** | % | 36 - 46 | Normal |
| RBC Count | Ele. impedance | **4.72** | x10^12/L | 3.8 - 4.8 | Normal |
| WBC Count (Total Leukocyte) | Flowcytometry | **8300** | /cmm | 4000 - 10000 | Normal |
| Platelet Count | Ele. impedance | **314000** | /cmm | 150000 - 410000 | Normal |
| MCV | Calculated | **84.1** | fL | 83 - 101 | Normal |
| MCH | Calculated | **27.8** | pg | 27 - 32 | Normal |
| MCHC | Calculated | **33.0** | g/dL | 31.5 - 34.5 | Normal |
| RDW | Calculated | **13.3** | % | 11.5 - 14.5 | Normal |
| **Differential WBC** | | | | | |
| Neutrophils | Manual / Diff | **55** | % | 38 - 70 | Normal |
| Lymphocytes | Manual / Diff | **37** | % | 21 - 49 | Normal |
| Monocytes | Manual / Diff | **6** | % | 3 - 11 | Normal |
| Eosinophils | Manual / Diff | **2** | % | 0 - 7 | Normal |
| Basophils | Manual / Diff | **0** | % | 0 - 2 | Normal |
| **Red Cell Morphology & Smear** | Qualitative | Normocytic Normochromic, No parasites, Blasts absent | Text | Descriptive | Normal |

#### 2. Peripheral Blood Smear Examination - [Image 2]
| Observation | Finding | Clinical Assessment |
| :--- | :--- | :--- |
| RBC Morphology | RBC are normochromic normocytic | Normal |
| WBC Morphology | Total WBC & diff count within normal limit; no abnormal cells/blasts | Normal |
| Platelets | Adequate with normal morphology | Normal |
| Malarial Parasite | Not detected | Negative |

#### 3. Inflammatory & Metabolic Parameters - [Image 3]
| Parameter | Result | Unit | Reference Range | Status |
| :--- | :--- | :--- | :--- | :--- |
| ESR (Erythrocyte Sedimentation Rate) | **07** | mm/hr | 17-50 Yrs: < 12 | Normal |
| Fasting Plasma Glucose (Sugar) | **84** | mg/dL | Normal: <=99.0, Prediabetes: 100-125, Diabetes: >=126 | Normal |
| RA Factor (Rheumatoid Arthritis) | **2.39** | IU/mL | < 14 | Negative/Normal |
| Serum Calcium | **9.1** | mg/dL | 8.5 - 10.1 | Normal |
| Serum Phosphorous | **4.6** | mg/dL | 2.5 - 4.5 | **Elevated (High)** ⚠️ |

#### 4. Lipid Profile (Cardiovascular Risk Panel) - [Image 4]
| Parameter | Result | Unit | Reference Interval | Status |
| :--- | :--- | :--- | :--- | :--- |
| Serum Total Cholesterol | **157** | mg/dL | <200 Desirable, 200-239 Borderline, >=240 High | Desirable |
| Serum Triglycerides | **88** | mg/dL | <150 Normal, 150-199 Borderline, >=200 High | Normal |
| Serum VLDL | **17.60** | mg/dL | 0 - 30 | Normal |
| LDL Cholesterol | **89.40** | mg/dL | <100 Optimal, 100-129 Near Optimal, >=130 High | Optimal |
| HDL Cholesterol | **50** | mg/dL | <40 Low (High Risk), >=60 High (Low Risk) | Normal |
| Total Cholesterol / HDL Ratio | **3.14** | ratio | 0.0 - 3.5 | Normal |
| LDL / HDL Ratio | **1.79** | ratio | 1.0 - 3.4 | Normal |
| Total Lipid | **450.00** | mg/dL | 400 - 1000 | Normal |

#### 5. Liver Function Test & Protein Profile - [Image 5]
| Parameter | Result | Unit | Reference Interval | Status |
| :--- | :--- | :--- | :--- | :--- |
| Total Bilirubin | **0.705** | mg/dL | 0.2 - 1.0 | Normal |
| Direct Bilirubin | **0.113** | mg/dL | 0.0 - 0.2 | Normal |
| Indirect Bilirubin | **0.59** | mg/dL | Calculated | Normal |
| Total Protein | **8.2** | g/dL | 6.4 - 8.2 | Normal (Upper Bound) |
| Serum Albumin | **4.3** | g/dL | 3.4 - 5.0 | Normal |
| Serum Globulin | **3.90** | g/dL | 2.4 - 3.5 | **Elevated (High)** ⚠️ |
| Albumin / Globulin (A/G) Ratio | **1.10** | ratio | 1.2 - 2.2 | **Below Normal (Low)** ⚠️ |
| SGPT (ALT) | **25** | U/L | 14 - 59 | Normal |
| SGOT (AST) | **16** | U/L | 15 - 37 | Normal |
| GGT (Gamma GT) | **28** | U/L | 15 - 85 | Normal |
| Alkaline Phosphatase (ALP) | **67** | U/L | 46 - 116 | Normal |

---

## 4. Local Open-Source Python Extraction Architecture

### The Extraction Workflow:
```mermaid
flowchart TD
    A[Uploaded Image Photos] --> B[scripts/extract_report.py]
    B --> C[OpenCV & Pillow Preprocessing\n- EXIF Auto-Rotate\n- Grayscale & Contrast\n- Deskew & Denoise]
    C --> D[Tesseract OCR v5.5.3\nor EasyOCR Engine]
    D --> E[Structured Medical Parser\n- Header Extraction: Name, Age, Date\n- Tabular Line Parser: Param, Value, Unit, Ref Range]
    E --> F[Pydantic Clinical Model Validation]
    F --> G[JSON Output to Next.js API via stdout]
    G --> H[Interactive Client Review UI]
    H -->|User Confirms / Edits| I[(PostgreSQL via Prisma ORM)]
```

### Python Open-Source Libraries (`scripts/requirements.txt`):
```text
pytesseract>=0.3.10
pillow>=10.0.0
opencv-python-headless>=4.8.0
pydantic>=2.5.0
pdf2image>=1.17.0
```
*(All 100% open-source under Apache 2.0 / BSD / MIT, with zero paid APIs or cloud dependencies)*

---

## 5. Modern Production Folder Structure (Feature-First Architecture)

```text
medicare/
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema definition
│   └── seed.ts                    # Seed demo data for Jane Doe & sample vitals
├── scripts/
│   ├── extract_report.py          # 100% Open-source Python OCR & clinical table parser
│   └── requirements.txt           # Open-source Python dependencies
├── public/
│   └── uploads/                   # Uploaded report image storage
├── src/
│   ├── app/                       # Routing & Segments Only (Thin Wrappers)
│   │   ├── (dashboard)/           # Route group for main dashboard views
│   │   │   ├── page.tsx           # Home Dashboard: overview, scorecards, recent reports
│   │   │   ├── members/
│   │   │   │   ├── page.tsx       # Family directory
│   │   │   │   └── [id]/page.tsx  # Member profile & history
│   │   │   ├── reports/
│   │   │   │   ├── upload/page.tsx # Report upload & AI verification
│   │   │   │   └── [id]/page.tsx  # Report view & parameter breakdown
│   │   │   └── vitals/
│   │   │       └── page.tsx       # Daily BP & Blood Sugar timeline & analytics
│   │   ├── api/                   # Dedicated API Endpoints
│   │   │   └── reports/
│   │   │       └── extract/route.ts # Next.js bridge calling local Python script
│   │   ├── layout.tsx             # Root layout with Google Font 'Plus Jakarta Sans'
│   │   ├── globals.css            # Tailwind CSS v4 directives
│   │   └── providers.tsx          # Client context providers
│   │
│   ├── features/                  # Domain / Feature Modules
│   │   ├── members/               # Family Members Domain
│   │   │   ├── actions.ts         # Server Actions: createMember, updateMember, deleteMember
│   │   │   ├── components/        # MemberCard, MemberModal, MemberSwitcher
│   │   │   ├── services.ts        # getMembersWithLatestVitals, getMemberById
│   │   │   └── types.ts           # MemberFormValues, MemberWithStats
│   │   │
│   │   ├── reports/               # Medical Reports & Extraction Domain
│   │   │   ├── actions.ts         # Server Actions: saveVerifiedReport, deleteReport
│   │   │   ├── components/        # MultiPhotoDropzone, ExtractionReviewTable, ReportCard
│   │   │   ├── services.ts        # parseReportImages, normalizePatientName
│   │   │   └── types.ts           # ExtractedReportData, ClinicalParameter
│   │   │
│   │   ├── vitals/                # Daily Vitals (BP & Sugar) Domain
│   │   │   ├── actions.ts         # Server Actions: logDailyVital, deleteVital
│   │   │   ├── components/        # VitalsModal, VitalsQuickBadge, VitalsTimeline
│   │   │   ├── services.ts        # getVitalsHistory, calculateBPStage, calculateSugarStatus
│   │   │   └── types.ts           # BloodPressureLog, BloodSugarLog
│   │   │
│   │   └── analytics/             # Longitudinal Trends & Insights Domain
│   │       ├── components/        # VitalsTrendChart, ParameterTrendChart, AbnormalAlerts
│   │       ├── services.ts        # formatTimeSeriesData, computeTrendStats
│   │       └── types.ts           # TimeSeriesPoint, ParameterRange
│   │
│   ├── components/                # Shared / Cross-Feature UI Primitives
│   │   ├── ui/                    # Button, Dialog, Card, Badge, Input, Select, Tabs, Dropdown
│   │   └── layout/                # Navbar, Sidebar, PageHeader, Footer
│   │
│   ├── lib/                       # Global Utilities & Infrastructure
│   │   ├── db.ts                  # Prisma Client singleton for PostgreSQL pool
│   │   ├── python-runner.ts       # Subprocess runner executing scripts/extract_report.py
│   │   ├── name-normalizer.ts     # Title stripping, casing cleanup & fuzzy matching
│   │   └── utils.ts               # cn() helper, date formatters
│   │
│   └── types/                     # Shared Global TypeScript Definitions
│       └── index.ts               # Common utility types & DB entity extensions
│
├── .env.example                   # DATABASE_URL=postgresql://user:password@localhost:5432/medicare
├── next.config.ts                 # Next.js 15 configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript config with '@/*' path aliases
└── package.json                   # Dependencies managed with Bun
```

---

## 6. PostgreSQL Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model FamilyMember {
  id          String         @id @default(cuid())
  name        String         // Normalized person name e.g. "Jane Doe"
  aliases     String?        // Comma-separated: e.g. "Jane Doe, Jane"
  gender      String?        // "Female", "Male", "Other"
  dateOfBirth DateTime?
  ageYears    Int?           // Fallback when DOB is not specified
  bloodGroup  String?        // e.g. "B+", "O+", "A-"
  relation    String?        // "Mother", "Father", "Self", "Spouse", "Child"
  notes       String?
  avatarUrl   String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  reports     MedicalReport[]
  vitals      DailyVital[]

  @@index([name])
}

model MedicalReport {
  id              String             @id @default(cuid())
  familyMemberId  String
  familyMember    FamilyMember       @relation(fields: [familyMemberId], references: [id], onDelete: Cascade)
  
  title           String             // e.g. "Complete Blood Count & Liver Profile"
  labName         String?            // e.g. "Unipath Specialty Laboratory Ltd."
  registrationNo  String?            // e.g. "REG-2024-00123"
  reportDate      DateTime           // e.g. 2018-10-07
  collectionDate  DateTime?          // e.g. 2018-10-07 11:05
  doctorRef       String?            // Referring doctor / clinic
  rawPatientName  String?            // As printed on sheet: "JANE DOE"
  overallStatus   String?            // "NORMAL", "ATTENTION_NEEDED", "CRITICAL"
  notes           String?
  
  images          ReportImage[]
  parameters      ReportParameter[]
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([familyMemberId, reportDate])
}

model ReportImage {
  id          String        @id @default(cuid())
  reportId    String
  report      MedicalReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  imageUrl    String        // File URL or base64
  pageNumber  Int           @default(1)
  ocrStatus   String        @default("COMPLETED")
  createdAt   DateTime      @default(now())
}

model ReportParameter {
  id              String        @id @default(cuid())
  reportId        String
  report      MedicalReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  
  category        String        // e.g. "CBC", "Lipid Profile", "Liver Function", "Metabolic", "Smear"
  paramName       String        // e.g. "Hemoglobin", "Serum Globulin", "Fasting Glucose"
  paramSlug       String        // Standardized slug e.g. "hemoglobin", "globulin", "fasting_glucose"
  valueNumber     Float?        // 13.1, 3.90, 84
  valueText       String?       // "Normocytic Normochromic", "Negative"
  unit            String?       // "g/dL", "mg/dL", "U/L", "%", "/cmm"
  refMin          Float?        // 12.0
  refMax          Float?        // 15.0
  refText         String?       // "<200 Desirable", "Normal: <=99.0"
  status          String        // "NORMAL", "HIGH", "LOW", "BORDERLINE"
  clinicalMethod  String?       // e.g. "SLS method", "Hexokinase"

  createdAt       DateTime      @default(now())

  @@index([reportId, category])
  @@index([paramSlug])
}

model DailyVital {
  id              String       @id @default(cuid())
  familyMemberId  String
  familyMember    FamilyMember @relation(fields: [familyMemberId], references: [id], onDelete: Cascade)
  
  recordDate      DateTime     // Day/Time of vital measurement
  vitalType       String       // "BLOOD_PRESSURE" | "BLOOD_SUGAR"
  
  // Blood Pressure Details
  systolic        Int?         // mmHg
  diastolic       Int?         // mmHg
  pulseRate       Int?         // bpm
  
  // Blood Sugar Details
  sugarValue      Float?       // mg/dL
  sugarContext    String?      // "FASTING" | "POST_PRANDIAL" | "RANDOM" | "BEDTIME"
  
  notes           String?
  createdAt       DateTime     @default(now())

  @@index([familyMemberId, recordDate])
  @@index([vitalType])
}
```

---

## 7. Phased Execution Plan

1. **Phase 1: Project Scaffolding with Bun & Next.js 15 (100% FOSS)**
   - Initialize Next.js 15 with Bun, TypeScript, Tailwind CSS v4, Google Fonts (`Plus Jakarta Sans`), and Lucide icons.
   - Set up `prisma` with PostgreSQL provider (`@prisma/client`).
   - Create `.env` template for PostgreSQL `DATABASE_URL`.
   - Scaffold domain directories in `src/features/`.
2. **Phase 2: Local Open-Source Python OCR Script**
   - Write `scripts/requirements.txt` (`pytesseract`, `pillow`, `opencv-python-headless`, `pydantic`, `pdf2image`).
   - Write `scripts/extract_report.py` using local Tesseract 5.5.3 and clinical regex/table parsers to extract parameters and patient metadata.
   - Include pre-calibrated sample parser fallback based on the 5 Unipath test reports.
3. **Phase 3: Database & Family Member Module (`src/features/members`)**
   - Configure pooled connection singleton in `src/lib/db.ts`.
   - Seed database with Jane Doe and the 5-page Unipath test report parameters.
   - Implement family members list, profile view, member switcher, and CRUD Server Actions.
4. **Phase 4: Multi-Photo Report Upload & Extraction UI (`src/features/reports`)**
   - Drag-and-drop file upload supporting single or multiple camera photos / PDF.
   - API route `/api/reports/extract` calling Python OCR engine.
   - Name normalizer matching report patient names to family member profiles.
   - Interactive review table to preview and adjust extracted parameters before saving.
5. **Phase 5: Daily Vitals Modal & Manual Logger (`src/features/vitals`)**
   - Floating "+ Log Vitals" modal for direct BP & Sugar recording.
   - Instant clinical status feedback (Normal, Stage 1/2 Hypertension, Prediabetes, etc.).
   - Direct Server Action saving into PostgreSQL.
6. **Phase 6: Longitudinal Analytics & Health Charts (`src/features/analytics`)**
   - Recharts visual graphs for BP trends, Blood Sugar history, and recurring lab metrics.
   - Abnormal values summary highlighting flagged parameters.
