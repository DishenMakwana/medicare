import Link from "next/link";
import { FileText, Heart, Activity, ChevronRight, Droplet } from "lucide-react";
import { formatDate, formatMemberAge } from "@/lib/utils";
import type { MemberCardProps } from "@/types";

export function MemberCard({ member }: MemberCardProps) {
  const reportsCount = member.reports?.length || 0;
  const vitals = member.vitals || [];

  // Latest BP
  const latestBP = vitals.find(
    (v) => v.vitalType === "BLOOD_PRESSURE" && v.systolic && v.diastolic,
  );
  // Latest Sugar
  const latestSugar = vitals.find(
    (v) => v.vitalType === "BLOOD_SUGAR" && v.sugarValue,
  );

  return (
    <div className="bento-card p-6 sm:p-7 flex flex-col justify-between group">
      <div>
        {/* Header Profile Identity */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {member.relation && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full">
                    {member.relation}
                  </span>
                )}
                {member.bloodGroup && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full">
                    <Droplet className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    {member.bloodGroup}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                {member.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {member.gender || "Gender not set"}{" "}
                {formatMemberAge(member) ? `• ${formatMemberAge(member)}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Live Vitals Telemetry Box */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* BP Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>Blood Pressure</span>
            </div>
            {latestBP ? (
              <div>
                <span className="font-mono text-base font-black text-slate-900">
                  {latestBP.systolic}/{latestBP.diastolic}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {formatDate(latestBP.recordDate)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium block py-0.5">
                No logs yet
              </span>
            )}
          </div>

          {/* Sugar Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Blood Sugar</span>
            </div>
            {latestSugar ? (
              <div>
                <span className="font-mono text-base font-black text-slate-900">
                  {latestSugar.sugarValue}{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    mg/dL
                  </span>
                </span>
                <span className="text-[10px] text-teal-700 font-bold block">
                  {latestSugar.sugarContext || "Fasting"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium block py-0.5">
                No logs yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {reportsCount} {reportsCount === 1 ? "report" : "reports"} archived
          </span>
        </div>

        <Link
          href={`/members/${member.id}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-700 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all"
        >
          <span>Open Health Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
