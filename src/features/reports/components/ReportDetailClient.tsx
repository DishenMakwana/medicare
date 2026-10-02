"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MedicalReport, ReportParameter, ReportImage } from "@/types";
import { RangeBar } from "@/components/ui/RangeBar";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  deleteReportImageAction,
  deleteReportAction,
} from "@/features/reports/actions";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  Hash,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
  Trash2,
  ZoomIn,
} from "lucide-react";
import { formatDate, formatDateTime, formatMemberAge } from "@/lib/utils";
import { PageInspectModal } from "./PageInspectModal";

interface ReportDetailClientProps {
  report: MedicalReport;
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  const router = useRouter();
  const member = report.familyMember;
  const parameters = report.parameters || [];
  const categories = Array.from(
    new Set(parameters.map((p) => p.category || "General")),
  );

  const [images, setImages] = useState<ReportImage[]>(report.images || []);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Deletion modal states
  const [imageToDelete, setImageToDelete] = useState<ReportImage | null>(null);
  const [showReportDeleteModal, setShowReportDeleteModal] = useState(false);

  const filteredParameters =
    activeCategory === "ALL"
      ? parameters
      : parameters.filter((p) => (p.category || "General") === activeCategory);

  const abnormalParams = parameters.filter(
    (p) => p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
  );

  async function handleConfirmDeleteImage() {
    if (!imageToDelete) return;
    await deleteReportImageAction(imageToDelete.id, report.id);
    setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
    if (selectedImage === imageToDelete.imageUrl) {
      setSelectedImage(null);
    }
  }

  async function handleConfirmDeleteReport() {
    await deleteReportAction(report.id, report.familyMemberId);
    router.push("/reports");
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>

        <div className="flex items-center gap-4">
          {member && (
            <Link
              href={`/members/${member.id}`}
              className="text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              View {member.name}&apos;s Profile &rarr;
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowReportDeleteModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Header Card */}
      <div className="bento-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Diagnostic Laboratory Report
              </span>

              {abnormalParams.length > 0 ? (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{abnormalParams.length} Out-of-Range Flags</span>
                </span>
              ) : (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>All Parameters Optimal</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {report.title}
            </h1>

            {report.notes && (
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                {report.notes}
              </p>
            )}
          </div>

          {member && (
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {member.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                  Patient Profile
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {member.name}
                </span>
                <span className="text-xs text-slate-400 block font-medium">
                  {member.relation}{" "}
                  {formatMemberAge(member)
                    ? `• ${formatMemberAge(member)}`
                    : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Laboratory Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-teal-600" /> Report Date
            </span>
            <span className="font-bold text-slate-900">
              {formatDate(report.reportDate)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-teal-600" /> Collected On
            </span>
            <span className="font-bold text-slate-900">
              {report.collectionDate
                ? formatDateTime(report.collectionDate)
                : "—"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1 text-[11px]">
              <Building className="w-3.5 h-3.5" /> Diagnostic Lab
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {report.labName || "Laboratory"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1 text-[11px]">
              <Hash className="w-3.5 h-3.5" /> Registration No.
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {report.registrationNo || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1 text-[11px]">
              <User className="w-3.5 h-3.5" /> Printed Name
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {report.rawPatientName || member?.name}
            </span>
          </div>
        </div>

        {/* Scanned Original Report Filmstrip with Delete Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>
                Original Scanned Report Pages ({images.length} pages in vault)
              </span>
            </h3>
            {images.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Hover over an image to inspect or delete
              </span>
            )}
          </div>

          {images.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No scanned images stored for this report.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-[3/4] bg-slate-100 hover:shadow-md transition-all"
                >
                  <img
                    src={img.imageUrl}
                    alt={`Report Page ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setSelectedImage(img.imageUrl)}
                  />

                  {/* Zoom click overlay */}
                  <div
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none"
                  >
                    <div className="p-2 rounded-xl bg-white/90 text-slate-800 shadow-md">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Page Badge */}
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-bold py-1 px-2 rounded-lg text-center flex items-center justify-center gap-1 pointer-events-none">
                    <span>Page {img.pageNumber}</span>
                  </div>

                  {/* Dribbble Delete Trigger Button */}
                  <button
                    type="button"
                    title="Delete this scanned page"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageToDelete(img);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoomable Scanned Page Inspect & Test Preset Values Card */}
      <PageInspectModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        images={images}
        initialPageIndex={
          selectedImage
            ? Math.max(
                0,
                images.findIndex((img) => img.imageUrl === selectedImage),
              )
            : 0
        }
        parameters={parameters}
      />

      {/* Out of Range Attention Highlights */}
      {abnormalParams.length > 0 && (
        <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Parameters Flagged Outside Normal Biological Intervals (
              {abnormalParams.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {abnormalParams.map((param) => (
              <div
                key={param.id}
                className="p-4 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    {param.paramName}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {param.status}
                  </span>
                </div>

                <RangeBar
                  value={param.valueNumber}
                  min={param.refMin}
                  max={param.refMax}
                  unit={param.unit}
                  status={param.status}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveCategory("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === "ALL"
                  ? "bg-white text-slate-900 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Tests ({parameters.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-white text-teal-800 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Parameter Table with Visual Sliders */}
        <div className="bento-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-bold">
                <tr>
                  <th className="px-6 py-3.5">Parameter & Methodology</th>
                  <th className="px-4 py-3.5">Result</th>
                  <th className="px-6 py-3.5">Biological Range Visual Gauge</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredParameters.map((param) => {
                  const isHigh = param.status === "HIGH";
                  const isLow = param.status === "LOW";
                  const isBorderline = param.status === "BORDERLINE";

                  return (
                    <tr
                      key={param.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-slate-900 block">
                          {param.paramName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {param.clinicalMethod || param.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-mono font-black text-sm">
                        <span
                          className={
                            isHigh
                              ? "text-rose-700"
                              : isLow
                                ? "text-blue-700"
                                : "text-slate-900"
                          }
                        >
                          {param.valueNumber !== null
                            ? param.valueNumber
                            : param.valueText}
                        </span>
                        {param.unit && (
                          <span className="text-xs text-slate-400 font-normal ml-1">
                            {param.unit}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 min-w-[260px]">
                        {param.valueNumber !== null ? (
                          <RangeBar
                            value={param.valueNumber}
                            min={param.refMin}
                            max={param.refMax}
                            unit={param.unit}
                            status={param.status}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Qualitative (No numeric range)</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isLow
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : isBorderline
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {param.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Image Confirmation Popup Modal */}
      <DeleteConfirmModal
        isOpen={imageToDelete !== null}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDeleteImage}
        title={`Delete Report Page ${imageToDelete?.pageNumber || ""}?`}
        message="Are you sure you want to delete this scanned image? This action is permanent and will remove this page from your medical report vault."
        confirmLabel="Yes, Delete Page"
        cancelLabel="Keep Page"
        previewImageUrl={imageToDelete?.imageUrl}
        itemBadge={`Page ${imageToDelete?.pageNumber}`}
      />

      {/* Delete Entire Report Confirmation Popup Modal */}
      <DeleteConfirmModal
        isOpen={showReportDeleteModal}
        onClose={() => setShowReportDeleteModal(false)}
        onConfirm={handleConfirmDeleteReport}
        title="Delete Entire Medical Report?"
        message={`Are you sure you want to delete "${report.title}"? This will permanently delete the report, all ${parameters.length} extracted parameters, and all scanned pages.`}
        confirmLabel="Yes, Delete Entire Report"
        cancelLabel="Cancel"
        itemBadge="Complete Lab Panel"
      />
    </div>
  );
}
