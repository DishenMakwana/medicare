"use client";

import { useState } from "react";
import { DailyVital, FamilyMember } from "@/types";
import { VitalsTrendChart } from "@/features/analytics/components/VitalsTrendChart";
import { VitalsModal } from "@/features/vitals/components/VitalsModal";
import {
  Heart,
  Activity,
  Plus,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface VitalsDashboardClientProps {
  vitals: DailyVital[];
  members: FamilyMember[];
}

export function VitalsDashboardClient({
  vitals,
  members,
}: VitalsDashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<
    "ALL" | "BLOOD_PRESSURE" | "BLOOD_SUGAR"
  >("ALL");

  // Calculate 7-day averages for telemetry
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const bpLogs7d = vitals.filter(
    (v) =>
      v.vitalType === "BLOOD_PRESSURE" &&
      new Date(v.recordDate) >= sevenDaysAgo &&
      v.systolic &&
      v.diastolic,
  );
  const avgSys = bpLogs7d.length
    ? Math.round(
        bpLogs7d.reduce((acc, v) => acc + (v.systolic || 0), 0) /
          bpLogs7d.length,
      )
    : null;
  const avgDia = bpLogs7d.length
    ? Math.round(
        bpLogs7d.reduce((acc, v) => acc + (v.diastolic || 0), 0) /
          bpLogs7d.length,
      )
    : null;

  const fastingLogs7d = vitals.filter(
    (v) =>
      v.vitalType === "BLOOD_SUGAR" &&
      v.sugarContext === "FASTING" &&
      new Date(v.recordDate) >= sevenDaysAgo &&
      v.sugarValue,
  );
  const avgFasting = fastingLogs7d.length
    ? Math.round(
        (fastingLogs7d.reduce((acc, v) => acc + (v.sugarValue || 0), 0) /
          fastingLogs7d.length) *
          10,
      ) / 10
    : null;

  const ppLogs7d = vitals.filter(
    (v) =>
      v.vitalType === "BLOOD_SUGAR" &&
      v.sugarContext === "POST_PRANDIAL" &&
      new Date(v.recordDate) >= sevenDaysAgo &&
      v.sugarValue,
  );
  const avgPP = ppLogs7d.length
    ? Math.round(
        (ppLogs7d.reduce((acc, v) => acc + (v.sugarValue || 0), 0) /
          ppLogs7d.length) *
          10,
      ) / 10
    : null;

  // Filtered Vitals
  const filteredVitals = vitals.filter((v) => {
    const matchesMember =
      selectedMember === "ALL" || String(v.familyMemberId) === selectedMember;
    const matchesType = selectedType === "ALL" || v.vitalType === selectedType;
    return matchesMember && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daily Vitals Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manual blood pressure (BP) and blood sugar (glucose) logs recorded
            at home.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Daily Measurement</span>
        </button>
      </div>

      {/* 7-Day Clinical Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              7D Avg Blood Pressure
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>
          {avgSys && avgDia ? (
            <div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-slate-900">
                  {avgSys}/{avgDia}
                </span>
                <span className="text-xs text-slate-400 font-sans">mmHg</span>
              </div>
              <span
                className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  avgSys < 120 && avgDia < 80
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {avgSys < 120 && avgDia < 80 ? "Optimal BP" : "Elevated Range"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1 font-medium">
              No 7-day readings
            </div>
          )}
        </div>

        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              7D Fasting Glucose
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          {avgFasting ? (
            <div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-teal-700">
                  {avgFasting}
                </span>
                <span className="text-xs text-slate-400 font-sans">mg/dL</span>
              </div>
              <span
                className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  avgFasting < 100
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {avgFasting < 100 ? "Optimal Fasting" : "Pre-meal Watch"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1 font-medium">
              No 7-day readings
            </div>
          )}
        </div>

        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              7D Post-Meal Sugar
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          {avgPP ? (
            <div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-slate-900">
                  {avgPP}
                </span>
                <span className="text-xs text-slate-400 font-sans">mg/dL</span>
              </div>
              <span
                className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  avgPP < 140
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {avgPP < 140 ? "Normal Post-Meal" : "Elevated Post-Meal"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1 font-medium">
              No 7-day readings
            </div>
          )}
        </div>

        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Recorded Logs
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {vitals.length}
              </span>
              <span className="text-xs text-slate-400">data points</span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Across family vault
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart Centerpiece */}
      <VitalsTrendChart vitals={filteredVitals} />

      {/* Historical Measurements Table with Filters */}
      <div className="bento-card overflow-hidden shadow-sm">
        {/* Table Filter Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Historical Measurement Logs
            </h2>
            <p className="text-xs text-slate-400">
              Granular log of BP and blood sugar entries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Member */}
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <div className="relative">
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="px-3 py-1.5 pr-7 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                >
                  <option value="ALL">All Family Members</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center p-0.5 bg-white border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedType("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("BLOOD_PRESSURE")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === "BLOOD_PRESSURE"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                BP
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("BLOOD_SUGAR")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === "BLOOD_SUGAR"
                    ? "bg-teal-700 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sugar
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 font-bold">
              <tr>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Family Member</th>
                <th className="px-4 py-3.5">Vital Type</th>
                <th className="px-6 py-3.5">Measurement</th>
                <th className="px-4 py-3.5">Clinical Assessment</th>
                <th className="px-6 py-3.5">Context & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVitals.map((v) => {
                const isBP = v.vitalType === "BLOOD_PRESSURE";
                const memberName = v.familyMember?.name || "Family Member";

                let stageBadge = {
                  label: "Normal",
                  color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                };
                if (isBP && v.systolic && v.diastolic) {
                  if (v.systolic >= 140 || v.diastolic >= 90) {
                    stageBadge = {
                      label: "Stage 2 Hypertension",
                      color: "bg-rose-50 text-rose-700 border-rose-200",
                    };
                  } else if (v.systolic >= 130 || v.diastolic >= 80) {
                    stageBadge = {
                      label: "Stage 1 Hypertension",
                      color: "bg-orange-50 text-orange-700 border-orange-200",
                    };
                  } else if (v.systolic >= 120) {
                    stageBadge = {
                      label: "Elevated BP",
                      color: "bg-amber-50 text-amber-700 border-amber-200",
                    };
                  }
                } else if (!isBP && v.sugarValue) {
                  if (v.sugarContext === "FASTING") {
                    if (v.sugarValue >= 126) {
                      stageBadge = {
                        label: "Diabetic (>=126)",
                        color: "bg-rose-50 text-rose-700 border-rose-200",
                      };
                    } else if (v.sugarValue >= 100) {
                      stageBadge = {
                        label: "Prediabetic (100-125)",
                        color: "bg-amber-50 text-amber-700 border-amber-200",
                      };
                    } else {
                      stageBadge = {
                        label: "Optimal Fasting (<100)",
                        color:
                          "bg-emerald-50 text-emerald-700 border-emerald-200",
                      };
                    }
                  } else {
                    if (v.sugarValue >= 200) {
                      stageBadge = {
                        label: "Elevated (>=200)",
                        color: "bg-rose-50 text-rose-700 border-rose-200",
                      };
                    } else if (v.sugarValue >= 140) {
                      stageBadge = {
                        label: "Impaired (140-199)",
                        color: "bg-amber-50 text-amber-700 border-amber-200",
                      };
                    } else {
                      stageBadge = {
                        label: "Normal (<140)",
                        color:
                          "bg-emerald-50 text-emerald-700 border-emerald-200",
                      };
                    }
                  }
                }

                return (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {formatDateTime(v.recordDate)}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">
                      {memberName}
                    </td>

                    <td className="px-4 py-4">
                      {isBP ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          Blood Pressure
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                          <Activity className="w-3.5 h-3.5 text-teal-600" />
                          Blood Sugar
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {isBP ? (
                        <div className="font-mono">
                          <span className="text-base font-black text-slate-900">
                            {v.systolic}/{v.diastolic}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">
                            mmHg
                          </span>
                          {v.pulseRate && (
                            <span className="text-xs text-slate-400 ml-2">
                              ({v.pulseRate} bpm)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono">
                          <span className="text-base font-black text-slate-900">
                            {v.sugarValue}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">
                            mg/dL
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${stageBadge.color}`}
                      >
                        {stageBadge.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        {v.sugarContext && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                            {v.sugarContext}
                          </span>
                        )}
                        <span className="truncate max-w-xs">
                          {v.notes || "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      <VitalsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        members={members}
      />
    </div>
  );
}
