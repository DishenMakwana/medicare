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
  const enteredName = (formData.name || "").trim();
  if (!enteredName) {
    throw new Error("Member name is required.");
  }

  // Derive normalized alias for OCR matching (e.g. Muktaben -> Mukta)
  const normalizedAlias = cleanPersonName(enteredName);

  const aliasSet = new Set<string>();
  if (formData.aliases) {
    formData.aliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
      .forEach((a) => aliasSet.add(a));
  }

  // Preserve both the entered name and normalized variant in aliases for OCR matching
  if (
    normalizedAlias &&
    normalizedAlias.toLowerCase() !== enteredName.toLowerCase()
  ) {
    aliasSet.add(normalizedAlias);
  }
  if (enteredName) {
    aliasSet.add(enteredName);
  }

  const created = await db.createMember({
    ...formData,
    name: enteredName, // Keep exact entered name for UI display & DB storage
    aliases: Array.from(aliasSet).join(", ") || undefined,
  });

  db.clearCache();

  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/members");
    revalidatePath("/reports");
    revalidatePath("/vitals");
  } catch {
    // Gracefully continue outside Next.js request context
  }

  return created;
}
