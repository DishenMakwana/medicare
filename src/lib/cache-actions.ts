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
    return { success: true, timestamp: Date.now() };
  } catch (err: any) {
    console.error("[Cache] Failed to clear server caches:", err);
    return {
      success: false,
      error: err?.message || "Failed to clear caches",
      timestamp: Date.now(),
    };
  }
}
