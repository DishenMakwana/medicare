"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { cleanPersonName } from "@/lib/name-normalizer";

export async function createFamilyMember(formData: {
  name: string;
  aliases?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  ageYears?: number;
  bloodGroup?: string;
  relation?: string;
  notes?: string;
}) {
  const originalName = (formData.name || "").trim();
  const cleanedName = cleanPersonName(originalName);

  // Preserve original entered name in aliases for search / matching
  const aliasList = formData.aliases
    ? formData.aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
  if (
    originalName &&
    originalName.toLowerCase() !== cleanedName.toLowerCase() &&
    !aliasList.includes(originalName)
  ) {
    aliasList.unshift(originalName);
  }

  const created = await db.createMember({
    ...formData,
    name: cleanedName,
    aliases: aliasList.join(", ") || undefined,
  });
  revalidatePath("/");
  revalidatePath("/members");
  return created;
}
