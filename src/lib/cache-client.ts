import { clearAllCachesAction } from "./cache-actions";

/**
 * Common function to clean all backend/database caches and refresh active data on UI.
 *
 * @param onRefreshOptional - Optional callback to trigger router.refresh() or local state updates.
 * @returns Promise resolving to boolean indicating success.
 */
export async function refreshAppCaches(
  onRefreshOptional?: () => void,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await clearAllCachesAction();
    if (result.success && onRefreshOptional) {
      onRefreshOptional();
    }
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to refresh caches";
    console.error("[CacheClient] Error executing refreshAppCaches:", err);
    return {
      success: false,
      error: message,
    };
  }
}
