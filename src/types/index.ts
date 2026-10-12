export interface FamilyMember {
  id: number | string;
  customId?: string | null;
  name: string;
  aliases?: string | null;
  gender?: string | null;
  dateOfBirth?: string | Date | null;
  ageYears?: number | null;
  bloodGroup?: string | null;
  relation?: string | null;
  notes?: string | null;
  avatarUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  reports?: MedicalReport[];
  vitals?: DailyVital[];
}

export interface MedicalReport {
  id: number | string;
  customId?: string | null;
  familyMemberId: number | string;
  familyMember?: FamilyMember;
  title: string;
  labName?: string | null;
  registrationNo?: string | null;
  reportDate: string | Date;
  collectionDate?: string | Date | null;
  doctorRef?: string | null;
  rawPatientName?: string | null;
  overallStatus?: "NORMAL" | "ATTENTION_NEEDED" | "CRITICAL" | string | null;
  notes?: string | null;
  images?: ReportImage[];
  parameters: ReportParameter[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ReportImage {
  id: number | string;
  customId?: string | null;
  reportId: number | string;
  imageUrl: string;
  pageNumber: number;
  ocrStatus: string;
  createdAt?: string | Date;
}

export interface ReportParameter {
  id: number | string;
  customId?: string | null;
  reportId?: number | string;
  testPresetId?: number | null;
  testPreset?: TestPreset | null;
  category: string;
  paramName: string;
  paramSlug: string;
  valueNumber?: number | null;
  valueText?: string | null;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  refText?: string | null;
  status: "NORMAL" | "HIGH" | "LOW" | "BORDERLINE" | string;
  clinicalMethod?: string | null;
  createdAt?: string | Date;
}

export interface DailyVital {
  id: number | string;
  customId?: string | null;
  familyMemberId: number | string;
  familyMember?: FamilyMember;
  recordDate: string | Date;
  vitalType: "BLOOD_PRESSURE" | "BLOOD_SUGAR";
  systolic?: number | null;
  diastolic?: number | null;
  pulseRate?: number | null;
  sugarValue?: number | null;
  sugarContext?:
    "FASTING" | "POST_PRANDIAL" | "RANDOM" | "BEDTIME" | string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface PageExtractionSummary {
  pageNumber: number;
  imageUrl: string;
  fileName: string;
  paramCount: number;
  status: "SUCCESS" | "WARNING" | "EMPTY";
  extractionQuality?: "COMPLETE" | "PARTIAL" | "EMPTY" | string;
  extractedParams?: string[];
  unparsedLines?: string[];
  errorReason?: string;
}

export interface ExtractedReportResult {
  raw_patient_name: string;
  clean_patient_name: string;
  age?: number | null;
  gender?: string | null;
  lab_name?: string | null;
  registration_no?: string | null;
  report_date?: string | null;
  collection_date?: string | null;
  raw_text?: string | null;
  pagesSummary?: PageExtractionSummary[];
  hasIncompleteExtraction?: boolean;
  unparsed_lines?: string[];
  extraction_quality?: string;
  parameters: Array<{
    category: string;
    param_name: string;
    param_slug: string;
    value_number?: number | null;
    value_text?: string | null;
    unit?: string | null;
    ref_min?: number | null;
    ref_max?: number | null;
    ref_text?: string | null;
    status: string;
    clinical_method?: string | null;
    source_page?: number | null;
    is_incomplete?: boolean;
  }>;
}

export interface TestPreset {
  id: number | string;
  customId?: string | null;
  labName?: string | null;
  name: string;
  category: string;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  refText?: string | null;
  clinicalMethod?: string | null;
  source?: "SYSTEM_DEFAULT" | "UPLOADED_REPORT" | "MANUAL" | string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
