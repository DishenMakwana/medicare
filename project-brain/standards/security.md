# Security Standards

## Guidelines
1. **Medical Data Privacy**:
   - Patient clinical records, biomarker values, and vitals are sensitive personal health information.
   - All OCR and data processing must remain 100% local (no third-party cloud OCR APIs sending patient documents outside).
2. **File Upload Security**:
   - Only allow safe document MIME types (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
   - Validate file signatures and extensions before processing.
   - Clean and sanitize uploaded filenames before writing to `public/uploads/` to prevent path traversal (`../`).
3. **Database Security**:
   - Use Prisma parameterized queries exclusively; no raw concatenated SQL strings.
   - Cascade delete child records (report images, report parameters) when a parent report or member is deleted.
   - Clean up physical disk image files whenever database records are removed.
4. **Input Validation**:
   - Validate numerical parameters (systolic, diastolic, blood sugar, reference ranges) to ensure they are within plausible clinical ranges.
