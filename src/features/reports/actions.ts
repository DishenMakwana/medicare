"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveVerifiedReport(reportData: {
  familyMemberId: string | number;
  title: string;
  labName?: string | null;
  registrationNo?: string | null;
  reportDate: string;
  collectionDate?: string | null;
  doctorRef?: string | null;
  rawPatientName?: string | null;
  overallStatus?: string | null;
  notes?: string | null;
  images?: Array<{ imageUrl: string; pageNumber: number }>;
  parameters: Array<{
    category: string;
    paramName: string;
    paramSlug: string;
    valueNumber?: number | null;
    valueText?: string | null;
    unit?: string | null;
    refMin?: number | null;
    refMax?: number | null;
    refText?: string | null;
    status: string;
    clinicalMethod?: string | null;
  }>;
}) {
  const saved = await db.createReport({
    ...reportData,
    reportDate: new Date(reportData.reportDate),
    collectionDate: reportData.collectionDate
      ? new Date(reportData.collectionDate)
      : null,
  });

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath(`/members/${reportData.familyMemberId}`);
  return saved;
}

export async function getMedicalReports() {
  return await db.getReports();
}

export async function getMedicalReport(id: string | number) {
  return await db.getReportById(id);
}

export async function deleteReportImageAction(
  imageId: string | number,
  reportId: string | number,
) {
  const result = await db.deleteReportImage(imageId);
  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports");
  revalidatePath("/");
  return result;
}

export async function deleteReportAction(
  reportId: string | number,
  memberId?: string | number,
) {
  const result = await db.deleteReport(reportId);
  revalidatePath("/reports");
  revalidatePath("/");
  if (memberId) {
    revalidatePath(`/members/${memberId}`);
  }
  return result;
}

export async function getTestPresetsAction(labName?: string | null) {
  return await db.getTestPresets(labName);
}

export async function saveTestPresetAction(presetData: {
  labName?: string | null;
  name: string;
  category: string;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  refText?: string | null;
  clinicalMethod?: string | null;
}) {
  return await db.upsertTestPreset(presetData);
}

export async function updateTestPresetByIdAction(payload: {
  presetId: number;
  reportId: number | string;
  reportParameterId?: number | string;
  data: {
    name: string;
    category: string;
    unit?: string | null;
    refMin?: number | null;
    refMax?: number | null;
    refText?: string | null;
    clinicalMethod?: string | null;
    valueNumber?: number | null;
    valueText?: string | null;
  };
}) {
  const updatedPreset = await db.updateTestPresetById(
    Number(payload.presetId),
    payload.data,
  );

  if (payload.reportParameterId) {
    await db.syncReportParameterWithPreset(
      Number(payload.reportParameterId),
      payload.data,
    );
  }

  revalidatePath(`/reports/${payload.reportId}`);
  revalidatePath("/reports");
  revalidatePath("/");
  return { success: true, preset: updatedPreset };
}

