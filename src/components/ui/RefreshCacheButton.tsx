"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";
import { refreshAppCaches } from "@/lib/cache-client";
import type { RefreshCacheButtonProps } from "@/types";

export function RefreshCacheButton({
  className = "",
  onSuccess,
}: RefreshCacheButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  async function handleRefresh() {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const result = await refreshAppCaches();

      if (result.success) {
        setJustRefreshed(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("medicare:cache-refreshed"));
        }
        if (onSuccess) onSuccess();
        router.refresh();
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }, 350);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  const stateStyles = justRefreshed
    ? "bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-xs"
    : isRefreshing
      ? "bg-teal-50 text-teal-700 border-teal-200/90 shadow-xs"
      : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs";

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Clear all database & server caches and refresh live data"
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${stateStyles} ${className}`}
    >
      {justRefreshed ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          <span>Refreshed</span>
        </>
      ) : (
        <>
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing
                ? "animate-spin text-teal-600 stroke-[2.5]"
                : "text-slate-500 group-hover:text-slate-700 stroke-[2]"
            }`}
          />
          <span className="whitespace-nowrap">
            {isRefreshing ? (
              "Refreshing..."
            ) : (
              <>
                <span className="hidden sm:inline">Refresh Caches</span>
                <span className="sm:hidden">Refresh</span>
              </>
            )}
          </span>
        </>
      )}
    </button>
  );
}
