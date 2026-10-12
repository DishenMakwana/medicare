"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Pencil,
  Check,
  Database,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import { RangeBar } from "@/components/ui/RangeBar";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  deleteReportImageAction,
  deleteReportAction,
  updateTestPresetByIdAction,
} from "@/features/reports/actions";
import { formatDate, formatDateTime, formatMemberAge } from "@/lib/utils";
import { PageInspectModal } from "./PageInspectModal";
import type {
  MedicalReport,
  ReportParameter,
  ReportImage,
  ReportDetailClientProps,
} from "@/types";

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  const router = useRouter();
  const member = report.familyMember;
  const [parameters, setParameters] = useState<ReportParameter[]>(
    report.parameters || [],
  );
  const categories = Array.from(
    new Set(parameters.map((p) => p.category || "General")),
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of parameters) {
      const cat = p.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [parameters]);

  const [images, setImages] = useState<ReportImage[]>(report.images || []);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Deletion modal states
  const [imageToDelete, setImageToDelete] = useState<ReportImage | null>(null);
  const [showReportDeleteModal, setShowReportDeleteModal] = useState(false);

  // Inline TestPreset editing states
  const [editingParamId, setEditingParamId] = useState<number | string | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState<{
    presetId: number;
    name: string;
    category: string;
    unit: string;
    refMin: string;
    refMax: string;
    refText: string;
    clinicalMethod: string;
    valueNumber: string;
    valueText: string;
  } | null>(null);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [saveSuccessId, setSaveSuccessId] = useState<number | string | null>(
    null,
  );
  const [highlightedParamId, setHighlightedParamId] = useState<
    number | string | null
  >(null);

  function scrollToParameter(param: ReportParameter) {
    if (
      activeCategory !== "ALL" &&
      (param.category || "General") !== activeCategory
    ) {
      setActiveCategory("ALL");
    }

    setTimeout(() => {
      const rowEl = document.getElementById(`param-row-${param.id}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedParamId(param.id);
        setTimeout(() => {
          setHighlightedParamId(null);
        }, 2500);
      }
    }, 60);
  }

  function handleStartEdit(param: ReportParameter) {
    if (!param.testPresetId) return;
    setEditingParamId(param.id);
    setEditFormData({
      presetId: Number(param.testPresetId),
      name: param.testPreset?.name || param.paramName,
      category: param.testPreset?.category || param.category || "General",
      unit: param.testPreset?.unit ?? param.unit ?? "",
      refMin:
        param.testPreset?.refMin !== undefined &&
        param.testPreset?.refMin !== null
          ? String(param.testPreset.refMin)
          : param.refMin !== undefined && param.refMin !== null
            ? String(param.refMin)
            : "",
      refMax:
        param.testPreset?.refMax !== undefined &&
        param.testPreset?.refMax !== null
          ? String(param.testPreset.refMax)
          : param.refMax !== undefined && param.refMax !== null
            ? String(param.refMax)
            : "",
      refText: param.testPreset?.refText ?? param.refText ?? "",
      clinicalMethod:
        param.testPreset?.clinicalMethod ?? param.clinicalMethod ?? "",
      valueNumber:
        param.valueNumber !== undefined && param.valueNumber !== null
          ? String(param.valueNumber)
          : "",
      valueText: param.valueText ?? "",
    });
  }

  function handleCancelEdit() {
    setEditingParamId(null);
    setEditFormData(null);
  }

  async function handleSavePreset(param: ReportParameter) {
    if (!editFormData || !editFormData.presetId) return;
    setIsSavingPreset(true);
    try {
      const minVal =
        editFormData.refMin.trim() !== ""
          ? parseFloat(editFormData.refMin)
          : null;
      const maxVal =
        editFormData.refMax.trim() !== ""
          ? parseFloat(editFormData.refMax)
          : null;
      const numVal =
        editFormData.valueNumber.trim() !== ""
          ? parseFloat(editFormData.valueNumber)
          : null;
      const parsedNumVal = numVal !== null && !isNaN(numVal) ? numVal : null;
      const textVal = editFormData.valueText.trim() || null;

      const payloadData = {
        name: editFormData.name.trim(),
        category: editFormData.category.trim(),
        unit: editFormData.unit.trim() || null,
        refMin: minVal !== null && !isNaN(minVal) ? minVal : null,
        refMax: maxVal !== null && !isNaN(maxVal) ? maxVal : null,
        refText: editFormData.refText.trim() || null,
        clinicalMethod: editFormData.clinicalMethod.trim() || null,
        valueNumber: parsedNumVal,
        valueText: textVal,
      };

      const res = await updateTestPresetByIdAction({
        presetId: editFormData.presetId,
        reportId: report.id,
        reportParameterId: param.id,
        data: payloadData,
      });

      if (res.success && res.preset) {
        let updatedStatus = param.status;
        if (parsedNumVal !== null) {
          if (
            payloadData.refMax !== null &&
            parsedNumVal > payloadData.refMax
          ) {
            updatedStatus = "HIGH";
          } else if (
            payloadData.refMin !== null &&
            parsedNumVal < payloadData.refMin
          ) {
            updatedStatus = "LOW";
          } else if (
            payloadData.refMin !== null ||
            payloadData.refMax !== null
          ) {
            updatedStatus = "NORMAL";
          }
        }

        setParameters((prev) =>
          prev.map((p) => {
            if (p.id === param.id) {
              return {
                ...p,
                paramName: payloadData.name,
                category: payloadData.category,
                unit: payloadData.unit,
                refMin: payloadData.refMin,
                refMax: payloadData.refMax,
                refText: payloadData.refText,
                clinicalMethod: payloadData.clinicalMethod,
                valueNumber: parsedNumVal,
                valueText: textVal,
                status: updatedStatus,
                testPresetId: res.preset.id as number,
                testPreset: res.preset,
              };
            }
            return p;
          }),
        );

        setSaveSuccessId(param.id);
        setTimeout(() => setSaveSuccessId(null), 3000);
        setEditingParamId(null);
        setEditFormData(null);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update test preset:", err);
      alert(
        "Failed to update test preset. Please check the inputs and try again.",
      );
    } finally {
      setIsSavingPreset(false);
    }
  }

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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Parameters Flagged Outside Normal Biological Intervals (
                {abnormalParams.length})
              </span>
            </div>
            <span className="text-[11px] text-rose-600/80 font-medium">
              Click any card to jump to its row in the table &darr;
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {abnormalParams.map((param) => (
              <div
                key={param.id}
                onClick={() => scrollToParameter(param)}
                className="p-4 bg-white rounded-2xl border border-rose-200/90 shadow-sm space-y-2 hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer group"
                title={`Click to jump to ${param.paramName} in detailed table below`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 truncate group-hover:text-rose-700 transition-colors">
                      {param.paramName}
                    </span>
                    <CornerDownRight className="w-3 h-3 text-slate-300 group-hover:text-rose-500 transition-colors shrink-0" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeCategory === "ALL"
                  ? "bg-white text-slate-900 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>All Tests</span>
              <span
                className={`text-[11px] font-semibold ${
                  activeCategory === "ALL" ? "text-slate-700" : "text-slate-400"
                }`}
              >
                ({parameters.length})
              </span>
            </button>
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? "bg-white text-teal-800 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      activeCategory === cat
                        ? "text-teal-700"
                        : "text-slate-400"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
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
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredParameters.map((param) => {
                  const isHigh = param.status === "HIGH";
                  const isLow = param.status === "LOW";
                  const isBorderline = param.status === "BORDERLINE";
                  const isEditing = editingParamId === param.id && editFormData;

                  if (isEditing) {
                    return (
                      <tr
                        key={param.id}
                        id={`param-row-${param.id}`}
                        className="bg-teal-50/40 border-y-2 border-teal-500/30 scroll-mt-24"
                      >
                        <td colSpan={5} className="p-4 sm:p-5">
                          <div className="bg-white rounded-2xl border border-teal-200/90 shadow-sm p-4 sm:p-5 space-y-4">
                            {/* Header with Database Preset ID */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                  <Database className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                                      Inline Edit Test Preset
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                                      Database ID: #{editFormData.presetId}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500">
                                    Updating will directly persist to TestPreset
                                    (ID: {editFormData.presetId}) in the
                                    database and recalculate this report
                                    parameter.
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  disabled={isSavingPreset}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSavePreset(param)}
                                  disabled={isSavingPreset}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-700 active:scale-95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isSavingPreset ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Saving...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>
                                        Save Preset (ID: #
                                        {editFormData.presetId})
                                      </span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Section 1: Actual Patient Test Result in Report */}
                            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                                  <span>
                                    Actual Patient Test Result (Report
                                    Parameter)
                                  </span>
                                </span>
                                <span className="text-[10px] text-teal-700 font-medium">
                                  Editing this will directly update the reported
                                  value for this patient
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                {/* Numeric Value */}
                                <div className="space-y-1 sm:col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-teal-900 flex items-center justify-between">
                                    <span>Result Value (Numeric)</span>
                                    <span className="text-[10px] font-normal text-teal-700 font-mono">
                                      {editFormData.unit || ""}
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    step="any"
                                    value={editFormData.valueNumber}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        valueNumber: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg border border-teal-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono shadow-2xs"
                                    placeholder="e.g. 209"
                                  />
                                </div>

                                {/* Text/Qualitative Value */}
                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    Qualitative / Text Result (Optional if
                                    numeric)
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.valueText}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        valueText: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                    placeholder="e.g. Normocytic Normochromic, Pale Yellow, Negative"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Preset Standards & Methodology Grid */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Preset Standards & Biological Reference Range
                                (Database TestPreset)
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                                {/* Name */}
                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Preset Name
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                    placeholder="e.g. Hemoglobin"
                                  />
                                </div>

                                {/* Category */}
                                <div className="space-y-1 sm:col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Category
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.category}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        category: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                    placeholder="e.g. Complete Blood Count"
                                  />
                                </div>

                                {/* Clinical Method */}
                                <div className="space-y-1 sm:col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Clinical Method
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.clinicalMethod}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        clinicalMethod: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                    placeholder="e.g. SLS method"
                                  />
                                </div>

                                {/* Unit */}
                                <div className="space-y-1 sm:col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Unit
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.unit}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        unit: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                    placeholder="e.g. g/dL, mg/dL"
                                  />
                                </div>

                                {/* Ref Min */}
                                <div className="space-y-1 sm:col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Biological Min
                                  </label>
                                  <input
                                    type="number"
                                    step="any"
                                    value={editFormData.refMin}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        refMin: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                                    placeholder="e.g. 12"
                                  />
                                </div>

                                {/* Ref Max */}
                                <div className="space-y-1 sm:col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Biological Max
                                  </label>
                                  <input
                                    type="number"
                                    step="any"
                                    value={editFormData.refMax}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        refMax: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                                    placeholder="e.g. 15"
                                  />
                                </div>

                                {/* Ref Text */}
                                <div className="space-y-1 sm:col-span-full">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Qualitative Reference Text (Optional for
                                    non-numeric/qualitative tests)
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.refText}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        refText: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                    placeholder="e.g. Negative, Pale Yellow, Clear, Desirable: <200"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Section 3: Dynamic Live Range Bar & Status Preview */}
                            {(() => {
                              const previewNum =
                                editFormData.valueNumber.trim() !== ""
                                  ? parseFloat(editFormData.valueNumber)
                                  : null;
                              const previewMin =
                                editFormData.refMin.trim() !== ""
                                  ? parseFloat(editFormData.refMin)
                                  : null;
                              const previewMax =
                                editFormData.refMax.trim() !== ""
                                  ? parseFloat(editFormData.refMax)
                                  : null;

                              let previewStatus = "NORMAL";
                              if (previewNum !== null && !isNaN(previewNum)) {
                                if (
                                  previewMax !== null &&
                                  previewNum > previewMax
                                ) {
                                  previewStatus = "HIGH";
                                } else if (
                                  previewMin !== null &&
                                  previewNum < previewMin
                                ) {
                                  previewStatus = "LOW";
                                } else if (
                                  previewMin !== null ||
                                  previewMax !== null
                                ) {
                                  previewStatus = "NORMAL";
                                }
                              }

                              return (
                                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                                    <div>
                                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 flex-wrap">
                                        <span>Live Result Gauge Preview:</span>
                                        <span className="font-mono font-black text-slate-900">
                                          {previewNum !== null &&
                                          !isNaN(previewNum)
                                            ? previewNum
                                            : editFormData.valueText ||
                                              "—"}{" "}
                                          {editFormData.unit}
                                        </span>
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                            previewStatus === "HIGH"
                                              ? "bg-rose-50 text-rose-700 border-rose-200"
                                              : previewStatus === "LOW"
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          }`}
                                        >
                                          {previewStatus}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-slate-400">
                                        Biological Reference Interval:{" "}
                                        {previewMin !== null ? previewMin : "—"}{" "}
                                        to{" "}
                                        {previewMax !== null ? previewMax : "—"}{" "}
                                        {editFormData.unit}
                                      </span>
                                    </div>
                                  </div>

                                  {previewNum !== null &&
                                    !isNaN(previewNum) && (
                                      <div className="w-full md:w-80">
                                        <RangeBar
                                          value={previewNum}
                                          min={previewMin}
                                          max={previewMax}
                                          unit={editFormData.unit}
                                          status={previewStatus}
                                        />
                                      </div>
                                    )}
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={param.id}
                      id={`param-row-${param.id}`}
                      className={`transition-all duration-700 scroll-mt-24 ${
                        highlightedParamId === param.id
                          ? "bg-teal-100/70 ring-2 ring-teal-500 ring-inset shadow-md"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 block">
                            {param.paramName}
                          </span>
                          {param.testPresetId && (
                            <span
                              title={`Database TestPreset ID: ${param.testPresetId}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs"
                            >
                              <Database className="w-2.5 h-2.5 text-teal-600" />
                              DB ID: #{param.testPresetId}
                            </span>
                          )}
                        </div>
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

                      <td className="px-4 py-4 text-center">
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

                      <td className="px-4 py-4 text-right">
                        {saveSuccessId === param.id ? (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
                            title="Saved!"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(param)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200/70 hover:border-teal-300 transition-all shadow-2xs cursor-pointer group"
                            title={`Edit Test (Database Preset ID: ${param.testPresetId})`}
                            aria-label={`Edit ${param.paramName}`}
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                          </button>
                        )}
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
