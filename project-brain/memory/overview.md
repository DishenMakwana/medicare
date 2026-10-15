# Medicare - System Overview

## Vision & Purpose
**MediCare** is a private, family-oriented medical vault and health analytics platform designed to consolidate family health records, laboratory test reports, and daily physiological telemetry (blood pressure and blood sugar) into a single, cohesive local-first dashboard.

### Key Pillars
1. **Multi-Member Health Profiles**:
   - Manage distinct health profiles for family members (Self, Spouse, Mother, Father, Child, etc.) with blood group, age, date of birth, and clinical notes.
2. **Medical Report Vault**:
   - Ingest laboratory reports via multi-image uploads (photos/scans) or multi-page PDF documents.
   - Run 100% free, local Python OCR (Tesseract + pdf2image) to extract patient metadata, lab name, dates, and individual clinical biomarkers with reference ranges.
3. **Clinical Test Presets & Biomarker Intelligence**:
   - Automated matching of extracted parameters against a clinical knowledge base of ~50+ standard lab tests (CBC, Lipid Panel, Metabolic, Thyroid, Liver Function, Diabetic, Vitamins).
   - Highlighting out-of-range clinical parameters (`HIGH`, `LOW`, `ABNORMAL`, `OPTIMAL`) with visual range bars.
4. **Daily Vitals Telemetry**:
   - Dedicated logging for daily Blood Pressure (Systolic, Diastolic, Pulse) and Blood Sugar (Fasting, Post-Prandial, Random, Bedtime).
   - Interactive trend analytics, 7-day rolling averages, and out-of-range risk indicators.
5. **High-Performance Architecture**:
   - Multi-tier in-memory caching with cross-process epoch synchronization (`.cache-timestamp`) and parallel database execution (`Promise.all`).

## Tech Stack Summary
- **Frontend / Framework**: Next.js 16.3.7 (App Router), React 19.2.8, Tailwind CSS v4.3.3.
- **Icons & Visualization**: Lucide React 1.49, Recharts 3.10.1.
- **Database / ORM**: PostgreSQL via Prisma ORM 6.19.3.
- **OCR Engine**: Python 3 (PyTesseract, pdf2image, Pillow) executed locally via `scripts/extract_report.py`.
- **Runtime & Package Manager**: Bun 1.4.0.
