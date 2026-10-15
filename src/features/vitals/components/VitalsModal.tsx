"use client";

import { useState } from "react";
import {
  Heart,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";
import { logDailyVital } from "../actions";
import type { VitalsModalProps } from "@/types";

export function VitalsModal({
  isOpen,
  onClose,
  members,
  defaultMemberId,
}: VitalsModalProps) {
  const [vitalType, setVitalType] = useState<"BLOOD_PRESSURE" | "BLOOD_SUGAR">(
    "BLOOD_PRESSURE",
  );
  const [selectedMember, setSelectedMember] = useState<string | number>(
    defaultMemberId || members[0]?.id || "",
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  // BP Fields
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  // Sugar Fields
  const [sugarValue, setSugarValue] = useState("");
  const [sugarContext, setSugarContext] = useState("FASTING");

  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Calculate Blood Pressure Category
  const sys = parseInt(systolic);
  const dia = parseInt(diastolic);
  let bpCategory = {
    label: "Enter values",
    color: "text-slate-500 bg-slate-100",
  };
  if (!isNaN(sys) && !isNaN(dia)) {
    if (sys < 120 && dia < 80) {
      bpCategory = {
        label: "Normal Blood Pressure",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    } else if (sys <= 129 && dia < 80) {
      bpCategory = {
        label: "Elevated BP",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    } else if (sys <= 139 || dia <= 89) {
      bpCategory = {
        label: "Stage 1 Hypertension",
        color: "text-orange-700 bg-orange-50 border-orange-200",
      };
    } else {
      bpCategory = {
        label: "Stage 2 Hypertension",
        color: "text-rose-700 bg-rose-50 border-rose-200",
      };
    }
  }

  // Calculate Sugar Category
  const sug = parseFloat(sugarValue);
  let sugarCategory = {
    label: "Enter value",
    color: "text-slate-500 bg-slate-100",
  };
  if (!isNaN(sug)) {
    if (sugarContext === "FASTING") {
      if (sug < 100)
        sugarCategory = {
          label: "Normal Fasting (< 100 mg/dL)",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      else if (sug <= 125)
        sugarCategory = {
          label: "Prediabetes (100 - 125 mg/dL)",
          color: "text-amber-700 bg-amber-50 border-amber-200",
        };
      else
        sugarCategory = {
          label: "Diabetic Level (>= 126 mg/dL)",
          color: "text-rose-700 bg-rose-50 border-rose-200",
        };
    } else {
      if (sug < 140)
        sugarCategory = {
          label: "Normal Post-Meal (< 140 mg/dL)",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      else if (sug <= 199)
        sugarCategory = {
          label: "Impaired Glucose (140 - 199 mg/dL)",
          color: "text-amber-700 bg-amber-50 border-amber-200",
        };
      else
        sugarCategory = {
          label: "Elevated (>= 200 mg/dL)",
          color: "text-rose-700 bg-rose-50 border-rose-200",
        };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMember) {
      alert("Please select a family member");
      return;
    }

    setIsSubmitting(true);
    try {
      const recordDate = new Date(`${date}T${time}:00`).toISOString();
      await logDailyVital({
        familyMemberId: selectedMember,
        recordDate,
        vitalType,
        systolic: systolic ? parseInt(systolic) : undefined,
        diastolic: diastolic ? parseInt(diastolic) : undefined,
        pulseRate: pulse ? parseInt(pulse) : undefined,
        sugarValue: sugarValue ? parseFloat(sugarValue) : undefined,
        sugarContext: vitalType === "BLOOD_SUGAR" ? sugarContext : undefined,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg("Vital recorded successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log vital";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${vitalType === "BLOOD_PRESSURE" ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-600"}`}
            >
              {vitalType === "BLOOD_PRESSURE" ? (
                <Heart className="w-5 h-5" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Manual Daily Vitals Log
              </h2>
              <p className="text-xs text-slate-500">
                Record home measurements directly into medical vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setVitalType("BLOOD_PRESSURE")}
              className={`py-2 px-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                vitalType === "BLOOD_PRESSURE"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Blood Pressure
            </button>
            <button
              type="button"
              onClick={() => setVitalType("BLOOD_SUGAR")}
              className={`py-2 px-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                vitalType === "BLOOD_SUGAR"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="w-4 h-4 text-teal-600" />
              Blood Sugar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Family Member
              </label>
              <div className="relative">
                <select
                  value={String(selectedMember)}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none cursor-pointer"
                >
                  {members.length === 0 && (
                    <option value="">No family members available</option>
                  )}
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.relation ? `(${m.relation})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Blood Pressure Fields */}
            {vitalType === "BLOOD_PRESSURE" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      required
                      min="60"
                      max="260"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="80"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      required
                      min="40"
                      max="160"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      placeholder="72"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      min="30"
                      max="220"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Instant Assessment Indicator */}
                {systolic && diastolic && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${bpCategory.color}`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bpCategory.label}</span>
                  </div>
                )}
              </div>
            )}

            {/* Blood Sugar Fields */}
            {vitalType === "BLOOD_SUGAR" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Glucose Value (mg/dL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="95.0"
                      value={sugarValue}
                      onChange={(e) => setSugarValue(e.target.value)}
                      required
                      min="20"
                      max="600"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Measurement Context
                    </label>
                    <div className="relative">
                      <select
                        value={sugarContext}
                        onChange={(e) => setSugarContext(e.target.value)}
                        className="w-full px-3 py-2.5 pr-9 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none cursor-pointer bg-white"
                      >
                        <option value="FASTING">
                          Fasting (Morning before meal)
                        </option>
                        <option value="POST_PRANDIAL">
                          Post-Prandial (2h after meal)
                        </option>
                        <option value="RANDOM">Random / Afternoon</option>
                        <option value="BEDTIME">Bedtime</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {sugarValue && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${sugarCategory.color}`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{sugarCategory.label}</span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Measured on empty stomach, felt dizzy, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Vital Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
