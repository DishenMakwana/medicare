"use client";

import { useState } from "react";
import { Heart, Activity, Calendar, TrendingUp, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { formatDate } from "@/lib/utils";
import type { DailyVital, VitalsTrendChartProps } from "@/types";

export function VitalsTrendChart({ vitals }: VitalsTrendChartProps) {
  const [activeTab, setActiveTab] = useState<"BP" | "SUGAR">("BP");
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "ALL">("ALL");

  // Sort ascending by date
  const sorted = [...vitals].sort(
    (a, b) =>
      new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime(),
  );

  // Filter by time range relative to latest vital
  const latestDate =
    sorted.length > 0
      ? new Date(sorted[sorted.length - 1].recordDate).getTime()
      : 0;
  const filtered = sorted.filter((v) => {
    const vTime = new Date(v.recordDate).getTime();
    if (timeRange === "7D") return latestDate - vTime <= 7 * 86400000;
    if (timeRange === "30D") return latestDate - vTime <= 30 * 86400000;
    return true;
  });

  const bpData = filtered
    .filter(
      (v) => v.vitalType === "BLOOD_PRESSURE" && v.systolic && v.diastolic,
    )
    .map((v) => ({
      date: formatDate(v.recordDate),
      timestamp: new Date(v.recordDate).getTime(),
      systolic: v.systolic,
      diastolic: v.diastolic,
      pulse: v.pulseRate,
      notes: v.notes,
    }));

  const sugarData = filtered
    .filter((v) => v.vitalType === "BLOOD_SUGAR" && v.sugarValue)
    .map((v) => ({
      date: formatDate(v.recordDate),
      timestamp: new Date(v.recordDate).getTime(),
      sugar: v.sugarValue,
      context: v.sugarContext || "FASTING",
      notes: v.notes,
    }));

  // Calculate Averages for Quick Telemetry
  const avgSys = bpData.length
    ? Math.round(
        bpData.reduce((acc, d) => acc + (d.systolic || 0), 0) / bpData.length,
      )
    : null;
  const avgDia = bpData.length
    ? Math.round(
        bpData.reduce((acc, d) => acc + (d.diastolic || 0), 0) / bpData.length,
      )
    : null;
  const avgSugar = sugarData.length
    ? Math.round(
        sugarData.reduce((acc, d) => acc + (d.sugar || 0), 0) /
          sugarData.length,
      )
    : null;

  return (
    <div className="bento-card p-6 sm:p-8 space-y-6">
      {/* Top Header: Controls & Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
              Longitudinal Monitoring
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Real-Time Telemetry
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            {activeTab === "BP"
              ? "Blood Pressure History (Systolic / Diastolic)"
              : "Blood Glucose (Sugar) Progression"}
          </h3>
        </div>

        {/* Tab Switcher & Range Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* BP vs Sugar Switch */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab("BP")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "BP"
                  ? "bg-white text-rose-700 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>Blood Pressure</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SUGAR")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "SUGAR"
                  ? "bg-white text-teal-700 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Blood Sugar</span>
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/60 rounded-xl text-[11px] font-bold text-slate-600">
            {(["7D", "30D", "ALL"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === range
                    ? "bg-slate-900 text-white shadow-sm"
                    : "hover:text-slate-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Averages Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activeTab === "BP" ? (
          <>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Avg Systolic
              </span>
              <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">
                {avgSys || "--"}{" "}
                <span className="text-xs font-normal text-slate-400">mmHg</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Avg Diastolic
              </span>
              <span className="text-xl font-black text-blue-700 font-mono mt-0.5 block">
                {avgDia || "--"}{" "}
                <span className="text-xs font-normal text-slate-400">mmHg</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Target Range
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                &lt; 120 / 80
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Logs
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {bpData.length} records
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Average Glucose
              </span>
              <span className="text-xl font-black text-teal-700 font-mono mt-0.5 block">
                {avgSugar || "--"}{" "}
                <span className="text-xs font-normal text-slate-400">
                  mg/dL
                </span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Fasting Target
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                70 - 99 mg/dL
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Post-Meal Target
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                &lt; 140 mg/dL
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Logs
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {sugarData.length} records
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Area Chart */}
      {activeTab === "BP" && (
        <div>
          {bpData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Heart className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <span>No Blood Pressure logs found in this period.</span>
            </div>
          ) : (
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bpData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="sysGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f43f5e"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#f43f5e"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="diaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0284c7"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0284c7"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    domain={[50, 180]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    unit=" mmHg"
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                          <span className="font-bold text-slate-400 text-[10px] block">
                            {data.date}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-extrabold text-rose-400">
                              {data.systolic}/{data.diastolic}{" "}
                              <span className="text-[10px] text-slate-400">
                                mmHg
                              </span>
                            </span>
                            {data.pulse && (
                              <span className="text-slate-300">
                                Pulse: {data.pulse} bpm
                              </span>
                            )}
                          </div>
                          {data.notes && (
                            <p className="text-[11px] text-slate-400 italic mt-1">
                              &quot;{data.notes}&quot;
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={120}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{
                      value: "Normal Sys (120)",
                      fill: "#10b981",
                      fontSize: 10,
                      position: "insideTopLeft",
                    }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                    label={{
                      value: "Normal Dia (80)",
                      fill: "#3b82f6",
                      fontSize: 10,
                      position: "insideTopLeft",
                    }}
                  />
                  <ReferenceLine
                    y={140}
                    stroke="#f43f5e"
                    strokeDasharray="2 2"
                    label={{
                      value: "Stage 2 (140)",
                      fill: "#f43f5e",
                      fontSize: 10,
                      position: "insideTopLeft",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sysGradient)"
                    dot={{
                      r: 4,
                      fill: "#f43f5e",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#diaGradient)"
                    dot={{
                      r: 4,
                      fill: "#0284c7",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Sugar Chart */}
      {activeTab === "SUGAR" && (
        <div>
          {sugarData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Activity className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <span>No Blood Sugar logs found in this period.</span>
            </div>
          ) : (
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sugarData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="sugarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0d9488"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0d9488"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    domain={[50, 220]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    unit=" mg/dL"
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                          <span className="font-bold text-slate-400 text-[10px] block">
                            {data.date}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-extrabold text-teal-400">
                              {data.sugar}{" "}
                              <span className="text-[10px] text-slate-400">
                                mg/dL
                              </span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-900 text-teal-300">
                              {data.context}
                            </span>
                          </div>
                          {data.notes && (
                            <p className="text-[11px] text-slate-400 italic mt-1">
                              &quot;{data.notes}&quot;
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={99}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{
                      value: "Normal Fasting (99)",
                      fill: "#10b981",
                      fontSize: 10,
                      position: "insideTopLeft",
                    }}
                  />
                  <ReferenceLine
                    y={126}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{
                      value: "Diabetic Fasting (126)",
                      fill: "#f59e0b",
                      fontSize: 10,
                      position: "insideTopLeft",
                    }}
                  />
                  <ReferenceLine
                    y={140}
                    stroke="#f43f5e"
                    strokeDasharray="2 2"
                    label={{
                      value: "Post-Meal Cap (140)",
                      fill: "#f43f5e",
                      fontSize: 10,
                      position: "insideTopLeft",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="sugar"
                    name="Blood Sugar"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sugarGradient)"
                    dot={{
                      r: 4,
                      fill: "#0d9488",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
