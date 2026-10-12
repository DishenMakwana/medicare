"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Heart,
  FileText,
  Activity,
  Plus,
  UploadCloud,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { VitalsTrendChart } from "@/features/analytics/components/VitalsTrendChart";
import { VitalsModal } from "@/features/vitals/components/VitalsModal";
import { formatDateTime, formatDate, formatMemberAge } from "@/lib/utils";
import type { FamilyMember, MemberProfileClientProps } from "@/types";

export function MemberProfileClient({
  member,
  allMembers,
}: MemberProfileClientProps) {
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"REPORTS" | "VITALS">("REPORTS");

  const reports = member.reports || [];
  const vitals = member.vitals || [];

  // Metrics
  const totalBiomarkers = reports.reduce(
    (acc, r) => acc + (r.parameters?.length || 0),
    0,
  );
  const abnormalParams = reports.flatMap((r) =>
    (r.parameters || []).filter(
      (p) =>
        p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
    ),
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Back Link */}
      <div>
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Family Members</span>
        </Link>
      </div>

      {/* Member Profile Hero Card */}
      <div className="bento-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {member.relation || "Family Member"}
                </span>
                {member.bloodGroup && (
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Blood Group: {member.bloodGroup}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {member.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {member.gender || "Not specified"}
                {formatMemberAge(member, null, "long")
                  ? ` • ${formatMemberAge(member, null, "long")}`
                  : ""}
                {member.dateOfBirth
                  ? ` (DOB: ${formatDate(member.dateOfBirth)})`
                  : ""}
                {member.aliases
                  ? ` • Report OCR Aliases: "${member.aliases}"`
                  : ""}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVitalsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Log Vitals</span>
            </button>

            <Link
              href="/reports/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Report</span>
            </Link>
          </div>
        </div>

        {/* Member Telemetry Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 text-[11px]">
              Lab Reports
            </span>
            <span className="text-lg font-black text-slate-900">
              {reports.length}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 text-[11px]">
              Extracted Biomarkers
            </span>
            <span className="text-lg font-black text-teal-700">
              {totalBiomarkers}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 text-[11px]">
              Daily Vital Logs
            </span>
            <span className="text-lg font-black text-slate-900">
              {vitals.length}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5 text-[11px]">
              Abnormal Alerts
            </span>
            <span
              className={`text-lg font-black ${abnormalParams.length > 0 ? "text-rose-600" : "text-emerald-600"}`}
            >
              {abnormalParams.length}
            </span>
          </div>
        </div>

        {member.notes && (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-800">
              Health Profile Notes:{" "}
            </span>
            {member.notes}
          </div>
        )}
      </div>

      {/* Flagged Attention Panel for Member if any */}
      {abnormalParams.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>
              Out-of-Range Clinical Parameters Flagged for{" "}
              {member.name.split(" ")[0]} ({abnormalParams.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {abnormalParams.map((p, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-rose-200 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {p.paramName}
                  </span>
                  <span className="text-xs font-black text-rose-700 font-mono">
                    {p.valueNumber !== null ? p.valueNumber : p.valueText}{" "}
                    {p.unit || ""}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Ref: {p.refText || "Normal"}
                  </span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vitals Trend Chart Centerpiece */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900">
          Personal Vitals Trajectory ({member.name})
        </h2>
        <VitalsTrendChart vitals={vitals} />
      </div>

      {/* View Switcher Tabs: Reports vs Vitals History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("REPORTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "REPORTS"
                ? "bg-white text-slate-900 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Diagnostic Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VITALS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "VITALS"
                ? "bg-white text-slate-900 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home Vital Measurements ({vitals.length})
          </button>
        </div>

        {activeTab === "REPORTS" ? (
          reports.length === 0 ? (
            <div className="bento-card p-10 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                No medical reports uploaded yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Scan or upload lab reports for {member.name} to view automatic
                biomarker extraction.
              </p>
              <Link
                href="/reports/upload"
                className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                Upload First Report
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )
        ) : (
          <div className="bento-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Reading</th>
                    <th className="px-6 py-3.5">Context / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vitals.map((v) => {
                    const isBP = v.vitalType === "BLOOD_PRESSURE";
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {formatDateTime(v.recordDate)}
                        </td>
                        <td className="px-4 py-4">
                          {isBP ? (
                            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Blood Pressure
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              Blood Sugar
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold">
                          {isBP
                            ? `${v.systolic}/${v.diastolic} mmHg`
                            : `${v.sugarValue} mg/dL`}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {v.sugarContext && (
                            <span className="font-bold text-slate-700 mr-2">
                              {v.sugarContext}
                            </span>
                          )}
                          {v.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Vitals Modal */}
      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        members={allMembers}
        defaultMemberId={member.id}
      />
    </div>
  );
}
