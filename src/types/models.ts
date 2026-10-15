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
  familyMemberId?: number | string;
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
  parameters?: ReportParameter[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  vitalType: "BLOOD_PRESSURE" | "BLOOD_SUGAR" | string;
  systolic?: number | null;
  diastolic?: number | null;
  pulseRate?: number | null;
  sugarValue?: number | null;
  sugarContext?:
    "FASTING" | "POST_PRANDIAL" | "RANDOM" | "BEDTIME" | string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export type CachedData =
  | FamilyMember[]
  | FamilyMember
  | MedicalReport[]
  | MedicalReport
  | DailyVital[]
  | DailyVital
  | TestPreset[]
  | TestPreset
  | null;

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
