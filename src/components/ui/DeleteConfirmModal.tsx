"use client";

import { useEffect, useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmModalProps {
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

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure you want to delete?",
  message = "This action is permanent and cannot be undone. Once deleted, this item will be permanently removed from your medical records.",
  confirmLabel = "Yes, Delete",
  cancelLabel = "Cancel",
  previewImageUrl,
  itemBadge,
  isDestructive = true,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      alert("Failed to delete: " + (err?.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to cancel */}
      <div
        className="fixed inset-0"
        onClick={!isDeleting ? onClose : undefined}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm sm:max-w-md w-full p-6 sm:p-7 space-y-5 text-center overflow-hidden animate-in zoom-in-95 duration-200 z-10">
        {/* Close X in top right */}
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pulsing Soft Danger Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100/80 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/70 shadow-inner">
          <Trash2 className="w-7 h-7" />
        </div>

        {/* Title and Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium px-2">
            {message}
          </p>
        </div>

        {/* Optional Visual Context Preview Thumbnail */}
        {previewImageUrl && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 text-left">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
              <img
                src={previewImageUrl}
                alt="Item to be deleted preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              {itemBadge && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 inline-block">
                  {itemBadge}
                </span>
              )}
              <span className="text-xs font-bold text-slate-800 block line-clamp-1">
                Selected Medical Photo
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Will be permanently deleted
              </span>
            </div>
          </div>
        )}

        {/* Actions Button Group */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
