"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logDailyVital(data: {
  familyMemberId: string | number;
  recordDate: string;
  vitalType: "BLOOD_PRESSURE" | "BLOOD_SUGAR";
  systolic?: number;
  diastolic?: number;
  pulseRate?: number;
  sugarValue?: number;
  sugarContext?: string;
  notes?: string;
}) {
  const vital = await db.logVital({
    familyMemberId: data.familyMemberId,
    recordDate: new Date(data.recordDate),
    vitalType: data.vitalType,
    systolic: data.systolic ? Number(data.systolic) : undefined,
    diastolic: data.diastolic ? Number(data.diastolic) : undefined,
    pulseRate: data.pulseRate ? Number(data.pulseRate) : undefined,
    sugarValue: data.sugarValue ? Number(data.sugarValue) : undefined,
    sugarContext: data.sugarContext,
    notes: data.notes,
  });

  revalidatePath("/");
  revalidatePath("/vitals");
  revalidatePath(`/members/${data.familyMemberId}`);
  return vital;
}

export async function getVitals(familyMemberId?: string | number) {
  return await db.getVitals(familyMemberId);
}
