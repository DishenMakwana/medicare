import { LucideIcon } from "lucide-react";
import { FamilyMember, MedicalReport, DailyVital, TestPreset } from "./index";

// ----------------------------------------------------
// UI Primitives & Layout
// ----------------------------------------------------

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    color: string;
  };
  className?: string;
}

export interface RangeBarProps {
  value?: number | null;
  min?: number | null;
  max?: number | null;
  unit?: string | null;
  status?: string;
  className?: string;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  previewImageUrl?: string | null;
  itemBadge?: string | null;
  isDestructive?: boolean;
}

export interface NavbarProps {
  members?: FamilyMember[];
}

export interface RefreshCacheButtonProps {
  className?: string;
  onSuccess?: () => void;
}

// ----------------------------------------------------
// Members Feature Components
// ----------------------------------------------------

export interface MemberCardProps {
  member: FamilyMember;
}

export interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdMember?: FamilyMember) => void;
  initialName?: string;
  initialGender?: string;
  initialDateOfBirth?: string;
  initialAgeYears?: number | string;
  initialAliases?: string;
  initialRelation?: string;
}

export interface MembersListClientProps {
  initialMembers: FamilyMember[];
}

export interface MemberProfileClientProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
}

export interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

// ----------------------------------------------------
// Reports Feature Components
// ----------------------------------------------------

export interface ReportCardProps {
  report: MedicalReport;
}

export interface ReportsVaultClientProps {
  reports: MedicalReport[];
  members: FamilyMember[];
}

export interface ReportDetailClientProps {
  report: MedicalReport;
}

export interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export interface ReportUploadClientProps {
  initialMembers: FamilyMember[];
}

export interface MultiPhotoDropzoneProps {
  onExtractionComplete: (data: any) => void;
}

export interface ExtractionReviewTableProps {
  extractedData: any;
  members: FamilyMember[];
  onReset: () => void;
}

export interface PageInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    id?: string | number;
    imageUrl: string;
    pageNumber?: number;
    unparsedLines?: string[];
    nonPresetLines?: string[];
    ocrStatus?: string;
    extractionQuality?: string;
    testPresetStatus?: string;
    nonPresetStatus?: string;
  }>;
  initialPageIndex?: number;
  initialTab?: "ADD_TEST" | "VIEW_TESTS";
  parameters: Array<{
    category?: string;
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
    id?: string | number;
    testPresetId?: number | null;
    test_preset_id?: number | null;
    testPreset?: TestPreset | null;
  }>;
  existingCategories?: string[];
  labName?: string | null;
  reportLabName?: string | null;
  reportDate?: string | Date;
  patientName?: string;
  doctorRef?: string | null;
  onAddParameter?: (newParam: any) => void;
  onUpdateParameter?: (index: number, updatedParam: any) => void;
  onDeleteParameter?: (index: number) => void;
}

// ----------------------------------------------------
// Vitals & Analytics Feature Components
// ----------------------------------------------------

export interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  defaultMemberId?: string | number;
}

export interface VitalsDashboardClientProps {
  vitals: DailyVital[];
  members: FamilyMember[];
}

export interface VitalsTrendChartProps {
  vitals: DailyVital[];
}

// ----------------------------------------------------
// Component State, Filter & Cache Primitives
// ----------------------------------------------------

export type ReportStatusFilterType = "ALL" | "FLAGGED" | "OPTIMAL";
export type VitalTypeFilter = "ALL" | "BLOOD_PRESSURE" | "BLOOD_SUGAR";
export type InspectModalTabType = "ADD_TEST" | "VIEW_TESTS";

export interface Point2D {
  x: number;
  y: number;
}

export interface ImageToDelete {
  image: any;
  index: number;
}

export interface ParamToDelete {
  param: any;
  originalIndex?: number;
  index?: number;
}

export interface CacheEntry<T> {
  data: T;
  created: number;
  expiry: number;
}
