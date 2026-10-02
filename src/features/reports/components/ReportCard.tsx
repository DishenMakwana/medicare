import Link from "next/link";
import { MedicalReport, ReportParameter } from "@/types";
import {
  FileText,
  Calendar,
  Clock,
  Building2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Stethoscope,
  Activity,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReportCardProps {
  report: MedicalReport;
}

export function ReportCard({ report }: ReportCardProps) {
  const memberName = report.familyMember?.name || "Family Member";
  const params: ReportParameter[] = report.parameters || [];
  const paramsCount = params.length;

  // Separate abnormal & normal parameters
  const abnormalParams = params.filter(
    (p) => p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
  );
  const normalParams = params.filter(
    (p) => p.status !== "HIGH" && p.status !== "LOW" && p.status !== "ABNORMAL",
  );

  const abnormalCount = abnormalParams.length;
  const optimalCount = paramsCount - abnormalCount;
  const optimalPercent =
    paramsCount > 0 ? Math.round((optimalCount / paramsCount) * 100) : 100;
  const abnormalPercent = 100 - optimalPercent;

  // Prioritize showing flagged tests first, then top normal tests up to 4 total
  const previewParams = [...abnormalParams, ...normalParams].slice(0, 4);

  const pageCount = report.images?.length || 1;

  return (
    <div className="bento-card p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col justify-between group relative">
      <div>
        {/* Top Header: Member, Lab, Title, and Overall Health Status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-sm shrink-0 group-hover:scale-105 group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white transition-all duration-200">
              <FileText className="w-6 h-6 transition-colors" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/80">
                  {memberName}
                </span>

                {report.labName && (
                  <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1 truncate max-w-[220px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{report.labName}</span>
                  </span>
                )}

                {report.registrationNo && (
                  <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                    #{report.registrationNo}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2">
                {report.title}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          {abnormalCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{abnormalCount} Out-of-Range</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>All Optimal</span>
            </span>
          )}
        </div>

        {/* Diagnostic Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-3 rounded-2xl bg-slate-50/90 border border-slate-100 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Report: {formatDate(report.reportDate)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate text-teal-800">
              Sample:{" "}
              {report.collectionDate
                ? formatDate(report.collectionDate)
                : formatDate(report.reportDate)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {report.doctorRef ? `Dr. ${report.doctorRef}` : "General / Self"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 justify-start sm:justify-end text-slate-500 truncate">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {pageCount} {pageCount === 1 ? "Scanned Page" : "Scanned Pages"}
            </span>
          </div>
        </div>

        {/* Health Test Distribution Meter */}
        {paramsCount > 0 && (
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-teal-600" />
                Panel Health Balance
              </span>
              <span>
                <strong className="text-emerald-700">
                  {optimalCount} Normal
                </strong>{" "}
                ({optimalPercent}%) •{" "}
                <strong className="text-rose-700">
                  {abnormalCount} Flagged
                </strong>{" "}
                ({abnormalPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${optimalPercent}%` }}
                title={`${optimalCount} Optimal Tests`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${abnormalPercent}%` }}
                title={`${abnormalCount} Flagged Tests`}
              />
            </div>
          </div>
        )}

        {/* Key Biomarkers Preview Grid (Highlighting out-of-range first) */}
        {previewParams.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Key Biomarkers</span>
              {paramsCount > previewParams.length && (
                <span className="text-[11px] font-semibold text-teal-700">
                  +{paramsCount - previewParams.length} more in panel
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {previewParams.map((p) => {
                const isAbnormal =
                  p.status === "HIGH" ||
                  p.status === "LOW" ||
                  p.status === "ABNORMAL";
                const isHigh = p.status === "HIGH";
                const isLow = p.status === "LOW";

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isAbnormal
                        ? "bg-rose-50/70 border-rose-200/90 text-rose-950"
                        : "bg-slate-50/70 border-slate-200/70 text-slate-800"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-extrabold truncate text-slate-900">
                        {p.paramName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        Ref:{" "}
                        {p.refText
                          ? p.refText
                          : p.refMin !== null && p.refMax !== null
                            ? `${p.refMin} - ${p.refMax}`
                            : "Normal"}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-black text-xs ${
                          isAbnormal ? "text-rose-700" : "text-slate-900"
                        }`}
                      >
                        {p.valueNumber !== null ? p.valueNumber : p.valueText}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">
                          {p.unit || ""}
                        </span>
                      </div>
                      {isAbnormal ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded">
                          {isHigh ? "High ↑" : isLow ? "Low ↓" : "Flagged ⚠"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          Optimal ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA & Summary Bar */}
      <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-medium">
          <strong className="text-slate-800 font-bold">{paramsCount}</strong>{" "}
          clinical tests extracted
        </span>

        <Link
          href={`/reports/${report.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20 group-hover:shadow-md transition-all group-hover:translate-x-0.5 shrink-0"
        >
          <span>Inspect Diagnostic Panel</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
