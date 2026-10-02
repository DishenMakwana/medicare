import Link from "next/link";
import { db } from "@/lib/db";
import { MemberCard } from "@/features/members/components/MemberCard";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { VitalsTrendChart } from "@/features/analytics/components/VitalsTrendChart";
import { StatCard } from "@/components/ui/StatCard";
import {
  Users,
  FileText,
  Heart,
  Activity,
  AlertTriangle,
  Plus,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const members = await db.getMembers();
  const reports = await db.getReports();
  const vitals = await db.getVitals();

  const totalReports = reports.length;
  const totalParameters = reports.reduce(
    (acc, r) => acc + (r.parameters?.length || 0),
    0,
  );

  // Latest Vitals
  const latestBP = vitals.find(
    (v) => v.vitalType === "BLOOD_PRESSURE" && v.systolic && v.diastolic,
  );
  const latestSugar = vitals.find(
    (v) => v.vitalType === "BLOOD_SUGAR" && v.sugarValue,
  );

  // Find all flagged out-of-range clinical parameters across reports
  const flaggedParams = reports.flatMap((r) =>
    (r.parameters || [])
      .filter(
        (p) =>
          p.status === "HIGH" || p.status === "LOW" || p.status === "ABNORMAL",
      )
      .map((p) => ({
        ...p,
        reportId: r.id,
        reportTitle: r.title,
        reportDate: r.reportDate,
        memberName: r.familyMember?.name || "Family Member",
      })),
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 bento-card bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Encrypted Local Vault • 100% Open-Source OCR</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Family Medical Intelligence
          </h1>
          <p className="text-sm text-slate-300 font-normal leading-relaxed">
            Maintain diagnostic reports for your entire family, extract
            parameters from phone camera photos via local OCR, and analyze
            longitudinal health trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Link
            href="/reports/upload"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-slate-900 bg-white hover:bg-slate-100 shadow-lg shadow-black/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-teal-600" />
            <span>Upload Test Reports</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid: Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BP Telemetry */}
        <StatCard
          title="Current Blood Pressure"
          value={
            latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "-- / --"
          }
          subtext={
            latestBP
              ? `Measured ${formatDate(latestBP.recordDate)}`
              : "No readings recorded yet"
          }
          icon={Heart}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          badge={
            latestBP
              ? {
                  text:
                    latestBP.systolic && latestBP.systolic >= 130
                      ? "Stage 1"
                      : "Optimal",
                  color:
                    latestBP.systolic && latestBP.systolic >= 130
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200",
                }
              : undefined
          }
        />

        {/* Sugar Telemetry */}
        <StatCard
          title="Fasting Blood Sugar"
          value={latestSugar ? `${latestSugar.sugarValue} mg/dL` : "-- mg/dL"}
          subtext={
            latestSugar
              ? `${latestSugar.sugarContext || "Fasting"} • ${formatDate(latestSugar.recordDate)}`
              : "No readings recorded yet"
          }
          icon={Activity}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          badge={
            latestSugar
              ? {
                  text: "Recorded",
                  color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                }
              : undefined
          }
        />

        {/* Diagnostic Reports */}
        <StatCard
          title="Stored Reports"
          value={totalReports}
          subtext={
            totalReports > 0
              ? `${reports.reduce((acc, r) => acc + (r.images?.length || 1), 0)} scanned pages in vault`
              : "No reports uploaded yet"
          }
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        {/* Monitored Biomarkers */}
        <StatCard
          title="Monitored Biomarkers"
          value={totalParameters}
          subtext={
            totalParameters > 0
              ? "Extracted from reports"
              : "No parameters recorded yet"
          }
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          badge={
            totalParameters > 0
              ? {
                  text: `${totalParameters} Metrics`,
                  color: "bg-purple-50 text-purple-700 border-purple-200",
                }
              : undefined
          }
        />
      </div>

      {/* Bento Grid: Charts & Actionable Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts Longitudinal Trends */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9">
          <VitalsTrendChart vitals={vitals} />
        </div>

        {/* Right: Attention Needed Cards */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 bento-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    flaggedParams.length > 0
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {flaggedParams.length > 0 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {flaggedParams.length > 0
                      ? "Attention Required"
                      : "Health Status"}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {flaggedParams.length > 0
                      ? "Out-of-range clinical flags"
                      : "Optimal clinical parameters"}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  flaggedParams.length > 0
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {flaggedParams.length > 0
                  ? `${flaggedParams.length} flagged`
                  : "Optimal"}
              </span>
            </div>

            {/* List of Flagged Biomarkers or Empty State */}
            {flaggedParams.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  No Out-of-Range Flags
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  When you upload laboratory reports with abnormal parameters,
                  they will be flagged here for monitoring.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {flaggedParams.slice(0, 4).map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/reports/${item.reportId}`}
                    className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.paramName}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-mono text-sm font-black text-rose-700">
                        {item.valueNumber !== null
                          ? item.valueNumber
                          : item.valueText}{" "}
                        <span className="text-[11px] font-normal text-slate-400">
                          {item.unit || ""}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {item.refText || "Normal"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="font-semibold text-teal-800">
                        {item.memberName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.reportDate)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/reports"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              <span>View in All Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Grid: Family Profiles Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Family Members
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Individual health history, personal vitals, and report vaults
            </p>
          </div>
          <Link
            href="/members"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            <span>Family Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="bento-card p-10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              No Family Members Added Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add family members to automatically map patient names from medical
              reports and track individual health histories.
            </p>
            <Link
              href="/members"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Family Member</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* Bento Grid: Recent Diagnostic Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Recent Medical Reports
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified clinical laboratory test panels
            </p>
          </div>
          <Link
            href="/reports"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            <span>All Reports ({reports.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="bento-card p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              No Medical Reports in Vault
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload photos or scans of your blood tests, lipid panels, or
              doctor prescriptions to extract parameters.
            </p>
            <Link
              href="/reports/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Medical Report</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.slice(0, 6).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
