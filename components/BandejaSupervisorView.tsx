"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { Tarea, EstadoTarea } from "@/lib/data";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CloudRain,
  PlusCircle,
  XCircle,
  Filter,
  Check,
  HardHat,
  Eye,
  ShieldCheck,
  Building2,
  TrendingUp,
  MessageSquare
} from "lucide-react";

export default function BandejaSupervisorView() {
  const {
    obras,
    trabajadores,
    tareas,
    aprobarTarea,
    rechazarTarea,
    asignarTarea,
    activarDiaLluvia,
    usuarioAutenticado
  } = useObraStore();

  const supervisorNombre =
    usuarioAutenticado?.nombre || "Supervisor Marcos Vera";

  // Filtros de vista
  const [filtroEstado, setFiltroEstado] = useState<"pendientes" | "problemas" | "todas">("pendientes");
  const [obraFiltro, setObraFiltro] = useState<string>("todas");

  // Modal para rechazar tarea con nota explicativa
  const [tareaParaRechazar, setTareaParaRechazar] = useState<Tarea | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Modal para ver foto ampliada
  const [fotoModal, setFotoModal] = useState<string | null>(null);

  // Modal para "Día de Lluvia"
  const [mostrarModalLluvia, setMostrarModalLluvia] = useState(false);
  const [obraLluviaId, setObraLluviaId] = useState(obras[0]?.id || "");
  const [politicaPagoLluvia, setPoliticaPagoLluvia] = useState<"sin_pago" | "medio_dia" | "completo">("medio_dia");

  // Modal para crear nueva tarea
  const [mostrarModalNuevaTarea, setMostrarModalNuevaTarea] = useState(false);
  const [nuevaObraId, setNuevaObraId] = useState(obras[0]?.id || "");
  const [nuevoTrabajadorId, setNuevoTrabajadorId] = useState(trabajadores[0]?.id || "");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState<number>(5);
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split("T")[0]);

  // Mensaje de feedback
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  // Filtrar tareas según estado y obra
  const tareasFiltradas = tareas.filter((t) => {
    if (obraFiltro !== "todas" && t.obraId !== obraFiltro) return false;
    if (filtroEstado === "pendientes") return t.estado === "Reportada";
    if (filtroEstado === "problemas") return t.estado === "Con Problema";
    return true; // todas
  });

  const conteoReportadas = tareas.filter((t) => t.estado === "Reportada").length;
  const conteoProblemas = tareas.filter((t) => t.estado === "Con Problema").length;
  const conteoAprobadas = tareas.filter((t) => t.estado === "Aprobada").length;

  const handleAprobar = (tarea: Tarea) => {
    aprobarTarea(tarea.id, supervisorNombre);
    setMensajeToast(`✅ Tarea aprobada. Se sumó +${tarea.porcentajeAvanceAsociado}% a la obra y se asentó en la Bitácora.`);
    setTimeout(() => setMensajeToast(null), 5000);
  };

  const handleConfirmarRechazo = () => {
    if (!tareaParaRechazar) return;
    if (!motivoRechazo.trim()) {
      alert("Debes ingresar un motivo de rechazo para que el operario sepa qué corregir.");
      return;
    }

    rechazarTarea(tareaParaRechazar.id, motivoRechazo.trim());
    setTareaParaRechazar(null);
    setMotivoRechazo("");
    setMensajeToast("❌ Tarea rechazada. Se notificó la corrección solicitada.");
    setTimeout(() => setMensajeToast(null), 5000);
  };

  const handleConfirmarLluvia = () => {
    if (!obraLluviaId) return;
    activarDiaLluvia(obraLluviaId, politicaPagoLluvia);
    setMostrarModalLluvia(false);
    const obraNom = obras.find((o) => o.id === obraLluviaId)?.nombre || "la obra";
    setMensajeToast(`🌧️ Protocolo de lluvia activado para ${obraNom}. Asistencias y Bitácora actualizadas.`);
    setTimeout(() => setMensajeToast(null), 5000);
  };

  const handleCrearTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDescripcion.trim()) {
      alert("Por favor ingresa la descripción de la tarea.");
      return;
    }

    asignarTarea({
      obraId: nuevaObraId,
      trabajadorId: nuevoTrabajadorId,
      descripcion: nuevaDescripcion.trim(),
      fecha: nuevaFecha,
      estado: "Pendiente",
      porcentajeAvanceAsociado: Number(nuevoPorcentaje) || 0,
    });

    setMostrarModalNuevaTarea(false);
    setNuevaDescripcion("");
    setMensajeToast("📋 Tarea asignada exitosamente al trabajador.");
    setTimeout(() => setMensajeToast(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Feedback */}
      {mensajeToast && (
        <div className="p-4 rounded-2xl bg-[#3BC97C]/15 border border-[#3BC97C]/40 text-[#3BC97C] flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 font-semibold text-sm">
            <Check className="h-5 w-5 shrink-0" />
            <span>{mensajeToast}</span>
          </div>
          <button
            onClick={() => setMensajeToast(null)}
            className="text-xs bg-[#3BC97C]/20 hover:bg-[#3BC97C]/30 px-3 py-1 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Header Principal de Supervisión */}
      <div className="bg-[#181c24] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#FF6A1F]/20 text-[#FF6A1F] border border-[#FF6A1F]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Portal de Supervisión de Obra
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-heading">
            Bandeja de Aprobaciones & Control de Cuadrilla
          </h1>
          <p className="text-xs text-[#9AA2AE] max-w-2xl">
            Valida los reportes con fotografía del personal en sitio. Solo las tareas aprobadas aquí sumarán porcentaje al avance oficial de la obra y se asentarán en la bitácora.
          </p>
        </div>

        {/* Acciones Rápidas del Supervisor */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setMostrarModalLluvia(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#45B2FF]/15 hover:bg-[#45B2FF]/25 text-[#45B2FF] border border-[#45B2FF]/30 font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-950/20"
          >
            <CloudRain className="h-4 w-4" />
            <span>Día de Lluvia (1-Click)</span>
          </button>

          <button
            onClick={() => setMostrarModalNuevaTarea(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] text-[#181205] font-black text-xs cursor-pointer transition-all active:scale-95 shadow-lg shadow-orange-600/30"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Asignar Tarea</span>
          </button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFiltroEstado("pendientes")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg ${
            filtroEstado === "pendientes"
              ? "bg-[#45B2FF]/10 border-[#45B2FF]/50 ring-2 ring-[#45B2FF]/30"
              : "bg-[#181c24] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA2AE] uppercase font-bold tracking-wider">Esperando Aprobación</span>
            <Clock className="h-5 w-5 text-[#45B2FF]" />
          </div>
          <p className="text-3xl font-black text-white font-mono mt-2">{conteoReportadas}</p>
          <span className="text-xs text-[#45B2FF] font-semibold">Requieren revisión fotográfica</span>
        </div>

        <div
          onClick={() => setFiltroEstado("problemas")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg ${
            filtroEstado === "problemas"
              ? "bg-red-500/10 border-red-500/50 ring-2 ring-red-500/30"
              : "bg-[#181c24] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA2AE] uppercase font-bold tracking-wider">Trabas Reportadas</span>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-400 font-mono mt-2">{conteoProblemas}</p>
          <span className="text-xs text-red-400/90 font-semibold">Faenas detenidas por resolver</span>
        </div>

        <div
          onClick={() => setFiltroEstado("todas")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg ${
            filtroEstado === "todas"
              ? "bg-[#3BC97C]/10 border-[#3BC97C]/50 ring-2 ring-[#3BC97C]/30"
              : "bg-[#181c24] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA2AE] uppercase font-bold tracking-wider">Tareas Validadas</span>
            <CheckCircle2 className="h-5 w-5 text-[#3BC97C]" />
          </div>
          <p className="text-3xl font-black text-[#3BC97C] font-mono mt-2">{conteoAprobadas}</p>
          <span className="text-xs text-[#9AA2AE]">Sumadas al avance de obra</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#181c24] p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFiltroEstado("pendientes")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filtroEstado === "pendientes"
                ? "bg-[#45B2FF] text-[#181205]"
                : "text-[#9AA2AE] hover:text-white"
            }`}
          >
            Pendientes ({conteoReportadas})
          </button>
          <button
            onClick={() => setFiltroEstado("problemas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filtroEstado === "problemas"
                ? "bg-red-500 text-white"
                : "text-[#9AA2AE] hover:text-white"
            }`}
          >
            Trabas / Problemas ({conteoProblemas})
          </button>
          <button
            onClick={() => setFiltroEstado("todas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filtroEstado === "todas"
                ? "bg-white/20 text-white"
                : "text-[#9AA2AE] hover:text-white"
            }`}
          >
            Ver Todas ({tareas.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#9AA2AE]" />
          <select
            value={obraFiltro}
            onChange={(e) => setObraFiltro(e.target.value)}
            className="bg-[#12151b] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A1F] cursor-pointer"
          >
            <option value="todas">Todas las Obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.codigo} - {o.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Tareas para Revisión */}
      {tareasFiltradas.length === 0 ? (
        <div className="bg-[#181c24] border border-white/10 rounded-3xl p-12 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-[#3BC97C] mx-auto opacity-60" />
          <h3 className="text-base font-bold text-white">¡No hay tareas pendientes en este filtro!</h3>
          <p className="text-xs text-[#9AA2AE] max-w-sm mx-auto">
            Todas las tareas de la cuadrilla se encuentran revisadas y al día.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tareasFiltradas.map((tarea) => {
            const trabajador = trabajadores.find((t) => t.id === tarea.trabajadorId);
            const obra = obras.find((o) => o.id === tarea.obraId);
            const esReportada = tarea.estado === "Reportada";
            const esProblema = tarea.estado === "Con Problema";
            const esAprobada = tarea.estado === "Aprobada";

            return (
              <div
                key={tarea.id}
                className={`bg-[#181c24] border rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition-all ${
                  esProblema
                    ? "border-red-500/40 bg-red-950/10"
                    : esReportada
                    ? "border-[#45B2FF]/40"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-3">
                  {/* Fila Superior: Obra y Trabajador */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-sm">
                        <HardHat className="h-5 w-5 text-[#FF6A1F]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {trabajador ? trabajador.nombre : "Operario"}
                        </h4>
                        <span className="text-[11px] text-[#9AA2AE]">
                          {trabajador?.categoria}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-[#9AA2AE] border border-white/10">
                        {obra ? obra.codigo : "OBRA"}
                      </span>
                      <p className="text-[10px] text-[#9AA2AE] font-mono mt-1">{tarea.fecha}</p>
                    </div>
                  </div>

                  {/* Descripción de la Tarea y Avance */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#FFC93C] flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> +{tarea.porcentajeAvanceAsociado}% Avance
                      </span>
                      {tarea.eppVerificado && (
                        <span className="text-[10px] bg-[#3BC97C]/15 text-[#3BC97C] border border-[#3BC97C]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> EPP Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#F4F1EA]">{tarea.descripcion}</p>
                  </div>

                  {/* Foto de Evidencia Subida */}
                  {tarea.fotos && tarea.fotos.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#9AA2AE] font-semibold">Evidencia fotográfica en obra:</span>
                      <div className="flex gap-2">
                        {tarea.fotos.map((foto, idx) => (
                          <div
                            key={idx}
                            onClick={() => setFotoModal(foto)}
                            className="relative w-24 h-20 rounded-2xl overflow-hidden border border-white/20 cursor-pointer group"
                          >
                            <img src={foto} alt="Evidencia" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comentario del Trabajador */}
                  {tarea.comentarioTrabajador && (
                    <div className="p-3 bg-black/30 rounded-2xl border border-white/5 text-xs text-[#F4F1EA] space-y-1">
                      <span className="text-[10px] text-[#9AA2AE] font-semibold uppercase tracking-wider block">
                        Nota del trabajador:
                      </span>
                      <p className="italic">{tarea.comentarioTrabajador}</p>
                    </div>
                  )}

                  {/* Herramienta Usada */}
                  {tarea.herramientaUsada && (
                    <span className="inline-block text-[11px] text-[#9AA2AE] bg-white/5 px-2.5 py-1 rounded-xl">
                      🛠️ {tarea.herramientaUsada}
                    </span>
                  )}
                </div>

                {/* Acciones de Supervisión */}
                <div className="pt-3 border-t border-white/10">
                  {esReportada && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAprobar(tarea)}
                        className="flex-1 py-2.5 px-3 bg-[#3BC97C] hover:bg-[#34b36e] text-[#181205] font-black text-xs rounded-xl shadow-lg shadow-green-950/40 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aprobar (+{tarea.porcentajeAvanceAsociado}%)</span>
                      </button>

                      <button
                        onClick={() => {
                          setTareaParaRechazar(tarea);
                          setMotivoRechazo("");
                        }}
                        className="py-2.5 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}

                  {esProblema && (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-red-950/30 border border-red-500/40 rounded-xl text-xs text-red-300 font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                        <span>Requiere intervención / suministro de material</span>
                      </div>
                      <button
                        onClick={() => handleAprobar(tarea)}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Marcar como Resuelto y Aprobar
                      </button>
                    </div>
                  )}

                  {esAprobada && (
                    <div className="p-2.5 bg-[#3BC97C]/10 border border-[#3BC97C]/20 rounded-xl text-xs text-[#3BC97C] flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Check className="h-4 w-4" /> Aprobada por {tarea.aprobadoPor}
                      </span>
                      <span className="font-mono text-[11px]">{tarea.fechaAprobacion}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: PROTOCOLO DÍA DE LLUVIA (1-CLICK) */}
      {mostrarModalLluvia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181c24] border border-[#45B2FF]/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-[#45B2FF]">
                <CloudRain className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    Protocolo de Jornada por Lluvia
                  </h3>
                  <span className="text-xs text-[#9AA2AE]">
                    Suspensión de faena en lote con política laboral
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalLluvia(false)}
                className="text-[#9AA2AE] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Seleccionar Obra */}
              <div className="space-y-1.5">
                <label className="font-semibold text-white">Selecciona la Obra Afectada:</label>
                <select
                  value={obraLluviaId}
                  onChange={(e) => setObraLluviaId(e.target.value)}
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#45B2FF]"
                >
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} - {o.nombre} ({o.ubicacion})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleccionar Política de Pago */}
              <div className="space-y-2">
                <label className="font-semibold text-white">Política de Pago Aplicable:</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    politicaPagoLluvia === "medio_dia"
                      ? "bg-[#45B2FF]/15 border-[#45B2FF] text-white"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}>
                    <input
                      type="radio"
                      name="politica"
                      value="medio_dia"
                      checked={politicaPagoLluvia === "medio_dia"}
                      onChange={() => setPoliticaPagoLluvia("medio_dia")}
                      className="accent-[#45B2FF]"
                    />
                    <div>
                      <strong className="block text-white text-xs">Medio Jornal (50% de la diaria)</strong>
                      <span className="text-[11px] opacity-80">Recomendado si la cuadrilla se presentó pero la faena paró por tormenta.</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    politicaPagoLluvia === "completo"
                      ? "bg-[#3BC97C]/15 border-[#3BC97C] text-white"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}>
                    <input
                      type="radio"
                      name="politica"
                      value="completo"
                      checked={politicaPagoLluvia === "completo"}
                      onChange={() => setPoliticaPagoLluvia("completo")}
                      className="accent-[#3BC97C]"
                    />
                    <div>
                      <strong className="block text-white text-xs">Jornal Completo (100% cubierto)</strong>
                      <span className="text-[11px] opacity-80">Asumido íntegramente por la empresa contratista.</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    politicaPagoLluvia === "sin_pago"
                      ? "bg-red-500/15 border-red-500 text-white"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}>
                    <input
                      type="radio"
                      name="politica"
                      value="sin_pago"
                      checked={politicaPagoLluvia === "sin_pago"}
                      onChange={() => setPoliticaPagoLluvia("sin_pago")}
                      className="accent-red-500"
                    />
                    <div>
                      <strong className="block text-white text-xs">Sin Pago (Suspensión sin goce)</strong>
                      <span className="text-[11px] opacity-80">Jornada no computable por aviso previo de temporal.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[#9AA2AE]">
                ℹ️ Al confirmar, se actualizará el registro diario de todos los trabajadores asignados a esta obra y se generará una entrada automática de clima &ldquo;Lluvia&rdquo; en la Bitácora Oficial.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModalLluvia(false)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarLluvia}
                className="flex-1 py-3 rounded-xl bg-[#45B2FF] hover:bg-[#3ba0e6] text-[#181205] font-black text-xs cursor-pointer shadow-lg shadow-blue-950/40"
              >
                Confirmar Suspensión por Lluvia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECHAZAR TAREA CON NOTA */}
      {tareaParaRechazar && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181c24] border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Rechazar Reporte de Tarea</h3>
              </div>
              <button
                onClick={() => setTareaParaRechazar(null)}
                className="text-[#9AA2AE] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#9AA2AE]">
              Indica qué corrección debe realizar el operario:
            </p>

            <textarea
              rows={3}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Falta conectar la puesta a tierra en el gabinete inferior. Por favor revisar antes de cerrar."
              className="w-full bg-[#12151b] border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-400"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTareaParaRechazar(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarRechazo}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer shadow-lg shadow-red-950/40"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA TAREA */}
      {mostrarModalNuevaTarea && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCrearTarea}
            className="bg-[#181c24] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-[#FF6A1F]">
                <PlusCircle className="h-5 w-5" />
                <h3 className="text-base font-bold text-white font-heading">
                  Asignar Nueva Tarea a Cuadrilla
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalNuevaTarea(false)}
                className="text-[#9AA2AE] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-white block mb-1">Obra de Destino:</label>
                <select
                  value={nuevaObraId}
                  onChange={(e) => setNuevaObraId(e.target.value)}
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1F]"
                >
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} - {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Trabajador Responsable:</label>
                <select
                  value={nuevoTrabajadorId}
                  onChange={(e) => setNuevoTrabajadorId(e.target.value)}
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1F]"
                >
                  {trabajadores.filter((t) => t.activo).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Descripción de la Tarea:</label>
                <textarea
                  rows={2}
                  required
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="Ej: Montaje de bandejas portacables en pasillo central y fijación de soportes."
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">
                    % Avance que sumará al aprobarse:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={nuevoPorcentaje}
                    onChange={(e) => setNuevoPorcentaje(Number(e.target.value))}
                    className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1F]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Fecha Programada:</label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6A1F]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModalNuevaTarea(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] text-[#181205] font-black text-xs cursor-pointer shadow-lg shadow-orange-600/30"
              >
                Asignar a Cuadrilla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: VER FOTO AMPLIADA */}
      {fotoModal && (
        <div
          onClick={() => setFotoModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center relative">
            <img
              src={fotoModal}
              alt="Evidencia en resolución completa"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <p className="text-xs text-[#9AA2AE] mt-3">Click en cualquier lugar para cerrar</p>
          </div>
        </div>
      )}
    </div>
  );
}
