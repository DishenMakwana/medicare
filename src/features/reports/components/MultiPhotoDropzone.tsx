"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck,
  FileText,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import type { MultiPhotoDropzoneProps } from "@/types";

function formatBytes(bytes?: number): string {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function MultiPhotoDropzone({
  onExtractionComplete,
}: MultiPhotoDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion modal state
  const [fileIndexToDelete, setFileIndexToDelete] = useState<number | null>(
    null,
  );
  const [isClearingAll, setIsClearingAll] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  }

  function addFiles(files: File[]) {
    const valid = files.filter(
      (f) => f.type.startsWith("image/") || f.name.endsWith(".pdf"),
    );
    const updated = [...selectedFiles, ...valid];
    setSelectedFiles(updated);

    const newPreviews = updated.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }

  function confirmRemoveFile() {
    if (fileIndexToDelete === null) return;
    const updated = [...selectedFiles];
    updated.splice(fileIndexToDelete, 1);
    setSelectedFiles(updated);

    const updatedPreviews = [...previews];
    updatedPreviews.splice(fileIndexToDelete, 1);
    setPreviews(updatedPreviews);
    setFileIndexToDelete(null);
  }

  function confirmClearAll() {
    setSelectedFiles([]);
    setPreviews([]);
    setIsClearingAll(false);
  }

  async function startExtraction() {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgressMsg(
      "Running local open-source Python OCR & clinical extraction...",
    );

    try {
      const formData = new FormData();
      for (const f of selectedFiles) {
        formData.append("files", f);
      }

      const res = await fetch("/api/reports/extract", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Extraction failed");
      }

      onExtractionComplete(json.data);
    } catch (err: any) {
      alert("Extraction failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/30 hover:bg-teal-50/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Upload Medical Reports (PDF or Photos)
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          Select one or multiple PDF documents or photo scans (CBC, Lipid,
          HbA1c, LFT). Multi-page PDFs and images are processed automatically.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-teal-200 text-teal-700 text-xs font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>Supports Multi-Page PDFs, JPG & PNG</span>
        </div>
      </div>

      {/* Selected File Thumbnails */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>
                Selected Files ({selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "document" : "documents"})
              </span>
            </h4>
            <button
              type="button"
              onClick={() => setIsClearingAll(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear all files
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {selectedFiles.map((file, idx) => {
              const isPdf =
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf");
              const previewSrc = previews[idx];

              return (
                <div
                  key={idx}
                  className={`relative group rounded-2xl overflow-hidden border shadow-xs aspect-[3/4] ${
                    isPdf
                      ? "border-rose-200/90 bg-gradient-to-b from-rose-50/50 via-white to-slate-50 p-3.5 flex flex-col justify-between"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {isPdf ? (
                    <>
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                          <FileText className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md inline-block">
                            PDF Report
                          </span>
                          <p
                            className="text-xs font-bold text-slate-800 line-clamp-2 mt-1 leading-tight"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/95 text-slate-600 text-[10px] font-bold py-1 px-2 rounded-lg text-center border border-slate-200/80 shadow-xs">
                        All Pages Extracted
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={previewSrc}
                        alt={`Report page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold py-1 px-2 rounded-lg text-center">
                        Page {idx + 1}
                      </div>
                    </>
                  )}

                  {/* Trash delete button with popup trigger */}
                  <button
                    type="button"
                    title={isPdf ? "Remove this PDF" : "Remove this photo"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileIndexToDelete(idx);
                    }}
                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-xl shadow-md opacity-90 hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Multi-Page & Extraction Notice */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/70 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800">
                Smart Multi-Page Extraction:{" "}
              </span>
              PDF documents and photo pages will be converted and analyzed
              page-by-page as{" "}
              <span className="font-mono font-bold text-teal-800">
                Page 1, Page 2...
              </span>{" "}
              If any parameter is not recognized or values are unclear, Medicare
              will flag that specific page and let you inspect and edit
              parameters with the side-by-side scan inspector.
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={startExtraction}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressMsg}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Extract Parameters ({selectedFiles.length}{" "}
                    {selectedFiles.length === 1
                      ? selectedFiles[0].name.toLowerCase().endsWith(".pdf")
                        ? "PDF Document"
                        : "Photo"
                      : "Files"}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup for Single Item */}
      <DeleteConfirmModal
        isOpen={fileIndexToDelete !== null}
        onClose={() => setFileIndexToDelete(null)}
        onConfirm={confirmRemoveFile}
        title={
          fileIndexToDelete !== null
            ? selectedFiles[fileIndexToDelete]?.name
                .toLowerCase()
                .endsWith(".pdf")
              ? "Remove PDF Document?"
              : `Remove Page ${fileIndexToDelete + 1}?`
            : "Remove File?"
        }
        message="Are you sure you want to remove this report from the extraction queue?"
        confirmLabel="Yes, Remove"
        cancelLabel="Keep File"
        previewImageUrl={
          fileIndexToDelete !== null &&
          !selectedFiles[fileIndexToDelete]?.name.toLowerCase().endsWith(".pdf")
            ? previews[fileIndexToDelete]
            : null
        }
        itemBadge={
          fileIndexToDelete !== null
            ? selectedFiles[fileIndexToDelete]?.name
                .toLowerCase()
                .endsWith(".pdf")
              ? "PDF Report"
              : `Page ${fileIndexToDelete + 1}`
            : null
        }
      />

      {/* Delete Confirmation Popup for Clear All */}
      <DeleteConfirmModal
        isOpen={isClearingAll}
        onClose={() => setIsClearingAll(false)}
        onConfirm={confirmClearAll}
        title="Clear All Uploaded Files?"
        message={`Are you sure you want to remove all ${selectedFiles.length} uploaded reports from the queue?`}
        confirmLabel="Yes, Clear All"
        cancelLabel="Cancel"
      />
    </div>
  );
}
