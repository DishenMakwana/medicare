# Dependencies Specification

## Package Manager
- **Runtime & PM**: Bun (`bun@1.4.0`)

## Production Dependencies
- **`next`** (`16.3.7`): React framework with App Router, Turbopack/Webpack, Server Actions.
- **`react`** (`19.2.8`) & **`react-dom`** (`19.2.8`): Core UI library with Server Components support.
- **`@prisma/client`** (`^6.19.3`): Database client for PostgreSQL.
- **`lucide-react`** (`^1.49.0`): Clean modern UI icons.
- **`recharts`** (`^3.10.1`): Declarative SVG charts for daily vital trends.

## Development Dependencies
- **`prisma`** (`^6.19.3`): Prisma CLI for migrations, schema generation, and seeding.
- **`typescript`** (`^5.9.3`): Static typing.
- **`tailwindcss`** (`^4.3.3`) & **`@tailwindcss/postcss`** (`^4.3.3`): CSS-first design system.
- **`eslint`** (`^9.39.5`) & **`eslint-config-next`** (`16.3.7`): Code linting.
- **`prettier`** (`^3.9.9`): Code formatting.
- **`knip`**: Dead code, unused exports, and unused dependencies detector.

## System & External Dependencies
- **Python 3**: Local runtime for running `scripts/extract_report.py`.
- **`tesseract-ocr`**: Optical character recognition engine.
- **`poppler` / `pdftoppm`**: Utility for converting PDF pages into images for OCR.
- **Python libraries** (`scripts/requirements.txt`):
  - `pytesseract`
  - `pdf2image`
  - `pillow`
