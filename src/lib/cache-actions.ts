"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

/**
 * Server action to purge in-memory DB cache and revalidate all Next.js cached pages/layouts
 */
export async function clearAllCachesAction() {
  try {
    db.clearCache();
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/members");
    revalidatePath("/reports");
    revalidatePath("/vitals");
    revalidatePath("/reports/upload");
    return { success: true, timestamp: Date.now() };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to clear caches";
    console.error("[Cache] Failed to clear server caches:", err);
    return {
      success: false,
      error: message,
      timestamp: Date.now(),
    };
  }
}
