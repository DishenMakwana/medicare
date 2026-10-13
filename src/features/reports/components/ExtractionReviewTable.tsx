"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Building,
  Calendar,
  Clock,
  Hash,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  UserPlus,
  ZoomIn,
} from "lucide-react";
import { RangeBar } from "@/components/ui/RangeBar";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { MemberModal } from "@/features/members/components/MemberModal";
import { createFamilyMember } from "@/features/members/actions";
import { saveVerifiedReport } from "../actions";
import { matchFamilyMember } from "@/lib/name-normalizer";
import { PageInspectModal } from "./PageInspectModal";
import type { FamilyMember, ExtractionReviewTableProps } from "@/types";

export function ExtractionReviewTable({
  extractedData,
  members,
  onReset,
}: ExtractionReviewTableProps) {
  const router = useRouter();

  const [memberList, setMemberList] = useState<FamilyMember[]>(members);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isQuickCreatingMember, setIsQuickCreatingMember] = useState(false);
  const [newMemberCreatedBadge, setNewMemberCreatedBadge] = useState<
    string | null
  >(null);

  // Find best match among family members
  const initialMatch = matchFamilyMember(
    extractedData.clean_patient_name,
    members,
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | number>(
    initialMatch.matchedMemberId || members[0]?.id || "",
  );

  async function handleQuickCreateMember() {
    setIsQuickCreatingMember(true);
    try {
      const parsedAge = extractedData.age
        ? Number(extractedData.age)
        : undefined;
      const estimatedDob = parsedAge
        ? `${new Date().getFullYear() - parsedAge}-01-01`
        : undefined;

      const created = await createFamilyMember({
        name: cleanName || rawPatientName || "Patient",
        aliases:
          rawPatientName && rawPatientName !== cleanName
            ? rawPatientName
            : undefined,
        gender: extractedData.gender || "Female",
        dateOfBirth: estimatedDob,
        ageYears: parsedAge,
        relation: "Self",
      });

      const memberObj = created as unknown as FamilyMember;
      setMemberList((prev) => {
        const exists = prev.some((m) => m.id === memberObj.id);
        return exists ? prev : [...prev, memberObj];
      });
      setSelectedMemberId(memberObj.id);
      setNewMemberCreatedBadge(`Created profile for "${memberObj.name}"`);
      setTimeout(() => setNewMemberCreatedBadge(null), 5000);
    } catch (err: any) {
      alert("Failed to create member: " + err.message);
    } finally {
      setIsQuickCreatingMember(false);
    }
  }

  function handleMemberCreatedFromModal(created?: FamilyMember) {
    if (created) {
      setMemberList((prev) => {
        const exists = prev.some((m) => m.id === created.id);
        return exists ? prev : [...prev, created];
      });
      setSelectedMemberId(created.id);
      setNewMemberCreatedBadge(`Created profile for "${created.name}"`);
      setTimeout(() => setNewMemberCreatedBadge(null), 5000);
      router.refresh();
    }
    setIsMemberModalOpen(false);
  }

  // Editable Report Details
  const [title, setTitle] = useState(
    `${extractedData.lab_name || "Diagnostic"} Comprehensive Panel (${extractedData.report_date || "Recent"})`,
  );
  const [labName, setLabName] = useState(extractedData.lab_name || "");
  const [regNo, setRegNo] = useState(extractedData.registration_no || "");
  const [reportDate, setReportDate] = useState(
    extractedData.report_date || new Date().toISOString().split("T")[0],
  );
  const [collectionDate, setCollectionDate] = useState(
    extractedData.collection_date || "",
  );
  const rawPatientName = extractedData.raw_patient_name || "";
  const cleanName = extractedData.clean_patient_name || "";

  // Images & Parameters
  const [images, setImages] = useState<any[]>(extractedData.images || []);
  const [parameters, setParameters] = useState<any[]>(
    extractedData.parameters || [],
  );
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isSaving, setIsSaving] = useState(false);

  // Unified Page Inspect & Add/Verify Test Modal state
  const [inspectPageIndex, setInspectPageIndex] = useState<number | null>(null);
  const [inspectModalTab, setInspectModalTab] = useState<
    "ADD_TEST" | "VIEW_TESTS"
  >("ADD_TEST");

  // Deletion modal states
  const [imageToDelete, setImageToDelete] = useState<{
    image: any;
    index: number;
  } | null>(null);
  const [paramToDelete, setParamToDelete] = useState<{
    param: any;
    index: number;
  } | null>(null);

  // Per-page extraction analytics
  const pagesSummary = extractedData.pagesSummary || [];
  const problemPages = pagesSummary.filter(
    (p: any) =>
      p.status === "EMPTY" || p.status === "WARNING" || p.paramCount === 0,
  );
  const incompleteParams = parameters.filter(
    (p) =>
      p.is_incomplete ||
      (p.value_number === null && (!p.value_text || p.value_text === "")),
  );

  // Distinct categories
  const categories = Array.from(
    new Set(parameters.map((p) => p.category || "General")),
  );

  const filteredParameters =
    activeCategory === "ALL"
      ? parameters
      : parameters.filter((p) => (p.category || "General") === activeCategory);

  function updateParam(index: number, field: string, value: any) {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  }

  function confirmRemoveParam() {
    if (paramToDelete === null) return;
    setParameters((prev) =>
      prev.filter((_, idx) => idx !== paramToDelete.index),
    );
    setParamToDelete(null);
  }

  function confirmRemoveImage() {
    if (imageToDelete === null) return;
    setImages((prev) => prev.filter((_, idx) => idx !== imageToDelete.index));
    setImageToDelete(null);
  }

  function handleAddParameterManually(newParam: any) {
    setParameters((prev) => [...prev, newParam]);
    if (
      newParam.category &&
      activeCategory !== "ALL" &&
      activeCategory !== newParam.category
    ) {
      setActiveCategory(newParam.category);
    }
  }

  function handleUpdateParameter(index: number, updatedParam: any) {
    setParameters((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updatedParam };
      return next;
    });
    if (
      updatedParam.category &&
      activeCategory !== "ALL" &&
      activeCategory !== updatedParam.category
    ) {
      setActiveCategory(updatedParam.category);
    }
  }

  async function handleSave() {
    if (!selectedMemberId) {
      alert("Please select a family member to assign this report to.");
      return;
    }

    setIsSaving(true);
    try {
      const hasAbnormal = parameters.some(
        (p) =>
          p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
      );
      const overallStatus = hasAbnormal ? "ATTENTION_NEEDED" : "NORMAL";

      const saved = await saveVerifiedReport({
        familyMemberId: selectedMemberId,
        title,
        labName,
        registrationNo: regNo,
        reportDate,
        collectionDate: collectionDate || null,
        rawPatientName,
        overallStatus,
        images: images,
        parameters: parameters.map((p) => ({
          category: p.category || "General",
          paramName: p.param_name,
          paramSlug:
            p.param_slug ||
            p.param_name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          valueNumber:
            p.value_number !== undefined && p.value_number !== null
              ? Number(p.value_number)
              : null,
          valueText: p.value_text || null,
          unit: p.unit || null,
          refMin:
            p.ref_min !== undefined && p.ref_min !== null
              ? Number(p.ref_min)
              : null,
          refMax:
            p.ref_max !== undefined && p.ref_max !== null
              ? Number(p.ref_max)
              : null,
          refText: p.ref_text || null,
          status: p.status || "NORMAL",
          clinicalMethod: p.clinical_method || null,
        })),
      });

      router.push(`/reports/${saved.id}`);
    } catch (err: any) {
      alert("Failed to save report: " + err.message);
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner & Header */}
      <div className="bento-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <Sparkles className="w-3 h-3 inline mr-1 text-teal-500" />
                  Local OCR Verification Studio
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {images.length} pages attached
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Clinical Parameters Review
              </h2>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving ? "Saving to Vault..." : "Confirm & Save to Database"}
            </span>
          </button>
        </div>

        {/* Incomplete Extraction Notification Banner */}
        {problemPages.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-amber-950">
                    Manual Attention Needed on {problemPages.length}{" "}
                    {problemPages.length === 1 ? "Page" : "Pages"}
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Incomplete Extraction
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Medicare could not reliably extract test values from{" "}
                  <span className="font-bold underline">
                    {problemPages
                      .map((p: any) => `Page ${p.pageNumber}`)
                      .join(", ")}
                  </span>
                  . This usually happens with handwritten notes, stamps, or
                  non-standard table formats. You can inspect the scanned photo
                  and add tests manually.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {problemPages.map((p: any) => {
                const pageIdx = images.findIndex(
                  (img, idx) => (img.pageNumber || idx + 1) === p.pageNumber,
                );
                return (
                  <button
                    key={p.pageNumber}
                    type="button"
                    onClick={() => {
                      setInspectPageIndex(pageIdx >= 0 ? pageIdx : 0);
                      setInspectModalTab("ADD_TEST");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-200 hover:bg-amber-300 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add for Page {p.pageNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Incomplete / Missing Values Warning for Individual Biomarkers */}
        {incompleteParams.length > 0 && problemPages.length === 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs text-amber-900">
                <span className="font-extrabold">
                  {incompleteParams.length} biomarker(s)
                </span>{" "}
                have missing numeric or textual results. Please review and fill
                them in the table below before saving.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setInspectPageIndex(0);
                setInspectModalTab("ADD_TEST");
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-200 text-amber-900 hover:bg-amber-300"
            >
              Add Parameter
            </button>
          </div>
        )}

        {/* Smart Patient Name Match Card */}
        <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 font-bold shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-teal-900">
                  Extracted Name:{" "}
                  <span className="font-mono font-bold text-slate-900">
                    &quot;{rawPatientName}&quot;
                  </span>{" "}
                  &rarr; Cleaned:{" "}
                  <span className="font-extrabold text-teal-800">
                    &quot;{cleanName}&quot;
                  </span>
                </span>
                {newMemberCreatedBadge && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-in fade-in">
                    ✓ {newMemberCreatedBadge}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">
                  Target Profile in Family Vault:
                </span>
                <span className="text-[11px] text-slate-400">
                  (Select which family member this medical report belongs to)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {memberList.length === 0 ? (
              /* When NO user exists in vault */
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickCreateMember}
                  disabled={isQuickCreatingMember}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isQuickCreatingMember
                      ? "Creating Profile..."
                      : `+ Quick Create "${cleanName || "Patient"}" & Bind`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-900 bg-white border border-teal-300 hover:bg-teal-50 transition-all"
                >
                  <span>Custom Details...</span>
                </button>
              </div>
            ) : (
              /* When members exist in vault */
              <div className="flex items-center gap-2 w-full md:w-80">
                <div className="relative flex-1">
                  <select
                    value={String(selectedMemberId)}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setIsMemberModalOpen(true);
                      } else {
                        setSelectedMemberId(e.target.value);
                      }
                    }}
                    className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-teal-300 bg-white text-slate-900 text-xs font-extrabold shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    {memberList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.relation ? `(${m.relation})` : ""}
                      </option>
                    ))}
                    <option value="__NEW__">Add New Family Member...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  title="Add new family member"
                  className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Diagnostic Center
            </label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" /> Registration No.
            </label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold font-mono text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Report Date
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-600" /> Collected On /
              Date
            </label>
            <input
              type="text"
              value={collectionDate}
              placeholder="e.g. 2018-10-07 11:05"
              onChange={(e) => setCollectionDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Scanned Attached Images Filmstrip with Delete Buttons */}
        {images.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <span>Scanned Pages Attached ({images.length} pages)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click trash to remove any unwanted image
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img, idx) => {
                const pageNum = img.pageNumber || idx + 1;
                const pageSummary = pagesSummary.find(
                  (p: any) => p.pageNumber === pageNum,
                );
                const pageParamCount = pageSummary
                  ? pageSummary.paramCount
                  : parameters.filter((p) => p.source_page === pageNum).length;
                const isPageEmpty = pageSummary
                  ? pageSummary.status === "EMPTY" ||
                    pageSummary.paramCount === 0
                  : pageParamCount === 0;

                const quality = (
                  pageSummary?.extractionQuality ||
                  (img as any)?.extractionQuality ||
                  (isPageEmpty
                    ? "EMPTY"
                    : pageSummary?.unparsedLines?.length
                      ? "PARTIAL"
                      : "COMPLETE")
                )
                  .toString()
                  .toUpperCase();

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setInspectPageIndex(idx);
                      setInspectModalTab("VIEW_TESTS");
                    }}
                    className={`group relative rounded-2xl overflow-hidden border aspect-[3/4] bg-slate-100 shadow-sm transition-all cursor-pointer hover:shadow-lg ${
                      isPageEmpty
                        ? "border-amber-400 ring-2 ring-amber-300/50"
                        : "border-slate-200 hover:border-teal-400"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Scanned page ${pageNum}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover Zoom & Inspect Overlay */}
                    <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                      <div className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-xs transform scale-90 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-3.5 h-3.5 text-teal-600" />
                        <span>Zoom & Inspect</span>
                      </div>
                    </div>

                    {/* Top status indicator badge */}
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      {isPageEmpty ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-amber-500 text-white shadow-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-white" /> 0
                          tests
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-xs">
                          <CheckCircle2 className="w-3 h-3 text-white" />{" "}
                          {pageParamCount} tests
                        </span>
                      )}
                    </div>

                    {/* Delete trigger button */}
                    <button
                      type="button"
                      title="Remove this scanned page"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageToDelete({ image: img, index: idx });
                      }}
                      className="absolute top-2 right-2 z-20 p-1.5 rounded-xl bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white shadow-md opacity-90 hover:opacity-100 transition-all hover:scale-105"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom overlay bar with page number and extraction quality badge */}
                    <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
                      <div className="bg-slate-900/85 text-white text-[10px] font-bold py-1 px-2 rounded-lg text-center backdrop-blur-sm">
                        Pg {pageNum}
                      </div>

                      <div
                        className={`text-[9.5px] font-black uppercase tracking-wider py-1 px-2 rounded-lg flex items-center gap-1 shadow-md backdrop-blur-sm ${
                          quality === "COMPLETE"
                            ? "bg-emerald-600/95 text-white border border-emerald-400/30"
                            : quality === "EMPTY"
                              ? "bg-rose-600/95 text-white border border-rose-400/30"
                              : "bg-amber-500/95 text-white border border-amber-300/40"
                        }`}
                      >
                        {quality === "COMPLETE" ? (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        ) : quality === "EMPTY" ? (
                          <AlertCircle className="w-3 h-3 text-white" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-white" />
                        )}
                        <span>{quality}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Pills & Parameter Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "ALL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Parameters ({parameters.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-white text-teal-800 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setInspectPageIndex(0);
            setInspectModalTab("ADD_TEST");
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Missing Parameter</span>
        </button>
      </div>

      {/* Extracted Parameters Table with Range Bars */}
      <div className="bento-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-bold">
              <tr>
                <th className="px-3 py-3 text-center">Page</th>
                <th className="px-6 py-3">Parameter & Method</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-6 py-3">Visual Range Gauge</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredParameters.map((item, idx) => {
                const isHigh = item.status === "HIGH";
                const isLow = item.status === "LOW";
                const isBorderline = item.status === "BORDERLINE";
                const isIncomplete =
                  item.is_incomplete ||
                  (item.value_number === null &&
                    (!item.value_text || item.value_text.trim() === ""));

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isIncomplete
                        ? "bg-amber-50/70 hover:bg-amber-50 border-l-4 border-l-amber-500"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Source Page Tag */}
                    <td className="px-3 py-3.5 text-center">
                      <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono shadow-xs">
                        Pg {item.source_page || 1}
                      </span>
                    </td>

                    {/* Parameter Name & Method */}
                    <td className="px-6 py-3.5 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.param_name}
                          onChange={(e) =>
                            updateParam(idx, "param_name", e.target.value)
                          }
                          className="font-bold text-slate-900 w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-teal-500 bg-transparent focus:bg-white text-sm"
                        />
                        {isIncomplete && (
                          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 flex items-center gap-1 shadow-xs">
                            <AlertCircle className="w-3 h-3 text-amber-700" />
                            <span>Needs Input</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Methodology (optional)"
                        value={item.clinical_method || ""}
                        onChange={(e) =>
                          updateParam(idx, "clinical_method", e.target.value)
                        }
                        className="text-[11px] text-slate-400 w-full px-2 py-0.5 rounded border border-transparent hover:border-slate-200 focus:border-teal-500 bg-transparent focus:bg-white"
                      />
                    </td>

                    {/* Value & Unit */}
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <input
                          type={item.value_number !== null ? "number" : "text"}
                          step="0.01"
                          placeholder={isIncomplete ? "Enter value" : ""}
                          value={
                            item.value_number !== null
                              ? item.value_number
                              : item.value_text || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (item.value_number !== null) {
                              updateParam(
                                idx,
                                "value_number",
                                val === "" ? null : Number(val),
                              );
                            } else {
                              updateParam(idx, "value_text", val);
                            }
                          }}
                          className={`font-mono font-black text-sm w-24 px-2 py-1 rounded-lg border focus:ring-2 focus:ring-teal-500 ${
                            isIncomplete
                              ? "border-amber-400 bg-amber-100/50 text-amber-900 ring-2 ring-amber-300/40"
                              : isHigh
                                ? "border-slate-200 text-rose-700 bg-rose-50"
                                : isLow
                                  ? "border-slate-200 text-blue-700 bg-blue-50"
                                  : "border-slate-200 text-slate-900"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="unit"
                          value={item.unit || ""}
                          onChange={(e) =>
                            updateParam(idx, "unit", e.target.value)
                          }
                          className="font-mono text-xs text-slate-400 w-16 px-1.5 py-1 rounded border border-slate-200 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </td>

                    {/* Visual Range Slider */}
                    <td className="px-6 py-3.5 min-w-[240px]">
                      {item.value_number !== null ? (
                        <RangeBar
                          value={Number(item.value_number)}
                          min={
                            item.ref_min !== null ? Number(item.ref_min) : null
                          }
                          max={
                            item.ref_max !== null ? Number(item.ref_max) : null
                          }
                          unit={item.unit}
                          status={item.status}
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Qualitative (No numeric range)</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge Select */}
                    <td className="px-4 py-3.5">
                      <div className="relative inline-block">
                        <select
                          value={item.status || "NORMAL"}
                          onChange={(e) =>
                            updateParam(idx, "status", e.target.value)
                          }
                          className={`appearance-none text-xs font-black pl-3 pr-7 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isLow
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : isBorderline
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="LOW">LOW</option>
                          <option value="BORDERLINE">BORDERLINE</option>
                          <option value="ABNORMAL">ABNORMAL</option>
                        </select>
                        <ChevronDown
                          className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isHigh
                              ? "text-rose-600"
                              : isLow
                                ? "text-blue-600"
                                : isBorderline
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                          }`}
                        />
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setParamToDelete({ param: item, index: idx })
                        }
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove parameter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSuccess={handleMemberCreatedFromModal}
        initialName={cleanName || rawPatientName || ""}
        initialGender={extractedData.gender || "Female"}
        initialAgeYears={extractedData.age || ""}
        initialAliases={
          rawPatientName && rawPatientName !== cleanName
            ? rawPatientName
            : undefined
        }
      />

      {/* Delete Confirmation Modal for Scanned Image */}
      <DeleteConfirmModal
        isOpen={imageToDelete !== null}
        onClose={() => setImageToDelete(null)}
        onConfirm={confirmRemoveImage}
        title={`Remove Scanned Page ${imageToDelete ? imageToDelete.index + 1 : ""}?`}
        message="Are you sure you want to remove this scanned report image from this panel? It will not be attached when you save to the database."
        confirmLabel="Yes, Remove Page"
        cancelLabel="Keep Page"
        previewImageUrl={imageToDelete?.image.imageUrl}
        itemBadge={imageToDelete ? `Page ${imageToDelete.index + 1}` : null}
      />

      {/* Delete Confirmation Modal for Parameter */}
      <DeleteConfirmModal
        isOpen={paramToDelete !== null}
        onClose={() => setParamToDelete(null)}
        onConfirm={confirmRemoveParam}
        title={`Remove "${paramToDelete?.param.param_name}"?`}
        message="Are you sure you want to remove this clinical biomarker from the report review table?"
        confirmLabel="Yes, Remove Biomarker"
        cancelLabel="Keep Biomarker"
      />

      {/* Zoomable Scanned Page Inspect & Add/Verify Test Modal */}
      {inspectPageIndex !== null && (
        <PageInspectModal
          isOpen={true}
          onClose={() => setInspectPageIndex(null)}
          images={images.map((img, idx) => ({
            id: img.id,
            pageNumber: img.pageNumber || idx + 1,
            imageUrl: img.imageUrl,
            unparsedLines: pagesSummary.find(
              (ps: any) => ps.pageNumber === (img.pageNumber || idx + 1),
            )?.unparsedLines,
          }))}
          initialPageIndex={inspectPageIndex ?? 0}
          initialTab={inspectModalTab}
          parameters={parameters}
          existingCategories={categories}
          labName={labName}
          onAddParameter={handleAddParameterManually}
          onUpdateParameter={handleUpdateParameter}
        />
      )}
    </div>
  );
}
