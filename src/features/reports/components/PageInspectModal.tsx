"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Search,
  Move,
  Database,
  Building2,
  Check,
  ListFilter,
  Sparkles,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { getTestPresetsAction, saveTestPresetAction } from "../actions";
import type { TestPreset, PageInspectModalProps } from "@/types";

export function PageInspectModal({
  isOpen,
  onClose,
  images,
  initialPageIndex = 0,
  initialTab = "ADD_TEST",
  parameters,
  existingCategories = [],
  labName,
  onAddParameter,
  onUpdateParameter,
}: PageInspectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPageIndex);
  const [activeTab, setActiveTab] = useState<"ADD_TEST" | "VIEW_TESTS">(
    initialTab,
  );

  // Zoom / Pan / Rotate states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Add Parameter Form states
  const [paramName, setParamName] = useState("");
  const [category, setCategory] = useState("Complete Blood Count");
  const [valueType, setValueType] = useState<"number" | "text">("number");
  const [valueNumber, setValueNumber] = useState<string>("");
  const [valueText, setValueText] = useState<string>("");
  const [unit, setUnit] = useState<string>("mg/dL");
  const [refMin, setRefMin] = useState<string>("");
  const [refMax, setRefMax] = useState<string>("");
  const [refText, setRefText] = useState<string>("");
  const [clinicalMethod, setClinicalMethod] = useState("");
  const [saveToDb, setSaveToDb] = useState(true);
  const [justAddedSuccess, setJustAddedSuccess] = useState<string | null>(null);

  // Edit Mode state: when not null, points to the original index in parameters array
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingParamOriginalName, setEditingParamOriginalName] =
    useState<string>("");

  // Database Presets
  const [dbPresets, setDbPresets] = useState<TestPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [presetSearch, setPresetSearch] = useState("");

  // Search filter for existing tests tab
  const [existingSearchFilter, setExistingSearchFilter] = useState("");

  // Load database presets when opened
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingPresets(true);
    getTestPresetsAction(labName)
      .then((data) => {
        if (isMounted && data) {
          setDbPresets(data);
        }
      })
      .catch((err) => console.error("Error loading presets from db:", err))
      .finally(() => {
        if (isMounted) setIsLoadingPresets(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, labName]);

  // Sync initial index and tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(
        Math.max(0, Math.min(initialPageIndex, images.length - 1)),
      );
      setActiveTab(initialTab);
      setEditingIndex(null);
      setEditingParamOriginalName("");
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setPresetSearch("");
      setExistingSearchFilter("");
    }
  }, [isOpen, initialPageIndex, initialTab, images.length]);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetTransform();
    }
  }, [currentIndex, images.length, resetTransform]);

  const handlePrevPage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetTransform();
    }
  }, [currentIndex, resetTransform]);

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        if (e.key === "Escape") onClose();
        return;
      }

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(z + 0.25, 4));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === "0") {
        resetTransform();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNextPage, handlePrevPage, resetTransform]);

  const currentImg = images[currentIndex] || images[0] || { imageUrl: "" };
  const currentPageNum = currentImg.pageNumber || currentIndex + 1;

  // Filter existing parameters for current page, keeping track of originalIndex in parameters
  const pageParamsWithIndex = useMemo(() => {
    return parameters
      .map((param, originalIndex) => ({ param, originalIndex }))
      .filter(({ param }) => {
        const page = param.sourcePage ?? param.source_page ?? 1;
        return page === currentPageNum;
      });
  }, [parameters, currentPageNum]);

  const pageParams = useMemo(
    () => pageParamsWithIndex.map((item) => item.param),
    [pageParamsWithIndex],
  );

  const displayedExistingParams = useMemo(() => {
    return pageParamsWithIndex.filter(({ param }) => {
      const name = (param.paramName || param.param_name || "").toLowerCase();
      const cat = (param.category || "").toLowerCase();
      const q = existingSearchFilter.toLowerCase().trim();
      return !q || name.includes(q) || cat.includes(q);
    });
  }, [pageParamsWithIndex, existingSearchFilter]);

  function handleStartEdit(param: any, originalIndex: number) {
    setEditingIndex(originalIndex);
    const pName = param.paramName || param.param_name || "";
    setEditingParamOriginalName(pName);
    setParamName(pName);
    setCategory(param.category || "Complete Blood Count");

    const valNum = param.valueNumber ?? param.value_number;
    const valTxt = param.valueText || param.value_text;
    if (valNum !== null && valNum !== undefined && valNum !== "") {
      setValueType("number");
      setValueNumber(String(valNum));
      setValueText("");
    } else {
      setValueType("text");
      setValueText(valTxt || "");
      setValueNumber("");
    }

    setUnit(param.unit || "");
    const rMin = param.refMin ?? param.ref_min;
    const rMax = param.refMax ?? param.ref_max;
    setRefMin(rMin !== null && rMin !== undefined ? String(rMin) : "");
    setRefMax(rMax !== null && rMax !== undefined ? String(rMax) : "");
    setRefText(param.refText || param.ref_text || "");
    setClinicalMethod(param.clinicalMethod || param.clinical_method || "");
    setActiveTab("ADD_TEST");
  }

  function handleStartAddNew() {
    setEditingIndex(null);
    setEditingParamOriginalName("");
    setParamName("");
    setValueNumber("");
    setValueText("");
    setUnit("mg/dL");
    setRefMin("");
    setRefMax("");
    setRefText("");
    setClinicalMethod("");
    setActiveTab("ADD_TEST");
  }

  // Filter Presets by search query
  const filteredPresets = dbPresets.filter((p) => {
    if (!presetSearch.trim()) return true;
    const q = presetSearch.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.labName && p.labName.toLowerCase().includes(q))
    );
  });

  // Available categories
  const categoriesList = Array.from(
    new Set([
      "Complete Blood Count",
      "Lipid Profile",
      "Liver Function",
      "Kidney Function",
      "Metabolic",
      "Thyroid Profile",
      "Urine Examination",
      "Electrolytes",
      "Vitamins & Micronutrients",
      "Vitamins & Minerals",
      ...existingCategories,
    ]),
  );

  // Auto-fill from preset chip
  function handleSelectPreset(preset: TestPreset) {
    setParamName(preset.name);
    setCategory(preset.category);
    setUnit(preset.unit || "");
    setRefMin(
      preset.refMin !== null && preset.refMin !== undefined
        ? String(preset.refMin)
        : "",
    );
    setRefMax(
      preset.refMax !== null && preset.refMax !== undefined
        ? String(preset.refMax)
        : "",
    );
    setRefText(preset.refText || "");
    setClinicalMethod(preset.clinicalMethod || "");

    if (preset.refMin === null && preset.refMax === null && !preset.unit) {
      setValueType("text");
      setValueText(preset.refText || "");
    } else {
      setValueType("number");
    }
  }

  // Real-time computed clinical status
  function computeStatus(): string {
    if (valueType === "number" && valueNumber !== "") {
      const num = Number(valueNumber);
      const min = refMin !== "" ? Number(refMin) : null;
      const max = refMax !== "" ? Number(refMax) : null;
      if (max !== null && num > max) return "HIGH";
      if (min !== null && num < min) return "LOW";
      return "NORMAL";
    }
    if (valueType === "text" && valueText) {
      const t = valueText.toLowerCase();
      if (
        t.includes("positive") ||
        t.includes("reactive") ||
        t.includes("trace") ||
        t.includes("present")
      ) {
        return "HIGH";
      }
      if (t.includes("turbid") || t.includes("cloudy")) return "BORDERLINE";
      return "NORMAL";
    }
    return "NORMAL";
  }

  const computedStatus = computeStatus();

  // Form submit
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paramName.trim()) {
      alert("Please provide a parameter name.");
      return;
    }

    const calculatedStatus = computeStatus();
    const newParam = {
      category: category || "General",
      param_name: paramName.trim(),
      paramName: paramName.trim(),
      param_slug: paramName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_"),
      value_number:
        valueType === "number" && valueNumber !== ""
          ? Number(valueNumber)
          : null,
      valueNumber:
        valueType === "number" && valueNumber !== ""
          ? Number(valueNumber)
          : null,
      value_text:
        valueType === "text" && valueText !== "" ? valueText.trim() : null,
      valueText:
        valueType === "text" && valueText !== "" ? valueText.trim() : null,
      unit: unit.trim() || null,
      ref_min: refMin !== "" ? Number(refMin) : null,
      refMin: refMin !== "" ? Number(refMin) : null,
      ref_max: refMax !== "" ? Number(refMax) : null,
      refMax: refMax !== "" ? Number(refMax) : null,
      ref_text:
        refText.trim() || (refMin && refMax ? `${refMin} - ${refMax}` : null),
      refText:
        refText.trim() || (refMin && refMax ? `${refMin} - ${refMax}` : null),
      status: calculatedStatus,
      clinical_method: clinicalMethod.trim() || null,
      clinicalMethod: clinicalMethod.trim() || null,
      source_page: currentPageNum,
      sourcePage: currentPageNum,
      is_incomplete: false,
    };

    if (editingIndex !== null) {
      if (onUpdateParameter) {
        onUpdateParameter(editingIndex, newParam);
      }
      setJustAddedSuccess(
        `Updated "${newParam.param_name}" on Page ${currentPageNum}!`,
      );
      setEditingIndex(null);
      setEditingParamOriginalName("");
      setActiveTab("VIEW_TESTS");
    } else {
      if (onAddParameter) {
        onAddParameter(newParam);
      }
      setJustAddedSuccess(
        `Added "${newParam.param_name}" to Page ${currentPageNum}!`,
      );
      // Reset value inputs
      setValueNumber("");
      setValueText("");
    }

    // Persist as database preset for this laboratory if enabled
    if (saveToDb) {
      saveTestPresetAction({
        labName: labName || null,
        name: newParam.param_name,
        category: newParam.category,
        unit: newParam.unit,
        refMin: newParam.ref_min,
        refMax: newParam.ref_max,
        refText: newParam.ref_text,
        clinicalMethod: newParam.clinical_method,
      }).catch((err) => console.error("Could not save preset to DB:", err));
    }

    setTimeout(() => setJustAddedSuccess(null), 4000);
  }

  // Zoom handlers
  function handleZoomIn() {
    setZoom((z) => Math.min(z + 0.35, 4));
  }
  function handleZoomOut() {
    setZoom((z) => Math.max(z - 0.35, 0.5));
  }
  function handleRotate() {
    setRotation((r) => (r + 90) % 360);
  }

  // Pan handlers
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function handleMouseUp() {
    setIsDragging(false);
  }
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((z) => Math.max(0.5, Math.min(4, z + factor)));
  }

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col bg-slate-950 overflow-hidden select-none animate-in fade-in">
      <div className="w-full h-full flex flex-col overflow-hidden bg-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Add & Verify Lab Parameters
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Page {currentPageNum} of {images.length}
                </span>
                {labName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[280px]">
                    <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{labName}</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {pageParams.length} tests on this page
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect the scanned laboratory image on the left and enter or
                verify clinical biomarkers on the right
              </p>
            </div>
          </div>

          {/* Quick Page Switcher + Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Page (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-300">
                Pg {currentPageNum} / {images.length}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentIndex === images.length - 1}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Page (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100 min-h-0">
          {/* Left Canvas: Interactive Zoomable Image Viewer (6 of 12 cols on desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col bg-slate-950 overflow-hidden border-r border-slate-200">
            {/* Floating Top Controls */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-xs text-white">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-teal-400 min-w-[45px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetTransform}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                title="Reset Zoom & Pan (0)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Floating helper hint */}
            <div className="absolute bottom-16 left-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] text-slate-400 border border-slate-800 pointer-events-none">
              <Move className="w-3 h-3 text-teal-400" />
              <span>Drag to pan • Scroll wheel to zoom</span>
            </div>

            {/* Viewport Canvas */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full flex-1 relative flex items-center justify-center overflow-hidden select-none min-h-0 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <img
                src={currentImg.imageUrl}
                alt={`Scanned Page ${currentPageNum}`}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  transformOrigin: "center center",
                }}
                className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-2xl"
                draggable={false}
              />
            </div>

            {/* Bottom Page Thumbnails Strip */}
            <div className="h-14 bg-slate-900/95 border-t border-slate-800 px-3 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin">
              {images.map((img, idx) => {
                const pNum = img.pageNumber || idx + 1;
                const isSelected = idx === currentIndex;
                const pCount = parameters.filter(
                  (p) => (p.sourcePage ?? p.source_page ?? 1) === pNum,
                ).length;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      resetTransform();
                    }}
                    className={`relative rounded-xl overflow-hidden h-12 w-14 shrink-0 border-2 transition-all ${
                      isSelected
                        ? "border-teal-400 ring-2 ring-teal-400/40 scale-105"
                        : "border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Thumbnail ${pNum}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 text-[9px] font-bold text-white text-center py-0.5">
                      Pg {pNum} ({pCount})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Actions, Database Presets & Form (6 of 12 cols on desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* View Mode Switcher Tabs */}
            <div className="p-3 bg-white border-b border-slate-200/90 shrink-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "VIEW_TESTS" && editingIndex === null) {
                      handleStartAddNew();
                    } else {
                      setActiveTab("ADD_TEST");
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "ADD_TEST"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {editingIndex !== null ? (
                    <Pencil className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {editingIndex !== null
                      ? `Edit "${editingParamOriginalName || "Biomarker"}"`
                      : "Add / Fill Biomarker"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("VIEW_TESTS")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "VIEW_TESTS"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Extracted Tests ({pageParams.length})</span>
                </button>
              </div>

              {justAddedSuccess && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{justAddedSuccess}</span>
                </div>
              )}
            </div>

            {/* TAB 1: ADD / FILL BIOMARKER FORM WITH DATABASE PRESETS */}
            {activeTab === "ADD_TEST" && (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-50">
                <form
                  id="biomarker-form"
                  onSubmit={handleFormSubmit}
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0"
                >
                  {/* Active Edit Mode Banner */}
                  {editingIndex !== null && (
                    <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/90 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-teal-950">
                            Editing existing biomarker: &ldquo;
                            {editingParamOriginalName || paramName}&rdquo;
                          </div>
                          <div className="text-[11px] text-teal-700 font-medium">
                            Updating will modify this test directly without
                            creating a duplicate.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartAddNew}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-colors shrink-0"
                      >
                        Cancel Edit / Add New
                      </button>
                    </div>
                  )}
                  {/* Database Presets Bar with Search */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-teal-600" />
                        <span>Database Presets</span>
                        {labName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 truncate max-w-[200px]">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{labName}</span>
                          </span>
                        )}
                      </label>
                      <span className="text-[10px] font-medium text-slate-400">
                        {filteredPresets.length} available
                      </span>
                    </div>

                    {/* Preset Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search presets by test name, category, or lab..."
                        value={presetSearch}
                        onChange={(e) => setPresetSearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/70"
                      />
                      {presetSearch && (
                        <button
                          type="button"
                          onClick={() => setPresetSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1 pr-1">
                      {filteredPresets.slice(0, 36).map((preset) => {
                        const isSelected =
                          paramName.toLowerCase() === preset.name.toLowerCase();
                        const isLabMatch =
                          labName &&
                          preset.labName &&
                          preset.labName
                            .toLowerCase()
                            .includes(labName.toLowerCase().trim());

                        return (
                          <button
                            key={preset.id || preset.name}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`text-xs px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-left border ${
                              isSelected
                                ? "bg-teal-700 text-white border-teal-700 shadow-xs font-bold"
                                : isLabMatch
                                  ? "bg-teal-50 text-teal-800 border-teal-200/90 hover:bg-teal-100 font-semibold"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected
                                  ? "bg-white"
                                  : isLabMatch
                                    ? "bg-teal-500"
                                    : "bg-slate-400"
                              }`}
                            />
                            <span>{preset.name}</span>
                            {preset.unit && (
                              <span
                                className={`text-[10px] ${
                                  isSelected
                                    ? "text-teal-200"
                                    : "text-slate-400"
                                }`}
                              >
                                ({preset.unit})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Fields Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Category *
                        </label>
                        <div className="relative">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            {categoriesList.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Parameter / Test Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Parameter / Test Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hemoglobin or Serum Creatinine"
                          value={paramName}
                          onChange={(e) => setParamName(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Result Type & Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Result Type
                        </label>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setValueType("number")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              valueType === "number"
                                ? "bg-white text-teal-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Numeric
                          </button>
                          <button
                            type="button"
                            onClick={() => setValueType("text")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              valueType === "text"
                                ? "bg-white text-teal-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Textual
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Observed Test Result *
                        </label>
                        {valueType === "number" ? (
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 13.5"
                            value={valueNumber}
                            onChange={(e) => setValueNumber(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Negative, Reactive, Nil"
                            value={valueText}
                            onChange={(e) => setValueText(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          placeholder="g/dL, mg/dL, %"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Biological Reference Ranges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Ref Min
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 12.0"
                          value={refMin}
                          onChange={(e) => setRefMin(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Ref Max
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 15.5"
                          value={refMax}
                          onChange={(e) => setRefMax(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Ref Text (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. < 200 Desirable"
                          value={refText}
                          onChange={(e) => setRefText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Clinical Method & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Clinical Methodology (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. SLS Method, Hexokinase, CLIA"
                          value={clinicalMethod}
                          onChange={(e) => setClinicalMethod(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Computed Clinical Status
                        </label>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                              computedStatus === "HIGH"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : computedStatus === "LOW"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                computedStatus === "HIGH"
                                  ? "bg-rose-500"
                                  : computedStatus === "LOW"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            />
                            <span>{computedStatus}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Evaluated against normal limits)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Save to DB checkbox */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveToDb}
                          onChange={(e) => setSaveToDb(e.target.checked)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                          Save/update test preset in database for{" "}
                          <strong className="text-teal-700">
                            {labName || "Current Laboratory"}
                          </strong>
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-400 ml-6.5 mt-0.5">
                        Remembers this test name, unit, reference interval, and
                        clinical method for future report uploads
                      </p>
                    </div>
                  </div>
                </form>

                {/* Pinned Bottom Submit Action Bar - Always visible on any MacBook screen */}
                <div className="px-5 py-3 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                  <div className="text-xs text-slate-500 font-medium">
                    {editingIndex !== null ? (
                      <span className="text-teal-700 font-bold flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        Modifying existing biomarker
                      </span>
                    ) : (
                      <span>
                        Page {currentPageNum} • {pageParams.length} tests on
                        this page
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {editingIndex !== null && (
                      <button
                        type="button"
                        onClick={handleStartAddNew}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      form="biomarker-form"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {editingIndex !== null ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Update Biomarker on Page {currentPageNum}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add Biomarker to Page {currentPageNum}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VIEW EXTRACTED TESTS ON THIS PAGE */}
            {activeTab === "VIEW_TESTS" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search filter within this page's tests */}
                <div className="p-3 bg-white border-b border-slate-200/90 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search biomarker name or category on this page..."
                      value={existingSearchFilter}
                      onChange={(e) => setExistingSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Test Cards List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {pageParams.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No Biomarkers Detected on Page {currentPageNum}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                        This page may contain clinical notes, header
                        disclaimers, or tests with faint print.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartAddNew}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          Manually Add Test From Page {currentPageNum}
                        </span>
                      </button>
                    </div>
                  ) : displayedExistingParams.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No tests match &ldquo;{existingSearchFilter}&rdquo; on
                      this page.
                    </div>
                  ) : (
                    displayedExistingParams.map(
                      ({ param, originalIndex }, pIdx) => {
                        const name =
                          param.paramName ||
                          param.param_name ||
                          "Unknown Biomarker";
                        const cat = param.category || "General";
                        const valNum = param.valueNumber ?? param.value_number;
                        const valTxt = param.valueText || param.value_text;
                        const displayVal =
                          valNum !== null && valNum !== undefined
                            ? String(valNum)
                            : valTxt || "Pending";
                        const un = param.unit || "";
                        const rMin = param.refMin ?? param.ref_min;
                        const rMax = param.refMax ?? param.ref_max;
                        const rTxt = param.refText || param.ref_text;
                        const st = (param.status || "NORMAL").toUpperCase();
                        const meth =
                          param.clinicalMethod || param.clinical_method;

                        const isHigh = st === "HIGH";
                        const isLow = st === "LOW";

                        return (
                          <div
                            key={pIdx}
                            className={`p-3.5 rounded-2xl bg-white border transition-all hover:shadow-md ${
                              isHigh
                                ? "border-rose-300 ring-1 ring-rose-200"
                                : isLow
                                  ? "border-amber-300 ring-1 ring-amber-200"
                                  : "border-slate-200/90"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                                  {cat}
                                </span>
                                <span className="text-sm font-extrabold text-slate-900">
                                  {name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartEdit(param, originalIndex)
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-300 text-[11px] font-extrabold transition-all shadow-2xs active:scale-95 cursor-pointer"
                                  title={`Edit "${name}" directly`}
                                >
                                  <Pencil className="w-3 h-3 text-teal-600" />
                                  <span>Edit</span>
                                </button>

                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                    isHigh
                                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                                      : isLow
                                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {st}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  Extracted Value
                                </span>
                                <span
                                  className={`font-mono text-base font-black ${
                                    isHigh
                                      ? "text-rose-600"
                                      : isLow
                                        ? "text-amber-600"
                                        : "text-slate-900"
                                  }`}
                                >
                                  {displayVal}{" "}
                                  {un && (
                                    <span className="text-xs font-normal text-slate-500">
                                      {un}
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  Biological Reference
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {rMin !== null &&
                                  rMin !== undefined &&
                                  rMax !== null &&
                                  rMax !== undefined
                                    ? `${rMin} - ${rMax} ${un}`
                                    : rTxt || "No interval specified"}
                                </span>
                              </div>
                            </div>

                            {meth && (
                              <div className="mt-1.5 text-[10px] text-slate-400 italic">
                                Method: {meth}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )
                  )}
                </div>

                {/* Bottom Add Test shortcut */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Showing <strong>{displayedExistingParams.length}</strong> of{" "}
                    {pageParams.length} tests on Page {currentPageNum}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartAddNew}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Test</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
