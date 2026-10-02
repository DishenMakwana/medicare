# Medicare - Family Health Vault & Medical Report Intelligence System

Medicare is a modern, privacy-first **Family Health Vault & Medical Diagnostics Platform**. It allows families to store, organize, and analyze clinical laboratory reports, track daily vitals (Blood Pressure, Blood Sugar), and visualize biomarker trends over time.

Featuring a **100% local, open-source OCR and clinical parameter extraction engine** powered by Python and Tesseract OCR, Medicare parses complex multi-page laboratory report images without sending sensitive health records to third-party cloud AI APIs.

---

## Key Features

- **Multi-Page Medical Report Upload & Ingestion**:
  - Drag-and-drop multiple high-resolution photos or scans (JPG, PNG, PDF).
  - Page-by-page inspection modal with zoom, rotation, and side-by-side extraction verification.
  - Extraction quality indicators (`COMPLETE`, `PARTIAL`, `EMPTY`).

- **Open-Source Local Clinical OCR Engine**:
  - Zero external cloud AI API dependencies; runs entirely on your local machine or private server.
  - Automatic noise filtering (stamps, signatures, hospital banners, disclaimers).
  - Robust regex and NLP pattern recognition for:
    - **Complete Blood Count (CBC)**: Hemoglobin, Hematocrit (PCV), RBC Count, WBC Count, Platelet Count, MCV, MCH, MCHC, RDW, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils.
    - **Liver Function Tests (LFT)**: Total Bilirubin, Direct Bilirubin, Indirect Bilirubin, Total Protein, Albumin, Globulin, A/G Ratio, SGPT (ALT), SGOT (AST), GGT, Alkaline Phosphatase.
    - **Lipid Profile**: Total Cholesterol, Triglycerides, HDL, LDL, VLDL, Total Lipid, Chol/HDL Ratio, LDL/HDL Ratio.
    - **Renal & Kidney Function (KFT)**: Serum Creatinine, Uric Acid, Serum Urea, Blood Urea Nitrogen (BUN).
    - **Thyroid Profile**: T3, T4, TSH.
    - **Vitamins & Micronutrients**: 25-OH Vitamin D, Vitamin B12.
    - **Metabolic & Inflammatory**: Fasting Plasma Glucose, ESR, RA Factor, Calcium, Phosphorous.
    - **Urine Routine & Microscopic**: Physical (Colour, Odour, Clarity), Chemical (pH, Specific Gravity, Protein, Glucose, Ketone, Bilirubin, Nitrite, Leucocytes, Blood), Microscopic (Pus Cells, RBC, Casts, Crystals, Epithelial Cells).
    - **Peripheral Blood Smear**: RBC/WBC morphology, Platelet adequacy, Malarial parasites.

- **Biomarker Range Visualizer**:
  - Interactive, color-coded horizontal range bars for every biomarker.
  - Instant classification into `NORMAL`, `LOW`, `HIGH`, `BORDERLINE`, or `CRITICAL`.
  - Reference interval display with clinical testing methods (e.g., *Hexokinase*, *Diazo*, *SLS*).

- **Family Member Health Profiles**:
  - Create profiles with age, gender, blood group, relationships, and medical notes.
  - Smart Name Normalizer: Cleans titles, honorifics, and suffixes to automatically match uploaded reports to family members.

- **Daily Vitals Tracking & Analytics**:
  - Log Blood Pressure (Systolic, Diastolic, Pulse) and Blood Sugar (Fasting, Post-Prandial, Random, Bedtime).
  - Interactive Recharts trend charts with reference zones and historical logs.

