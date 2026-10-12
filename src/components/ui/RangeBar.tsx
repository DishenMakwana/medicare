import React from "react";
import type { RangeBarProps } from "@/types";

export function RangeBar({
  value,
  min,
  max,
  unit = "",
  status = "NORMAL",
  className = "",
}: RangeBarProps) {
  if (value === undefined || value === null) {
    return <span className="text-xs text-slate-400">N/A</span>;
  }

  // If we don't have min/max bounds, render a compact badge
  if (
    min === undefined ||
    min === null ||
    max === undefined ||
    max === null ||
    min >= max
  ) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold text-slate-800">
          {value} {unit}
        </span>
      </div>
    );
  }

  // Calculate visual scale
  // We expand the scale slightly below min and above max so the normal range is centered
  const rangeSpan = max - min;
  const buffer = Math.max(rangeSpan * 0.35, 1);
  const scaleStart = Math.max(0, min - buffer);
  const scaleEnd = max + buffer;
  const totalScale = scaleEnd - scaleStart;

  // Calculate percentages for normal zone
  const normalLeftPercent = Math.max(
    0,
    Math.min(100, ((min - scaleStart) / totalScale) * 100),
  );
  const normalWidthPercent = Math.max(
    10,
    Math.min(100 - normalLeftPercent, (rangeSpan / totalScale) * 100),
  );

  // Calculate pin position
  const clampedVal = Math.max(scaleStart, Math.min(scaleEnd, value));
  const pinPercent = Math.max(
    4,
    Math.min(96, ((clampedVal - scaleStart) / totalScale) * 100),
  );

  const isHigh = status === "HIGH" || value > max;
  const isLow = status === "LOW" || value < min;

  const pinColor = isHigh
    ? "bg-rose-500 border-rose-600 ring-rose-200"
    : isLow
      ? "bg-blue-500 border-blue-600 ring-blue-200"
      : "bg-emerald-500 border-emerald-600 ring-emerald-200";

  return (
    <div className={`w-full max-w-[240px] space-y-1.5 ${className}`}>
      {/* Current Value Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-mono text-sm font-black ${
              isHigh
                ? "text-rose-700"
                : isLow
                  ? "text-blue-700"
                  : "text-slate-900"
            }`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-[11px] text-slate-400 font-medium">
              {unit}
            </span>
          )}
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isHigh
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : isLow
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {isHigh ? "High" : isLow ? "Low" : "Normal"}
        </span>
      </div>

      {/* Visual Slider Bar Track */}
      <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        {/* Normal Green Safe Zone */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-400/80 rounded-full transition-all"
          style={{
            left: `${normalLeftPercent}%`,
            width: `${normalWidthPercent}%`,
          }}
        />

        {/* Low warning zone (left of normal) */}
        {normalLeftPercent > 0 && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-blue-200/50"
            style={{ width: `${normalLeftPercent}%` }}
          />
        )}

        {/* High warning zone (right of normal) */}
        <div
          className="absolute top-0 bottom-0 right-0 bg-rose-200/60"
          style={{
            width: `${Math.max(0, 100 - (normalLeftPercent + normalWidthPercent))}%`,
          }}
        />
      </div>

      {/* Pin / Indicator Marker */}
      <div className="relative w-full h-3">
        <div
          className={`absolute top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 shadow-sm ring-2 ${pinColor}`}
          style={{ left: `${pinPercent}%` }}
          title={`Value: ${value} ${unit} (Normal Range: ${min} - ${max})`}
        />
      </div>

      {/* Reference Bounds Range Legend */}
      <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
        <span>Min: {min}</span>
        <span className="text-slate-500 font-semibold">
          Ref: {min} - {max}
        </span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
}
