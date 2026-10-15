import type { TestPreset } from "./models";

// ----------------------------------------------------
// OCR & Medical Report Extraction Domain Types
// ----------------------------------------------------

export interface ExtractedReportParameter {
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
}

export interface ExtractedReportPage {
  page_number: number;
  image_filename: string;
  image_path?: string | null;
  raw_text?: string;
  parameters: ExtractedReportParameter[];
  unparsed_lines?: string[];
  non_preset_lines?: string[];
  extraction_quality?: string;
  test_preset_quality?: "COMPLETE" | "PARTIAL" | "EMPTY";
  non_preset_quality?: "CLEAN" | "NARRATIVE_NOTES" | "UNPARSED_LINES" | "NONE";
}

export interface PageExtractionSummary {
  pageNumber: number;
  paramCount: number;
  status: "SUCCESS" | "WARNING" | "EMPTY" | "OPTIMAL" | "FLAGGED";
  extractionQuality?: string;
  testPresetStatus?: string;
  nonPresetStatus?: string;
  nonPresetLines?: string[];
  extractedParams?: string[];
  unparsedLines?: string[];
  errorReason?: string;
  imageUrl?: string;
  fileName?: string;
}

export interface PageInspectImage {
  id?: string | number;
  imageUrl: string;
  pageNumber: number;
  ocrStatus?: string;
  extractionQuality?: string;
  testPresetStatus?: string;
  nonPresetStatus?: string;
  unparsedLines?: string[];
  nonPresetLines?: string[];
  rawText?: string;
  raw_text?: string;
}

export interface PageInspectParameter {
  id?: number | string;
  category: string;
  paramName?: string;
  param_name?: string;
  paramSlug?: string;
  param_slug?: string;
  valueNumber?: number | null;
  value_number?: number | null;
  valueText?: string | null;
  value_text?: string | null;
  unit?: string | null;
  refMin?: number | null;
  ref_min?: number | null;
  refMax?: number | null;
  ref_max?: number | null;
  refText?: string | null;
  ref_text?: string | null;
  status?: string;
  clinicalMethod?: string | null;
  clinical_method?: string | null;
  sourcePage?: number | null;
  source_page?: number | null;
  is_incomplete?: boolean;
  testPresetId?: number | null;
  test_preset_id?: number | null;
  testPreset?: TestPreset | null;
}

export interface ImageToDelete {
  image: PageInspectImage;
  index: number;
}

export interface ParamToDelete {
  param: PageInspectParameter;
  originalIndex?: number;
  index?: number;
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
  doctor_ref?: string | null;
  raw_text?: string | null;
  images?: PageInspectImage[];
  pagesSummary?: PageExtractionSummary[];
  hasIncompleteExtraction?: boolean;
  unparsed_lines?: string[];
  non_preset_lines?: string[];
  extraction_quality?: string;
  test_preset_quality?: "COMPLETE" | "PARTIAL" | "EMPTY";
  non_preset_quality?: "CLEAN" | "NARRATIVE_NOTES" | "UNPARSED_LINES" | "NONE";
  is_pdf?: boolean;
  pdf_pages?: ExtractedReportPage[];
  parameters: ExtractedReportParameter[];
}
