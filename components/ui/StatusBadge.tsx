import React from "react";

export type StatusType =
  | "Presente"
  | "Ausente"
  | "Medio Día"
  | "Horas Extras"
  | "En Ejecución"
  | "Planificada"
  | "Pausada"
  | "Finalizada"
  | "Disponible en Pañol"
  | "En Obra / Asignada"
  | "En Mantenimiento"
  | "Pendiente"
  | "En Progreso"
  | "Reportada"
  | "Aprobada"
  | "Rechazada"
  | "Con Problema";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const getColors = (st: string) => {
    switch (st) {
      case "Presente":
      case "Aprobada":
      case "En Ejecución":
      case "Disponible en Pañol":
        return "bg-[#3BC97C]/15 text-[#3BC97C] border-[#3BC97C]/30";

      case "Medio Día":
      case "En Progreso":
      case "Planificada":
        return "bg-[#FFC93C]/15 text-[#FFC93C] border-[#FFC93C]/30";

      case "Ausente":
      case "Rechazada":
      case "Con Problema":
      case "Pausada":
      case "En Mantenimiento":
        return "bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/30";

      case "Reportada":
      case "Horas Extras":
      case "En Obra / Asignada":
        return "bg-[#45B2FF]/15 text-[#45B2FF] border-[#45B2FF]/30";

      case "Finalizada":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";

      default:
        return "bg-white/10 text-[#9AA2AE] border-white/15";
    }
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${getColors(
        status
      )} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      <span>{status}</span>
    </span>
  );
}