- **Dynamic Test Presets & Biomarker Catalog**:
  - Preloaded with standard clinical reference ranges.
  - Automatically captures and saves newly discovered lab tests and custom ranges to the database.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **UI Library** | React 19, [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons & Charts** | [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/) |
| **ORM & Database** | [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/) |
| **OCR & Processing** | Python 3, [Tesseract OCR](https://github.com/tesseract-ocr/tesseract), Pillow (PIL), NumPy |
| **Package Manager** | [Bun](https://bun.sh/) (or Node.js / npm / pnpm) |

---

## Prerequisites

Before setting up Medicare, ensure the following software is installed on your system:

1. **Node.js** (v18.18+ or v20+) OR **Bun** (v1.1+)
2. **PostgreSQL** (v14+ running locally or a hosted instance like Neon / Supabase)
3. **Python 3** (v3.10+ with `venv`)
4. **Tesseract OCR Engine**:
   - **macOS (Homebrew)**:
     ```bash
     brew install tesseract
     ```
   - **Ubuntu / Debian**:
     ```bash
     sudo apt-get update
     sudo apt-get install -y tesseract-ocr libtesseract-dev
     ```
   - **Windows**:
     - Download and install the Windows installer from [UB-Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki).
     - Add `C:\Program Files\Tesseract-OCR` to your system `PATH`.

---

## Project Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/medicare.git
cd medicare
```

### 2. Install JavaScript Dependencies
Using **Bun** (recommended):
```bash
bun install
```
*Or using npm / pnpm:*
```bash
npm install
```

### 3. Setup Python Virtual Environment
Medicare uses a local virtual environment (`.venv`) for isolated, reproducible OCR processing:

```bash
# Create virtual environment inside the project root
python3 -m venv .venv

# Activate virtual environment
# macOS / Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

# Install required Python dependencies
pip install -r scripts/requirements.txt
```

Verify your Python OCR environment:
```bash
python3 scripts/extract_report.py
# Should output: {"error": "No image path provided"}
```

### 4. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```

Open `.env` and set your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/medicare?schema=public"
```

---

## Prisma ORM Commands Guide

Medicare uses [Prisma](https://www.prisma.io/) to manage database schemas, migrations, and typesafe queries.

### Generate Prisma Client
Whenever you update `prisma/schema.prisma` or install dependencies:
```bash
bun run prisma generate
# or: npx prisma generate
```

### Run Database Migrations
Apply existing migrations to your PostgreSQL database:
```bash
bun run prisma migrate dev
# or: npx prisma migrate dev
```
To run migrations in production / CI:
```bash
bun run prisma migrate deploy
# or: npx prisma migrate deploy
```

### Push Schema Without Migrations (Prototyping)
To sync your schema directly to the database without creating a migration file:
```bash
bun run prisma db push
# or: npx prisma db push
```

### Seed the Database
Populate standard biomarker reference presets:
```bash
bun run prisma db seed
# or: npx prisma db seed
```

### Open Prisma Studio (Database GUI)
Prisma Studio provides a browser-based interface to view and edit tables:
```bash
bun run prisma studio
# or: npx prisma studio
```
Access Prisma Studio at [http://localhost:5555](http://localhost:5555).

### Format and Validate Schema
```bash
bun run prisma format
bun run prisma validate
```

---

## Running the Application

### Development Server
```bash
bun dev
# or: npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Lint, format check, and compile Next.js
bun run build
# or: npm run build

# Start production server
bun start
# or: npm run start
```

---

## Project Structure

```
medicare/
├── docs/                      # Architectural plans and specifications
├── prisma/
│   ├── schema.prisma          # Database schema (FamilyMember, MedicalReport, ReportParameter, etc.)
│   ├── migrations/            # SQL migration history
│   └── seed.ts                # Database seed script for test presets
├── public/
│   └── uploads/               # Local storage directory for user-uploaded reports (.gitkeep)
├── scripts/
│   ├── extract_report.py      # Core Python OCR extraction & clinical regex engine
│   ├── requirements.txt       # Python dependencies (pytesseract, Pillow, pydantic)
│   └── clear_database.ts      # Utility script to wipe all test database records
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── api/
│   │   │   ├── members/       # Family member REST endpoints
│   │   │   └── reports/       # Report extraction endpoint (/api/reports/extract)
│   │   ├── members/           # Family members dashboard & profile views
│   │   ├── reports/           # Medical reports vault, detail view & multi-photo upload
│   │   ├── vitals/            # Blood pressure & blood sugar tracking dashboard
│   │   ├── layout.tsx         # Global layout with navigation
│   │   └── page.tsx           # Main overview dashboard
│   ├── components/            # Reusable UI components (Navbar, RangeBar, StatCard, Modals)
│   ├── features/              # Modular domain features (members, reports, vitals, analytics)
│   ├── lib/
│   │   ├── db.ts              # Unified Prisma database service
│   │   ├── name-normalizer.ts # Intelligent person name normalizer & fuzzy matcher
│   │   ├── python-runner.ts   # Node.js child-process wrapper for Python OCR engine
│   │   ├── seed-data.ts       # Standard clinical biomarker presets catalog
│   │   └── utils.ts           # Clinical formatting & calculation helpers
│   └── types/                 # Shared TypeScript interfaces and types
├── .env.example               # Example environment configuration
├── package.json               # NPM scripts and dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## Privacy & Security

- **Local Data Storage**: Medical images and reports uploaded to Medicare reside in your configured PostgreSQL database and local storage.
- **No Third-Party AI Data Leakage**: OCR parsing runs locally via Tesseract without sending image payloads to OpenAI, Google Vision, AWS Textract, or any external cloud service.
- **Git Safety**: The `.gitignore` file excludes `.env`, `public/uploads/*`, `.venv`, and temporary artifacts so no private patient files or credentials are ever pushed to GitHub.

---

## License

This project is licensed under the [MIT License](LICENSE).
