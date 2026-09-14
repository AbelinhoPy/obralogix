"use client";

import React, { useState, useRef } from "react";
import { useObraStore } from "@/lib/store";
import { Tarea, Trabajador } from "@/lib/data";
import { compressImageFile, saveOfflineReport } from "@/lib/storage-appwrite";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  ShieldAlert,
  HardHat,
  Wrench,
  CheckSquare,
  Sparkles,
  Calendar,
  XCircle,
  FileCheck2,
  DollarSign,
  ChevronRight,
  UploadCloud,
  Check
} from "lucide-react";

export default function PortalTrabajadorView() {
  const {
    trabajadores,
    obras,
    tareas,
    herramientas,
    diarias,
    reportarTarea,
    reportarProblemaTarea
  } = useObraStore();

  // Filtrar operarios o trabajadores activos
  const operarios = trabajadores.filter((t) => t.activo);
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<string>(
    operarios.find((t) => t.rol === "operario")?.id || operarios[0]?.id || ""
  );

  const trabajadorActual = operarios.find((t) => t.id === trabajadorSeleccionadoId) || operarios[0];
  const obraActual = obras.find((o) => o.id === trabajadorActual?.obraActualId);

  // Subpestaña interna: "tareas" o "historial"
  const [subTab, setSubTab] = useState<"tareas" | "historial">("tareas");

  // Modal para reportar tarea completada
  const [tareaParaReportar, setTareaParaReportar] = useState<Tarea | null>(null);
  const [eppCasco, setEppCasco] = useState(true);
  const [eppBotas, setEppBotas] = useState(true);
  const [eppGuantes, setEppGuantes] = useState(true);
  const [eppAntiparras, setEppAntiparras] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState("");
  const [comentario, setComentario] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [fotoTamanoKB, setFotoTamanoKB] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal para reportar problema/traba
  const [tareaParaProblema, setTareaParaProblema] = useState<Tarea | null>(null);
  const [descripcionProblema, setDescripcionProblema] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tareas asignadas a este trabajador
  const misTareas = tareas.filter((t) => t.trabajadorId === trabajadorActual?.id);

  // Historial de asistencias de este trabajador
  const misDiarias = diarias.filter((d) => d.trabajadorId === trabajadorActual?.id);

  // Cálculos de jornales e historial
  const totalDiasPresente = misDiarias.filter((d) => d.estadoAsistencia === "Presente" || d.estadoAsistencia === "Horas Extras").length;
  const totalMedioDia = misDiarias.filter((d) => d.estadoAsistencia === "Medio Día").length;
  const totalHorasExtra = misDiarias.reduce((acc, curr) => acc + (curr.horasExtra || 0), 0);
  const totalValesPYG = misDiarias.reduce((acc, curr) => acc + (curr.valePYG || 0), 0);
  
  const diariaPYG = trabajadorActual?.diariaPYG || 150000;
  const valorHoraExtra = Math.round((diariaPYG / 8) * 1.5);
  const totalEstimadoCobro = Math.max(
    0,
    (totalDiasPresente * diariaPYG) +
    (totalMedioDia * Math.round(diariaPYG / 2)) +
    (totalHorasExtra * valorHoraExtra) -
    totalValesPYG
  );

  // Manejo de carga y compresión de fotos
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImageFile(file, 1280, 0.75);
      setFotoBase64(compressed);
      // Calcular tamaño aproximado en KB
      const sizeInKB = Math.round((compressed.length * 3) / 4 / 1024);
      setFotoTamanoKB(sizeInKB);
    } catch (err) {
      console.error("Error al comprimir foto:", err);
      alert("No se pudo procesar la fotografía. Intenta con otra imagen.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAbrirReporte = (tarea: Tarea) => {
    setTareaParaReportar(tarea);
    setFotoBase64(null);
    setFotoTamanoKB(0);
    setComentario("");
    setHerramientaSeleccionada(tarea.herramientaUsada || "");
    setEppCasco(true);
    setEppBotas(true);
    setEppGuantes(true);
    setEppAntiparras(false);
  };

  const handleEnviarReporte = async () => {
    if (!tareaParaReportar) return;

    if (!fotoBase64) {
      alert("⚠️ La foto de evidencia es obligatoria para enviar la tarea a supervisión.");
      return;
    }

    const eppVerificado = eppCasco && eppBotas && eppGuantes;
    if (!eppVerificado) {
      const confirma = confirm("No has marcado todos los EPP obligatorios (Casco, Botas y Guantes). ¿Deseas enviar el reporte de todos modos?");
      if (!confirma) return;
    }

    setIsSubmitting(true);
    try {
      if (!navigator.onLine) {
        saveOfflineReport({
          id: `off-${Date.now()}`,
          tareaId: tareaParaReportar.id,
          fecha: new Date().toISOString().split("T")[0],
          fotos: [fotoBase64],
          comentario,
          herramientaUsada: herramientaSeleccionada,
          eppVerificado,
        });
        setMensajeExito("📦 Reporte guardado sin conexión. Se sincronizará al volver la señal de red.");
      } else {
        reportarTarea(
          tareaParaReportar.id,
          [fotoBase64],
          comentario,
          herramientaSeleccionada,
          eppVerificado
        );
        setMensajeExito("✅ ¡Tarea enviada al supervisor! Está en cola de aprobación.");
      }

      setTareaParaReportar(null);
      setTimeout(() => setMensajeExito(null), 5000);
    } catch (err) {
      console.error("Error enviando reporte:", err);
      alert("Error al enviar el reporte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnviarProblema = () => {
    if (!tareaParaProblema) return;
    if (!descripcionProblema.trim()) {
      alert("Por favor describe brevemente el motivo de la traba o problema.");
      return;
    }

    reportarProblemaTarea(tareaParaProblema.id, descripcionProblema.trim());
    setTareaParaProblema(null);
    setDescripcionProblema("");
    setMensajeExito("⚠️ Traba reportada. El supervisor fue notificado de inmediato.");
    setTimeout(() => setMensajeExito(null), 5000);
  };

  const getBadgeEstado = (estado: Tarea["estado"]) => {
    switch (estado) {
      case "Aprobada":
        return {
          bg: "bg-[#3BC97C]/15 text-[#3BC97C] border-[#3BC97C]/30",
          icon: CheckCircle2,
          text: "Aprobada (+Avance)"
        };
      case "Reportada":
        return {
          bg: "bg-[#45B2FF]/15 text-[#45B2FF] border-[#45B2FF]/30",
          icon: Clock,
          text: "Esperando Aprobación"
        };
      case "Con Problema":
        return {
          bg: "bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/30",
          icon: AlertTriangle,
          text: "Con Problema / Traba"
        };
      case "Rechazada":
        return {
          bg: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: XCircle,
          text: "Rechazada por Supervisor"
        };
      case "En Progreso":
        return {
          bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: Wrench,
          text: "En Progreso"
        };
      default:
        return {
          bg: "bg-white/10 text-[#9AA2AE] border-white/15",
          icon: Clock,
          text: "Pendiente"
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Alerta de Éxito / Feedback */}
      {mensajeExito && (
        <div className="p-4 rounded-2xl bg-[#3BC97C]/15 border border-[#3BC97C]/40 text-[#3BC97C] flex items-center justify-between shadow-lg shadow-green-950/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 font-semibold text-sm">
            <Check className="h-5 w-5 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button
            onClick={() => setMensajeExito(null)}
            className="text-xs bg-[#3BC97C]/20 hover:bg-[#3BC97C]/30 px-3 py-1 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Tarjeta Superior: Perfil del Operario en Obra */}
      <div className="bg-[#181c24] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF6A1F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6A1F] to-[#FFC93C] flex items-center justify-center text-[#181205] shadow-lg shadow-orange-600/30 font-black text-xl shrink-0">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-[#F4F1EA] font-heading tracking-wide">
                  {trabajadorActual ? trabajadorActual.nombre : "Portal del Trabajador"}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF6A1F]/20 text-[#FF6A1F] border border-[#FF6A1F]/30 font-bold uppercase tracking-wider">
                  {trabajadorActual?.categoria || "Operario"}
                </span>
              </div>
              <p className="text-xs text-[#9AA2AE] mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#3BC97C] animate-pulse" />
                Obra Asignada: <strong className="text-white font-medium">{obraActual ? `${obraActual.codigo} - ${obraActual.nombre}` : "Sin obra fija"}</strong>
              </p>
            </div>
          </div>

          {/* Selector rápido de trabajador (para pruebas o dispositivos compartidos) */}
          <div className="flex flex-col sm:items-end gap-1">
            <label className="text-[11px] text-[#9AA2AE] font-medium">Cambiar Trabajador en Turno:</label>
            <select
              value={trabajadorSeleccionadoId}
              onChange={(e) => setTrabajadorSeleccionadoId(e.target.value)}
              className="bg-[#12151b] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6A1F] cursor-pointer"
            >
              {operarios.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.categoria} - {t.rol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pestañas internas: Tareas vs Historial */}
        <div className="flex border-b border-white/10 mt-6 -mb-4 sm:-mb-6 gap-6">
          <button
            onClick={() => setSubTab("tareas")}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              subTab === "tareas"
                ? "border-[#FF6A1F] text-[#FF6A1F]"
                : "border-transparent text-[#9AA2AE] hover:text-white"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Mis Tareas de Hoy</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/10 text-xs font-mono">
              {misTareas.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab("historial")}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              subTab === "historial"
                ? "border-[#FF6A1F] text-[#FF6A1F]"
                : "border-transparent text-[#9AA2AE] hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Mi Historial & Jornales</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: MIS TAREAS */}
      {subTab === "tareas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F4F1EA] flex items-center gap-2">
              <span>Tareas Pendientes & Activas</span>
              <span className="text-xs text-[#9AA2AE] font-normal">
                (Sube tu foto para validar tu jornada)
              </span>
            </h2>
          </div>

          {misTareas.length === 0 ? (
            <div className="bg-[#181c24] border border-white/10 rounded-2xl p-10 text-center space-y-3">
              <FileCheck2 className="h-12 w-12 text-[#9AA2AE] mx-auto opacity-50" />
              <h3 className="text-base font-semibold text-white">No tienes tareas asignadas por el momento</h3>
              <p className="text-xs text-[#9AA2AE] max-w-sm mx-auto">
                Tu supervisor de obra aún no ha cargado tareas para tu jornada de hoy. Consulta con él en obra.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {misTareas.map((tarea) => {
                const badge = getBadgeEstado(tarea.estado);
                const BadgeIcon = badge.icon;
                const esFinalizada = tarea.estado === "Aprobada";
                const esperandoRevision = tarea.estado === "Reportada";

                return (
                  <div
                    key={tarea.id}
                    className="bg-[#181c24] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-5 shadow-lg space-y-4"
                  >
                    {/* Header de la Tarea */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                            <BadgeIcon className="h-3.5 w-3.5" />
                            {badge.text}
                          </span>
                          <span className="text-xs text-[#9AA2AE] bg-white/5 px-2 py-0.5 rounded-md font-mono">
                            {tarea.fecha}
                          </span>
                          <span className="text-xs text-[#FFC93C] font-semibold bg-[#FFC93C]/10 border border-[#FFC93C]/20 px-2 py-0.5 rounded-md">
                            +{tarea.porcentajeAvanceAsociado}% Avance
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white pt-1">{tarea.descripcion}</h3>
                      </div>
                    </div>

                    {/* Detalles Adicionales / Fotos si ya envió */}
                    {tarea.fotos && tarea.fotos.length > 0 && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs text-[#9AA2AE] font-medium">Foto enviada:</span>
                        <div className="flex gap-2">
                          {tarea.fotos.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Evidencia"
                              className="w-16 h-16 object-cover rounded-xl border border-white/20 shadow-md cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(img, "_blank")}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comentario previo o nota de rechazo */}
                    {tarea.comentarioSupervisor && (
                      <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-300">
                        <strong>Nota del supervisor:</strong> {tarea.comentarioSupervisor}
                      </div>
                    )}
                    {tarea.comentarioTrabajador && (
                      <p className="text-xs text-[#9AA2AE] italic bg-white/5 p-2.5 rounded-xl">
                        &ldquo;{tarea.comentarioTrabajador}&rdquo;
                      </p>
                    )}

                    {/* Botones de Acción */}
                    {!esFinalizada && (
                      <div className="flex flex-wrap gap-2.5 pt-2 border-t border-white/5">
                        <button
                          disabled={esperandoRevision}
                          onClick={() => handleAbrirReporte(tarea)}
                          className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all shadow-md active:scale-95 ${
                            esperandoRevision
                              ? "bg-white/10 text-[#9AA2AE] cursor-not-allowed"
                              : "bg-[#FF6A1F] hover:bg-[#ff7b38] text-[#181205] shadow-orange-600/20"
                          }`}
                        >
                          <Camera className="h-4 w-4" />
                          {esperandoRevision ? "Reporte en Revisión" : "📸 Marcar Hecho / Subir Foto"}
                        </button>

                        {!esperandoRevision && (
                          <button
                            onClick={() => {
                              setTareaParaProblema(tarea);
                              setDescripcionProblema("");
                            }}
                            className="inline-flex items-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer transition-all active:scale-95"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <span>Reportar Traba</span>
                          </button>
                        )}
                      </div>
                    )}

                    {esFinalizada && (
                      <div className="p-2.5 bg-[#3BC97C]/10 border border-[#3BC97C]/20 rounded-xl flex items-center justify-between text-xs text-[#3BC97C]">
                        <span className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Aprobado por {tarea.aprobadoPor || "Supervisor"}
                        </span>
                        <span className="font-mono text-[11px]">{tarea.fechaAprobacion}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: HISTORIAL Y JORNALES */}
      {subTab === "historial" && (
        <div className="space-y-6">
          {/* Métricas de Jornales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#181c24] border border-white/10 p-4 rounded-2xl">
              <span className="text-[11px] text-[#9AA2AE] uppercase font-bold tracking-wider">Días Trabajados</span>
              <p className="text-2xl font-black text-white font-mono mt-1">{totalDiasPresente}</p>
              <span className="text-[11px] text-[#3BC97C] font-semibold">Jornales enteros</span>
            </div>

            <div className="bg-[#181c24] border border-white/10 p-4 rounded-2xl">
              <span className="text-[11px] text-[#9AA2AE] uppercase font-bold tracking-wider">Horas Extras</span>
              <p className="text-2xl font-black text-[#FFC93C] font-mono mt-1">{totalHorasExtra} hs</p>
              <span className="text-[11px] text-[#9AA2AE]">al 50% recargo</span>
            </div>

            <div className="bg-[#181c24] border border-white/10 p-4 rounded-2xl">
              <span className="text-[11px] text-[#9AA2AE] uppercase font-bold tracking-wider">Vales / Adelantos</span>
              <p className="text-lg font-black text-red-400 font-mono mt-1">
                -₲ {totalValesPYG.toLocaleString("es-PY")}
              </p>
              <span className="text-[11px] text-red-400/80">a descontar</span>
            </div>

            <div className="bg-gradient-to-br from-[#181c24] to-[#1e2430] border border-[#3BC97C]/30 p-4 rounded-2xl shadow-lg shadow-green-950/20">
              <span className="text-[11px] text-[#3BC97C] uppercase font-bold tracking-wider">Cobro Neto Estimado</span>
              <p className="text-lg font-black text-[#3BC97C] font-mono mt-1">
                ₲ {totalEstimadoCobro.toLocaleString("es-PY")}
              </p>
              <span className="text-[10px] text-[#9AA2AE]">Diaria base: ₲ {diariaPYG.toLocaleString("es-PY")}</span>
            </div>
          </div>

          {/* Tabla de Asistencias Diarias */}
          <div className="bg-[#181c24] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF6A1F]" />
                <span>Registro de Asistencias y Días</span>
              </h3>
              <span className="text-xs text-[#9AA2AE] font-mono">{misDiarias.length} registros</span>
            </div>

            {misDiarias.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9AA2AE]">
                Aún no hay asistencias cargadas para este funcionario en el sistema.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {misDiarias.map((reg) => (
                  <div key={reg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{reg.fecha}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          reg.estadoAsistencia === "Presente"
                            ? "bg-[#3BC97C]/20 text-[#3BC97C]"
                            : reg.estadoAsistencia === "Medio Día"
                            ? "bg-amber-500/20 text-amber-400"
                            : reg.estadoAsistencia === "Ausente"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-[#45B2FF]/20 text-[#45B2FF]"
                        }`}>
                          {reg.estadoAsistencia}
                        </span>
                        {reg.horasExtra > 0 && (
                          <span className="bg-[#FFC93C]/20 text-[#FFC93C] px-1.5 py-0.5 rounded font-bold font-mono">
                            +{reg.horasExtra} hs extra
                          </span>
                        )}
                      </div>
                      {reg.observaciones && (
                        <p className="text-[#9AA2AE] italic">{reg.observaciones}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {reg.valePYG > 0 && (
                        <span className="text-red-400 font-mono font-bold">
                          Vale: -₲ {reg.valePYG.toLocaleString("es-PY")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SUBIR REPORTE CON FOTO COMPRIMIDA Y EPP */}
      {tareaParaReportar && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181c24] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#FF6A1F]">
                  Validar Tarea Realizada
                </span>
                <h3 className="text-lg font-bold text-white font-heading mt-1">
                  {tareaParaReportar.descripcion}
                </h3>
              </div>
              <button
                onClick={() => setTareaParaReportar(null)}
                className="text-[#9AA2AE] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Checklist de EPP Obligatorio */}
            <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#FFC93C]" />
                <span>Checklist de Seguridad (EPP en Obra)</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#F4F1EA]">
                  <input
                    type="checkbox"
                    checked={eppCasco}
                    onChange={(e) => setEppCasco(e.target.checked)}
                    className="accent-[#FF6A1F] w-4 h-4 rounded"
                  />
                  <span>🪖 Casco de Seguridad</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#F4F1EA]">
                  <input
                    type="checkbox"
                    checked={eppBotas}
                    onChange={(e) => setEppBotas(e.target.checked)}
                    className="accent-[#FF6A1F] w-4 h-4 rounded"
                  />
                  <span>🥾 Botas con Puntera</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#F4F1EA]">
                  <input
                    type="checkbox"
                    checked={eppGuantes}
                    onChange={(e) => setEppGuantes(e.target.checked)}
                    className="accent-[#FF6A1F] w-4 h-4 rounded"
                  />
                  <span>🧤 Guantes de Faena</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#F4F1EA]">
                  <input
                    type="checkbox"
                    checked={eppAntiparras}
                    onChange={(e) => setEppAntiparras(e.target.checked)}
                    className="accent-[#FF6A1F] w-4 h-4 rounded"
                  />
                  <span>🥽 Antiparras / Auditivo</span>
                </label>
              </div>
            </div>

            {/* Herramienta Utilizada */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9AA2AE] flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                <span>Herramienta Utilizada (opcional):</span>
              </label>
              <select
                value={herramientaSeleccionada}
                onChange={(e) => setHerramientaSeleccionada(e.target.value)}
                className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A1F]"
              >
                <option value="">Selecciona herramienta del pañol...</option>
                {herramientas.map((h) => (
                  <option key={h.id} value={`${h.nombre} (${h.marca})`}>
                    {h.nombre} - {h.marca} ({h.codigoQR})
                  </option>
                ))}
                <option value="Herramientas Manuales Varias">Herramientas Manuales Varias (Pinza, Destornillador)</option>
                <option value="Escalera Dieléctrica">Escalera Dieléctrica de Fibra</option>
              </select>
            </div>

            {/* Carga de Fotografía con Compresión en Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-[#FF6A1F]" />
                  <span>Foto de Evidencia (Obligatoria)</span>
                </span>
                {fotoTamanoKB > 0 && (
                  <span className="text-[10px] font-mono text-[#3BC97C] bg-[#3BC97C]/15 px-2 py-0.5 rounded-full border border-[#3BC97C]/30">
                    Optimizada a ~{fotoTamanoKB} KB (WebP)
                  </span>
                )}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                className="hidden"
              />

              {fotoBase64 ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 aspect-video bg-black/40">
                  <img src={fotoBase64} alt="Previa" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded-xl backdrop-blur-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="h-3.5 w-3.5" /> Cambiar Foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-white/20 hover:border-[#FF6A1F] rounded-2xl flex flex-col items-center justify-center gap-2 text-xs text-[#9AA2AE] hover:text-white transition-colors cursor-pointer bg-white/[0.02]"
                >
                  <Camera className="h-8 w-8 text-[#FF6A1F] opacity-80" />
                  <span className="font-semibold text-sm text-white">Tomar o Elegir Fotografía</span>
                  <span>Compresión instantánea sin gastar tus datos</span>
                </button>
              )}

              {isCompressing && (
                <p className="text-xs text-[#FFC93C] text-center animate-pulse">
                  Comprimiendo imagen en el dispositivo...
                </p>
              )}
            </div>

            {/* Comentario de Cierre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9AA2AE]">
                Comentario para el supervisor:
              </label>
              <textarea
                rows={2}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ej: Conexión realizada según unifilar. Ajuste de borneras a torque especificado."
                className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
              />
            </div>

            {/* Botón de Envío */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTareaParaReportar(null)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting || isCompressing || !fotoBase64}
                onClick={handleEnviarReporte}
                className="flex-2 py-3 rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] disabled:opacity-50 text-[#181205] font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Enviando..." : "✅ Enviar a Supervisión"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORTAR TRABA / PROBLEMA */}
      {tareaParaProblema && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181c24] border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Reportar Traba en Faena</h3>
              </div>
              <button
                onClick={() => setTareaParaProblema(null)}
                className="text-[#9AA2AE] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#9AA2AE]">
              Tarea: <strong className="text-white">{tareaParaProblema.descripcion}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-red-300">
                ¿Qué impide completar la tarea?
              </label>
              <textarea
                rows={3}
                value={descripcionProblema}
                onChange={(e) => setDescripcionProblema(e.target.value)}
                placeholder="Ej: Faltan conectores metálicos de 1 pulgada y no hay corriente en el tablero de faena."
                className="w-full bg-[#12151b] border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTareaParaProblema(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEnviarProblema}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer shadow-lg shadow-red-950/40"
              >
                Notificar al Supervisor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
