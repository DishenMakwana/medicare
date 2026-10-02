import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    color: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = "text-teal-600",
  iconBg = "bg-teal-50",
  badge,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`bento-card p-6 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-sm`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
          {badge && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>
        )}
      </div>
    </div>
  );
}
