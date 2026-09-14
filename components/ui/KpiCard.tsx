import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: "up" | "down" | "neutral";
  color?: "orange" | "green" | "blue" | "yellow";
  className?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  trend,
  color = "orange",
  className = "",
}: KpiCardProps) {
  const colorMap = {
    orange: "text-[#FF6A1F] bg-[#FF6A1F]/10 border-[#FF6A1F]/20",
    green: "text-[#3BC97C] bg-[#3BC97C]/10 border-[#3BC97C]/20",
    blue: "text-[#45B2FF] bg-[#45B2FF]/10 border-[#45B2FF]/20",
    yellow: "text-[#FFC93C] bg-[#FFC93C]/10 border-[#FFC93C]/20",
  };

  return (
    <div
      className={`bg-[#181c24] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-bold text-[#9AA2AE] uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {value}
          </span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#9AA2AE]">
              {badge}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-[#9AA2AE] mt-1 flex items-center gap-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
