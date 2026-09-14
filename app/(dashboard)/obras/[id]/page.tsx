"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useObraStore } from "@/lib/store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  User,
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  CheckCircle2,
  HardHat,
  Cpu
} from "lucide-react";
import Link from "next/link";

export default function ObraDetallePage() {
  const params = useParams();
  const router = useRouter();
  const obraId = params?.id as string;

  const { obras, trabajadores, bitacoras, tareas, tableros, rolActual } = useObraStore();
  const obra = obras.find((o) => o.id === obraId);

  if (!obra) {
    return (
      <div className="bg-[#181c24] border border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
        <Building2 className="h-12 w-12 text-[#9AA2AE] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-white">Obra no encontrada</h2>
        <p className="text-xs text-[#9AA2AE]">
          El identificador de obra no existe o fue removido del sistema.
        </p>
        <button
          onClick={() => router.push("/obras")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A1F] text-[#181205] rounded-xl text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Obras
        </button>
      </div>
    );
  }

  const cuadrilla = trabajadores.filter((t) => t.obraActualId === obra.id && t.activo);
  const bitacorasObra = bitacoras.filter((b) => b.obraId === obra.id);
  const tareasObra = tareas.filter((t) => t.obraId === obra.id);
  const tablerosObra = tableros.filter((t) => t.obraId === obra.id);

  const formatoPYG = (monto: number) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(monto);

  return (
    <div className="space-y-6 pb-12">
      {/* Botón Volver */}
      <Link
        href="/obras"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#9AA2AE] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 text-[#FF6A1F]" />
        <span>Volver al Catálogo de Obras</span>
      </Link>

      {/* Header Principal de la Obra */}
      <div className="bg-[#181c24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/15">
                {obra.codigo}
              </span>
              <StatusBadge status={obra.estado} />
              <span className="text-xs font-semibold text-[#FFC93C] bg-[#FFC93C]/10 border border-[#FFC93C]/20 px-2.5 py-0.5 rounded-md">
                {obra.tipo === "electrico" ? "⚡ Proyecto Eléctrico" : "🏗️ Obra Civil"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              {obra.nombre}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#9AA2AE] pt-1">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <Building2 className="h-3.5 w-3.5 text-[#FF6A1F]" /> {obra.cliente}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#3BC97C]" /> {obra.ubicacion || "Paraguay"}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#45B2FF]" /> Resp: {obra.responsable}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-[#FFC93C]" /> {obra.fechaInicio} al {obra.fechaFinEstimada}
              </span>
            </div>
          </div>

          {/* Medidor de Avance */}
          <div className="bg-[#12151b] border border-white/10 rounded-2xl p-5 min-w-[240px] text-center space-y-2">
            <span className="text-[11px] uppercase font-bold text-[#9AA2AE] tracking-wider block">
              Avance Físico Oficial
            </span>
            <div className="text-4xl font-black text-white font-mono">
              {obra.progreso}%
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6A1F] to-[#FFC93C] rounded-full transition-all duration-500"
                style={{ width: `${obra.progreso}%` }}
              />
            </div>
          </div>
        </div>

        {/* Datos Financieros (Solo Admin) */}
        {rolActual === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
              <span className="text-[11px] uppercase font-bold text-[#9AA2AE] tracking-wider block">
                Presupuesto Total Contratado
              </span>
              <p className="text-xl font-mono font-black text-[#3BC97C] mt-1">
                {formatoPYG(obra.presupuestoPYG)}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
              <span className="text-[11px] uppercase font-bold text-[#9AA2AE] tracking-wider block">
                Costo Ejecutado en Obra
              </span>
              <p className="text-xl font-mono font-black text-white mt-1">
                {formatoPYG(obra.costoEjecutadoPYG)}
              </p>
              <span className="text-[10px] text-[#9AA2AE]">
                Margen proyectado: {Math.round(((obra.presupuestoPYG - obra.costoEjecutadoPYG) / (obra.presupuestoPYG || 1)) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Columnas de Contenido: Cuadrilla, Tareas y Bitácora */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cuadrilla Asignada */}
        <div className="bg-[#181c24] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardHat className="h-4 w-4 text-[#FF6A1F]" />
              <span>Cuadrilla Asignada ({cuadrilla.length})</span>
            </h3>
            <Link
              href="/cuadrilla"
              className="text-xs text-[#FF6A1F] hover:underline font-semibold"
            >
              Gestionar
            </Link>
          </div>

          {cuadrilla.length === 0 ? (
            <p className="text-xs text-[#9AA2AE] py-4 text-center">
              No hay operarios asignados directamente a esta obra.
            </p>
          ) : (
            <div className="space-y-2.5">
              {cuadrilla.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{t.nombre}</p>
                    <span className="text-[11px] text-[#9AA2AE]">{t.categoria}</span>
                  </div>
                  <span className="font-mono text-[#3BC97C] font-bold">
                    {t.telefono}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tareas en Obra */}
        <div className="bg-[#181c24] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3BC97C]" />
              <span>Tareas Recientes ({tareasObra.length})</span>
            </h3>
            <Link
              href="/bandeja"
              className="text-xs text-[#45B2FF] hover:underline font-semibold"
            >
              Bandeja
            </Link>
          </div>

          {tareasObra.length === 0 ? (
            <p className="text-xs text-[#9AA2AE] py-4 text-center">
              Aún no hay tareas registradas para esta obra.
            </p>
          ) : (
            <div className="space-y-2.5">
              {tareasObra.slice(0, 5).map((tar) => (
                <div
                  key={tar.id}
                  className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={tar.estado} size="sm" />
                    <span className="text-[10px] text-[#FFC93C] font-mono">
                      +{tar.porcentajeAvanceAsociado}%
                    </span>
                  </div>
                  <p className="font-medium text-white">{tar.descripcion}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bitácora de Faena */}
        <div className="bg-[#181c24] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#FFC93C]" />
              <span>Libro de Faena ({bitacorasObra.length})</span>
            </h3>
            <Link
              href="/bitacora"
              className="text-xs text-[#FFC93C] hover:underline font-semibold"
            >
              Ver Todas
            </Link>
          </div>

          {bitacorasObra.length === 0 ? (
            <p className="text-xs text-[#9AA2AE] py-4 text-center">
              No se han registrado entradas de bitácora todavía.
            </p>
          ) : (
            <div className="space-y-2.5">
              {bitacorasObra.slice(0, 4).map((bit) => (
                <div
                  key={bit.id}
                  className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#9AA2AE]">
                    <span className="font-mono font-bold text-white">{bit.fecha}</span>
                    <span className="text-[#FFC93C] font-medium">{bit.clima}</span>
                  </div>
                  <p className="text-[#F4F1EA] line-clamp-2">{bit.avanceDescripcion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
