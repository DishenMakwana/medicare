# API Contracts Specification

## Endpoints

### 1. `GET /api/members`
- **Description**: Returns all registered family members.
- **Headers**: `Cache-Control: no-store, no-cache, must-revalidate`
- **Response**:
  ```json
  {
    "members": [
      {
        "id": 1,
        "customId": "member-1",
        "name": "Jane Doe",
        "gender": "Female",
        "relation": "Mother",
        "ageYears": 58,
        "reports": [],
        "vitals": []
      }
    ]
  }
  ```

### 2. `POST /api/members`
- **Description**: Creates a new family member record.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "gender": "Male",
    "relation": "Father",
    "dateOfBirth": "1965-04-12",
    "ageYears": 61,
    "bloodGroup": "O+"
  }
  ```
- **Response**: `{ "member": { ... } }`

### 3. `POST /api/reports/extract`
- **Description**: Ingests multi-page PDF documents or medical scan photos and runs the local Python OCR engine.
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `files`: File[] (Image files or PDF document)
- **Response**:
  ```json
  {
    "raw_patient_name": "JOHN DOE",
    "clean_patient_name": "John Doe",
    "age": 61,
    "gender": "Male",
    "lab_name": "Apollo Diagnostics",
    "report_date": "2026-03-15",
    "parameters": [
      {
        "category": "Complete Blood Count",
        "param_name": "Hemoglobin",
        "param_slug": "hemoglobin",
        "value_number": 14.2,
        "unit": "g/dL",
        "ref_min": 13.0,
        "ref_max": 17.0,
        "status": "NORMAL"
      }
    ],
    "pagesSummary": [
      {
        "pageNumber": 1,
        "status": "SUCCESS",
        "paramCount": 12,
        "unparsedLines": []
      }
    ]
  }
  ```
