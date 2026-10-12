"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  UploadCloud,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Building,
  User,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { ReportCard } from "@/features/reports/components/ReportCard";
import type {
  MedicalReport,
  FamilyMember,
  ReportsVaultClientProps,
} from "@/types";

export function ReportsVaultClient({
  reports,
  members,
}: ReportsVaultClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "FLAGGED" | "OPTIMAL"
  >("ALL");

  // Summary Metrics
  const totalReports = reports.length;
  const totalBiomarkers = reports.reduce(
    (acc, r) => acc + (r.parameters?.length || 0),
    0,
  );
  const flaggedReports = reports.filter((r) =>
    (r.parameters || []).some(
      (p) =>
        p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
    ),
  ).length;
  const optimalReports = totalReports - flaggedReports;

  // Filter Logic
  const filteredReports = reports.filter((r) => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      (r.labName && r.labName.toLowerCase().includes(q)) ||
      (r.familyMember?.name && r.familyMember.name.toLowerCase().includes(q)) ||
      (r.rawPatientName && r.rawPatientName.toLowerCase().includes(q)) ||
      (r.registrationNo && r.registrationNo.toLowerCase().includes(q)) ||
      (r.parameters || []).some((p) => p.paramName.toLowerCase().includes(q));

    // Member match
    const matchesMember =
      selectedMember === "ALL" || String(r.familyMemberId) === selectedMember;

    // Status match
    const isAbnormal = (r.parameters || []).some(
      (p) =>
        p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
    );
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "FLAGGED" && isAbnormal) ||
      (statusFilter === "OPTIMAL" && !isAbnormal);

    return matchesSearch && matchesMember && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Medical Reports Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and analyze diagnostic lab panels and extracted
            biomarkers across your family.
          </p>
        </div>

        <Link
          href="/reports/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Lab Report</span>
        </Link>
      </div>

      {/* KPI Telemetry Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Diagnostic Reports
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalReports}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              vault files
            </span>
          </div>
        </div>

        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Biomarkers Extracted
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">
              {totalBiomarkers}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              clinical tests
            </span>
          </div>
        </div>

        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Flagged Out-of-Range
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">
              {flaggedReports}
            </span>
            <span className="text-xs text-rose-500 font-bold">
              require review
            </span>
          </div>
        </div>

        <div className="bento-card p-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Optimal Panels
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {optimalReports}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              within limits
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bento-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test name, lab, patient name, registration number, or biomarker..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Member Filter Dropdown */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="relative">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="px-3 py-2.5 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Family Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relation})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Reports ({reports.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("FLAGGED")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "FLAGGED"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Out-of-Range Only ({flaggedReports})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("OPTIMAL")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "OPTIMAL"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>All Optimal ({optimalReports})</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bento-card p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            No medical reports match your filter
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Try adjusting your search query, family member selection, or status
            filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedMember("ALL");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
