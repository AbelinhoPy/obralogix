"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Phone, 
  Download,
  X,
  DollarSign,
  CloudRain,
  Clock,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";

export default function CuadrillaView() {
  const { 
    empresaActual, 
    trabajadores, 
    obras, 
    diarias, 
    registrarAsistencia, 
    agregarTrabajador,
    rolActual,
    usuarioAutenticado
  } = useObraStore();

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [modalNuevoTrabajador, setModalNuevoTrabajador] = useState(false);

  // Formulario nuevo trabajador
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [categoria, setCategoria] = useState<any>(
    empresaActual.tipo === "electrico" ? "Técnico Tablerista" : "Oficial Albañil"
  );
  const [diariaPYG, setDiariaPYG] = useState(180000);
  const [telefono, setTelefono] = useState("");
  const [obraAsignada, setObraAsignada] = useState("");
  const [modoVista, setModoVista] = useState<"diario" | "mensual">(
    empresaActual.id === "emp-3" ? "mensual" : "diario"
  );
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("2026-08");

  const trabajadoresEmpresa = trabajadores.filter((t) => t.empresaId === empresaActual.id);
  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);

  const calcularEstadisticasTrabajador = (t: typeof trabajadores[0]) => {
    const registrosMes = diarias.filter(
      (d) => d.trabajadorId === t.id && d.fecha.startsWith(mesSeleccionado)
    );

    let diasCompletos = 0;
    let mediosDias = 0;
    let diasLluvia = 0;
    let totalHorasExtra = 0;
    let vales = 0;

    registrosMes.forEach((r) => {
      vales += r.valePYG || 0;
      if (r.estadoAsistencia === "Presente") {
        diasCompletos++;
      } else if (r.estadoAsistencia === "Medio Día") {
        mediosDias++;
      } else if (r.estadoAsistencia === "Horas Extras") {
        diasCompletos++;
        totalHorasExtra += r.horasExtra || 0;
      } else if (r.estadoAsistencia === "Ausente") {
        if ((r.observaciones || "").toLowerCase().includes("lluvia")) {
          diasLluvia++;
        }
      }
    });

    const valorHora = t.diariaPYG / 8;
    const pagoHorasExtra = totalHorasExtra * (valorHora * 1.5);
    const devengado = (diasCompletos * t.diariaPYG) + (mediosDias * t.diariaPYG * 0.5) + pagoHorasExtra;
    const neto = Math.max(0, devengado - vales);

    return {
      diasCompletos,
      mediosDias,
      diasLluvia,
      totalHorasExtra,
      vales,
      devengado,
      neto
    };
  };

  const handleExportarPlanillaMensual = () => {
    try {
      const headers = [
        "Mes",
        "Nombre",
        "Documento",
        "Categoría",
        "Jornal Diario (PYG)",
        "Días Completos",
        "Medios Días (Sáb/Tardes)",
        "Días Lluvia (0 PYG)",
        "Horas Extras (Colado)",
        "Total Devengado (PYG)",
        "Vales Adelanto (PYG)",
        "Saldo Neto a Cobrar (PYG)"
      ];

      const rows = trabajadoresEmpresa.map((t) => {
        const stats = calcularEstadisticasTrabajador(t);
        return [
          `"${mesSeleccionado}"`,
          `"${t.nombre}"`,
          `"${t.documento}"`,
          `"${t.categoria}"`,
          t.diariaPYG,
          stats.diasCompletos,
          stats.mediosDias,
          stats.diasLluvia,
          stats.totalHorasExtra,
          Math.round(stats.devengado),
          Math.round(stats.vales),
          Math.round(stats.neto)
        ];
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Liquidacion_Mensual_${empresaActual.nombre.replace(/\\s+/g, "_")}_${mesSeleccionado}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("¡Planilla mensual exportada y descargada!");
    } catch (e) {
      toast.error("Error al exportar liquidación mensual");
    }
  };

  let totalDevengadoMes = 0;
  let totalValesMes = 0;
  let totalNetoMes = 0;

  trabajadoresEmpresa.forEach((t) => {
    const st = calcularEstadisticasTrabajador(t);
    totalDevengadoMes += st.devengado;
    totalValesMes += st.vales;
    totalNetoMes += st.neto;
  });

  const formatoPYG = (monto: number) => {
    return new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(monto);
  };

  // Asistencia del día seleccionado
  const obtenerRegistro = (trabajadorId: string) => {
    return diarias.find((d) => d.trabajadorId === trabajadorId && d.fecha === fechaSeleccionada);
  };

  const handleMarcarAsistencia = (
    trabajadorId: string, 
    estado: "Presente" | "Ausente" | "Medio Día" | "Horas Extras",
    obraId: string
  ) => {
    const actual = obtenerRegistro(trabajadorId);
    registrarAsistencia({
      fecha: fechaSeleccionada,
      trabajadorId,
      obraId: obraId || obrasEmpresa[0]?.id || "obr-1",
      estadoAsistencia: estado,
      horasExtra: estado === "Horas Extras" ? (actual?.horasExtra || 2) : 0,
      valePYG: actual?.valePYG || 0,
      observaciones: actual?.observaciones || ""
    });
    toast.success(`Asistencia: ${estado}`);
  };

  const handleActualizarVale = (trabajadorId: string, vale: number, obraId: string) => {
    const actual = obtenerRegistro(trabajadorId);
    registrarAsistencia({
      fecha: fechaSeleccionada,
      trabajadorId,
      obraId: obraId || obrasEmpresa[0]?.id || "obr-1",
      estadoAsistencia: actual?.estadoAsistencia || "Presente",
      horasExtra: actual?.horasExtra || 0,
      valePYG: vale,
      observaciones: actual?.observaciones || ""
    });
  };

  // Totales de la fecha
  let totalJornalesDia = 0;
  let totalValesDia = 0;
  let presentesContador = 0;

  trabajadoresEmpresa.forEach((t) => {
    const reg = obtenerRegistro(t.id);
    const estado = reg?.estadoAsistencia || "Presente";
    const vale = reg?.valePYG || 0;
    totalValesDia += vale;

    if (estado === "Presente") {
      totalJornalesDia += t.diariaPYG;
      presentesContador++;
    } else if (estado === "Medio Día") {
      totalJornalesDia += t.diariaPYG * 0.5;
      presentesContador += 0.5;
    } else if (estado === "Horas Extras") {
      const valorHora = t.diariaPYG / 8;
      const extra = (reg?.horasExtra || 2) * (valorHora * 1.5);
      totalJornalesDia += t.diariaPYG + extra;
      presentesContador++;
    }
  });

  const handleExportarPlanilla = () => {
    try {
      const headers = ["Fecha", "Nombre", "Documento", "Categoría", "Estado Asistencia", "Jornal Diario (PYG)", "Horas Extras", "Vales (PYG)", "Total a Liquidar (PYG)", "Obra", "Observaciones"];
      const rows = trabajadoresEmpresa.map((t) => {
        const reg = obtenerRegistro(t.id);
        const estado = reg?.estadoAsistencia || "Presente";
        const vale = reg?.valePYG || 0;
        const horasExtra = reg?.horasExtra || 0;
        const obraAsoc = obras.find(o => o.id === (reg?.obraId || t.obraActualId))?.nombre || "Obra Asignada";
        
        let subtotal = 0;
        if (estado === "Presente" || estado === "Horas Extras") {
          subtotal = t.diariaPYG + (horasExtra * (t.diariaPYG / 8) * 1.5);
        } else if (estado === "Medio Día") {
          subtotal = t.diariaPYG * 0.5;
        }
        const totalNeto = Math.max(0, subtotal - vale);

        return [
          fechaSeleccionada,
          `"${t.nombre}"`,
          `"${t.documento}"`,
          `"${t.categoria}"`,
          `"${estado}"`,
          t.diariaPYG,
          horasExtra,
          vale,
          Math.round(totalNeto),
          `"${obraAsoc}"`,
          `"${reg?.observaciones || ""}"`
        ];
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Planilla_Cuadrilla_${fechaSeleccionada}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("¡Planilla CSV exportada y descargada!");
    } catch (e) {
      toast.error("Error al generar la planilla");
    }
  };

  const handleCrearTrabajador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      toast.error("Por favor completa el nombre del personal.");
      return;
    }

    agregarTrabajador({
      empresaId: empresaActual.id,
      nombre,
      documento: documento || "Sin C.I.",
      categoria,
      diariaPYG: Number(diariaPYG) || 150000,
      telefono: telefono || "0981-000000",
      obraActualId: obraAsignada || obrasEmpresa[0]?.id || "obr-1",
      activo: true,
      rol: "operario"
    });

    toast.success("¡Funcionario agregado a la cuadrilla!");
    setModalNuevoTrabajador(false);
    setNombre("");
    setDocumento("");
    setTelefono("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
            <Users className="h-6 w-6 text-[#FF6A1F]" />
            Llamado de Lista y Gestión de Diarias
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA2AE]">
            {rolActual === "operario" 
              ? "Consulta tu registro de asistencia diaria, jornales y vales recibidos."
              : "Control de asistencia diaria, jornales pactados en Guaraníes y vales de adelanto de cuadrillas."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {rolActual !== "operario" && (
            <button
              onClick={handleExportarPlanilla}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#F4F1EA] transition-all cursor-pointer border border-white/10"
              title="Descargar planilla de asistencia y jornales en formato CSV / Excel"
            >
              <Download className="h-4 w-4 text-[#3BC97C]" />
              <span className="hidden sm:inline">Exportar</span> Planilla CSV
            </button>
          )}

          {rolActual !== "operario" && (
            <button
              onClick={() => setModalNuevoTrabajador(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A1F] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Funcionario
            </button>
          )}
        </div>
      </div>

      {/* Selector de Modo: Diario vs Liquidación Mensual */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181c24] p-3 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModoVista("mensual")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modoVista === "mensual"
                ? "bg-[#FF6A1F] text-[#181205] shadow-lg shadow-orange-500/20"
                : "text-[#9AA2AE] hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Liquidación Mensual Acumulada
          </button>
          <button
            onClick={() => setModoVista("diario")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modoVista === "diario"
                ? "bg-[#FF6A1F] text-[#181205] shadow-lg shadow-orange-500/20"
                : "text-[#9AA2AE] hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Llamado de Lista Diario
          </button>
        </div>

        {modoVista === "mensual" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9AA2AE] font-semibold">Mes de Liquidación:</span>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="bg-[#12151b] border border-white/15 text-[#F4F1EA] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF6A1F]"
            >
              <option value="2026-08">Agosto 2026 (Simulación Capitals - Losa 200m³)</option>
              <option value="2026-09">Septiembre 2026</option>
            </select>
          </div>
        ) : (
          <div className="text-xs text-[#9AA2AE]">
            Visualizando asistencia día por día
          </div>
        )}
      </div>

      {modoVista === "mensual" ? (
        /* ================= VISTA MENSUAL ================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Tarjetas KPI del Mes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1e2229] p-4 rounded-2xl border border-white/10 shadow-xl">
              <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">Cuadrilla Activa</span>
              <div className="text-2xl font-black text-[#F4F1EA] font-heading mt-1">
                {trabajadoresEmpresa.length} <span className="text-xs font-normal text-[#9AA2AE]">operarios</span>
              </div>
              <span className="text-[11px] text-[#45B2FF] font-semibold">Carpinteros, Armadores y Puntero</span>
            </div>

            <div className="bg-[#1e2229] p-4 rounded-2xl border border-white/10 shadow-xl">
              <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">Mano de Obra Devengada</span>
              <div className="text-2xl font-black text-[#F4F1EA] font-heading mt-1 font-mono">
                {formatoPYG(totalDevengadoMes)}
              </div>
              <span className="text-[11px] text-[#9AA2AE]">Total jornales brutos mes</span>
            </div>

            <div className="bg-[#1e2229] p-4 rounded-2xl border border-white/10 shadow-xl">
              <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">Total Vales Adelantados</span>
              <div className="text-2xl font-black text-[#FFC93C] font-heading mt-1 font-mono">
                {formatoPYG(totalValesMes)}
              </div>
              <span className="text-[11px] text-[#FFC93C] font-semibold">Descontable de liquidación</span>
            </div>

            <div className="bg-[#1e2229] p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 shadow-xl">
              <span className="text-xs text-[#3BC97C] font-semibold uppercase tracking-wider">Saldo Neto a Pagar</span>
              <div className="text-2xl font-black text-[#3BC97C] font-heading mt-1 font-mono">
                {formatoPYG(totalNetoMes)}
              </div>
              <span className="text-[11px] text-[#3BC97C]">Liquidación final cuadrilla</span>
            </div>
          </div>

          {/* Banner de Reglas Aplicadas */}
          <div className="bg-[#181c24] border border-white/10 rounded-2xl p-4 text-xs text-[#9AA2AE] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#F4F1EA]">
                <CloudRain className="h-4 w-4 text-[#45B2FF]" /> <strong>4 días de lluvia</strong> = ₲ 0 (Paralización intemperie)
              </span>
              <span className="flex items-center gap-1.5 text-[#F4F1EA]">
                <Clock className="h-4 w-4 text-[#FFC93C]" /> <strong>Sábados y faltas de tarde</strong> = 50% jornal
              </span>
              <span className="flex items-center gap-1.5 text-[#F4F1EA]">
                <CheckCircle2 className="h-4 w-4 text-[#3BC97C]" /> <strong>Vaciado 200m³ (29/08)</strong> = Jornada intensiva + Horas Extras
              </span>
            </div>
            <button
              onClick={handleExportarPlanillaMensual}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3BC97C] px-4 py-2 font-bold text-[#051c10] hover:bg-[#2fb069] transition-all shadow-md cursor-pointer self-start md:self-auto"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Descargar Planilla Mensual CSV
            </button>
          </div>

          {/* Tabla Mensual de Liquidación */}
          <Card className="overflow-hidden border-white/10">
            <CardHeader className="bg-[#181c24] border-b border-white/10 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-[#F4F1EA]">
                    Planilla Mensual de Liquidación · {mesSeleccionado === "2026-08" ? "Agosto 2026 (Armadura y Carga de Losa 200 m³)" : mesSeleccionado}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#9AA2AE]">
                    Detalle de días completos, medios días (sábados y tardes), días de lluvia (₲ 0), horas extras de colado, vales y líquido a cobrar.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#232833] text-[#9AA2AE] font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Funcionario / Cuadrilla</th>
                    <th className="p-3.5">Categoría & C.I.</th>
                    <th className="p-3.5 text-right">Jornal Diario</th>
                    <th className="p-3.5 text-center">Días Completos</th>
                    <th className="p-3.5 text-center">Medios Días</th>
                    <th className="p-3.5 text-center">Lluvias (₲0)</th>
                    <th className="p-3.5 text-center">Hs Extras</th>
                    <th className="p-3.5 text-right">Total Devengado</th>
                    <th className="p-3.5 text-right">Vales Adelanto</th>
                    <th className="p-3.5 text-right font-black text-[#3BC97C]">Neto a Cobrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trabajadoresEmpresa.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#9AA2AE]">
                        No hay trabajadores registrados en esta empresa.
                      </td>
                    </tr>
                  ) : (
                    trabajadoresEmpresa.map((trabajador) => {
                      const stats = calcularEstadisticasTrabajador(trabajador);
                      return (
                        <tr key={trabajador.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#F4F1EA] text-sm font-heading">{trabajador.nombre}</div>
                            <div className="text-[11px] text-[#9AA2AE] flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 text-[#FF6A1F]" /> {trabajador.telefono}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <Badge variant="outline" className="text-[10px] bg-white/5 text-[#F4F1EA] border-white/10 font-bold mb-1">
                              {trabajador.categoria}
                            </Badge>
                            <div className="text-[11px] text-[#9AA2AE] font-mono">C.I. {trabajador.documento}</div>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-white">
                            {formatoPYG(trabajador.diariaPYG)}
                          </td>
                          <td className="p-3.5 text-center font-bold text-white">
                            {stats.diasCompletos}
                          </td>
                          <td className="p-3.5 text-center font-semibold text-[#FFC93C]" title="Sábados medio día o faltas de tarde">
                            {stats.mediosDias}
                          </td>
                          <td className="p-3.5 text-center font-semibold text-[#45B2FF]" title="Días de lluvia con ₲ 0 pago">
                            {stats.diasLluvia}
                          </td>
                          <td className="p-3.5 text-center font-bold text-[#FF6A1F]">
                            {stats.totalHorasExtra > 0 ? `+${stats.totalHorasExtra} hs` : "0"}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-white">
                            {formatoPYG(stats.devengado)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-semibold text-[#FFC93C]">
                            {stats.vales > 0 ? `- ${formatoPYG(stats.vales)}` : "₲ 0"}
                          </td>
                          <td className="p-3.5 text-right font-mono font-black text-sm text-[#3BC97C]">
                            {formatoPYG(stats.neto)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-[#181c24] font-bold border-t border-white/10 text-white">
                  <tr>
                    <td colSpan={7} className="p-3.5 text-right text-xs uppercase text-[#9AA2AE]">
                      Totales Generales Cuadrilla:
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-sm">
                      {formatoPYG(totalDevengadoMes)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-sm text-[#FFC93C]">
                      - {formatoPYG(totalValesMes)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-base text-[#3BC97C]">
                      {formatoPYG(totalNetoMes)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

        </div>
      ) : (
        /* ================= VISTA DIARIA ================= */
        <div className="space-y-6 animate-in fade-in duration-200">
      {/* Selector de Fecha & Resumen Rápido del Día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#1e2229] p-4 rounded-2xl border border-white/10 shadow-xl">
        
        {/* Selector Fecha */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#9AA2AE] flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-[#FF6A1F]" />
            Fecha de Asistencia:
          </label>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-xs sm:text-sm font-bold text-[#F4F1EA] focus:outline-none focus:border-[#FF6A1F]"
          />
        </div>

        {/* Presentes */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">Asistencia Registrada</span>
          <div className="text-2xl font-black text-[#F4F1EA] font-heading mt-1">
            {presentesContador} <span className="text-xs font-normal text-[#9AA2AE]">/ {trabajadoresEmpresa.length}</span>
          </div>
          <span className="text-[11px] text-[#3BC97C] font-semibold">Operativos hoy</span>
        </div>

        {/* Total Diarias del Día (Oculto para operario) */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">
            {rolActual === "operario" ? "Tu Jornal del Día" : "Total Jornales del Día"}
          </span>
          <div className="text-2xl font-black text-[#F4F1EA] font-heading mt-1 font-mono">
            {rolActual === "operario" 
              ? formatoPYG(trabajadoresEmpresa[0]?.diariaPYG || 150000)
              : formatoPYG(totalJornalesDia)}
          </div>
          <span className="text-[11px] text-[#9AA2AE]">
            {rolActual === "operario" ? "Diaria pactada" : "Mano de obra estimada"}
          </span>
        </div>

        {/* Total Vales del Día (Oculto global para operario) */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">
            {rolActual === "operario" ? "Tus Vales Solicitados" : "Vales Entregados"}
          </span>
          <div className="text-2xl font-black text-[#FFC93C] font-heading mt-1 font-mono">
            {rolActual === "operario" ? formatoPYG(0) : formatoPYG(totalValesDia)}
          </div>
          <span className="text-[11px] text-[#9AA2AE]">Descontable al liquidar</span>
        </div>

      </div>

      {/* Tabla Interactiva de Asistencia (Llamar Lista) */}
      <Card className="overflow-hidden border-white/10">
        <CardHeader className="bg-[#181c24] border-b border-white/10 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-[#F4F1EA]">
                Lista de Cuadrilla · {new Date(fechaSeleccionada + "T00:00:00").toLocaleDateString("es-PY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </CardTitle>
              <CardDescription className="text-xs text-[#9AA2AE]">
                Marca la asistencia y los vales otorgados con un solo toque desde tu celular o tablet.
              </CardDescription>
            </div>
            <button
              onClick={() => toast.success("Planilla de liquidación exportada con éxito")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#F4F1EA] hover:bg-white/10 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#FF6A1F]" />
              Exportar Liquidación
            </button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#232833] text-[#9AA2AE] font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="p-3.5">Funcionario / Operario</th>
                <th className="p-3.5">Categoría & C.I.</th>
                <th className="p-3.5">Obra Asignada</th>
                <th className="p-3.5">Valor Diaria</th>
                <th className="p-3.5 text-center">Estado de Asistencia</th>
                <th className="p-3.5">Vale / Adelanto (₲)</th>
                <th className="p-3.5 text-right">A Cobrar Hoy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trabajadoresEmpresa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#9AA2AE]">
                    No hay trabajadores registrados en esta empresa. Haz clic en &quot;Nuevo Funcionario&quot;.
                  </td>
                </tr>
              ) : (
                trabajadoresEmpresa.map((trabajador) => {
                  const reg = obtenerRegistro(trabajador.id);
                  const estado = reg?.estadoAsistencia || "Presente";
                  const vale = reg?.valePYG || 0;
                  const obra = obras.find((o) => o.id === trabajador.obraActualId);

                  let pagoNetoHoy = 0;
                  if (estado === "Presente") pagoNetoHoy = trabajador.diariaPYG - vale;
                  else if (estado === "Medio Día") pagoNetoHoy = (trabajador.diariaPYG * 0.5) - vale;
                  else if (estado === "Horas Extras") {
                    const extra = (reg?.horasExtra || 2) * ((trabajador.diariaPYG / 8) * 1.5);
                    pagoNetoHoy = (trabajador.diariaPYG + extra) - vale;
                  } else {
                    pagoNetoHoy = -vale;
                  }

                  return (
                    <tr key={trabajador.id} className="hover:bg-white/5 transition-colors">
                      
                      {/* Nombre */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#F4F1EA] text-sm font-heading">{trabajador.nombre}</div>
                        <div className="text-[11px] text-[#9AA2AE] flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-[#FF6A1F]" /> {trabajador.telefono}
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="p-3.5">
                        <Badge variant="secondary" className="font-medium text-[10px]">
                          {trabajador.categoria}
                        </Badge>
                        <div className="text-[10px] text-[#9AA2AE] font-mono mt-0.5">
                          C.I.: {trabajador.documento}
                        </div>
                      </td>

                      {/* Obra */}
                      <td className="p-3.5">
                        <span className="font-medium text-[#F4F1EA] truncate block max-w-[180px]">
                          {obra ? obra.nombre : "Sin asignar"}
                        </span>
                        <span className="text-[10px] text-[#FFC93C] font-mono">
                          {obra?.codigo}
                        </span>
                      </td>

                      {/* Diaria Pactada */}
                      <td className="p-3.5 font-bold text-[#F4F1EA] font-mono">
                        {formatoPYG(trabajador.diariaPYG)}
                      </td>

                      {/* Botones de Asistencia Táctiles */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1 bg-[#12151b] p-1 rounded-xl border border-white/5">
                          <button
                            onClick={() => handleMarcarAsistencia(trabajador.id, "Presente", trabajador.obraActualId)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              estado === "Presente"
                                ? "bg-[#3BC97C] text-[#12151b] shadow-xs"
                                : "text-[#9AA2AE] hover:text-[#F4F1EA]"
                            }`}
                          >
                            Presente
                          </button>
                          <button
                            onClick={() => handleMarcarAsistencia(trabajador.id, "Medio Día", trabajador.obraActualId)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              estado === "Medio Día"
                                ? "bg-[#FFC93C] text-[#12151b] shadow-xs"
                                : "text-[#9AA2AE] hover:text-[#F4F1EA]"
                            }`}
                          >
                            ½ Día
                          </button>
                          <button
                            onClick={() => handleMarcarAsistencia(trabajador.id, "Horas Extras", trabajador.obraActualId)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              estado === "Horas Extras"
                                ? "bg-[#5B8DC0] text-white shadow-xs"
                                : "text-[#9AA2AE] hover:text-[#F4F1EA]"
                            }`}
                          >
                            H. Extra
                          </button>
                          <button
                            onClick={() => handleMarcarAsistencia(trabajador.id, "Ausente", trabajador.obraActualId)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              estado === "Ausente"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "text-[#9AA2AE] hover:text-[#F4F1EA]"
                            }`}
                          >
                            Falta
                          </button>
                        </div>
                      </td>

                      {/* Vale / Adelanto */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#FFC93C] font-bold">₲</span>
                          <input
                            type="number"
                            step={10000}
                            placeholder="0"
                            value={vale || ""}
                            onChange={(e) => handleActualizarVale(trabajador.id, Number(e.target.value) || 0, trabajador.obraActualId)}
                            className="w-24 rounded-lg border border-white/10 bg-[#12151b] px-2 py-1 font-mono text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6A1F]"
                          />
                        </div>
                      </td>

                      {/* Neto a Cobrar */}
                      <td className="p-3.5 text-right font-black text-[#3BC97C] text-sm font-mono">
                        {formatoPYG(pagoNetoHoy)}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

        </div>
      )}

      {/* Modal Nuevo Funcionario */}
      {modalNuevoTrabajador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#1e2229] border border-white/15 p-6 shadow-2xl space-y-4 text-[#F4F1EA]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#FF6A1F]" />
                Registrar Funcionario / Operario
              </h2>
              <button 
                onClick={() => setModalNuevoTrabajador(false)} 
                className="rounded-lg p-1 text-[#9AA2AE] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearTrabajador} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Marcos Ramírez"
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">C.I. / Documento</label>
                  <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Ej: 4.512.980"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Teléfono</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 0981-234567"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Categoría / Oficio</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-medium"
                  >
                    <option value="Capataz">Capataz / Puntero</option>
                    <option value="Oficial Armador">Oficial Armador</option>
                    <option value="Oficial Carpintero">Oficial Carpintero</option>
                    <option value="Medio Oficial">Medio Oficial</option>
                    <option value="Oficial Albañil">Oficial Albañil</option>
                    <option value="Ayudante">Ayudante</option>
                    <option value="Electricista Matriculado">Electricista Matriculado</option>
                    <option value="Técnico Tablerista">Técnico Tablerista</option>
                    <option value="Soldador">Soldador</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Jornal Diario (PYG)</label>
                  <input
                    type="number"
                    step={10000}
                    value={diariaPYG}
                    onChange={(e) => setDiariaPYG(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Obra Principal Asignada</label>
                <select
                  value={obraAsignada}
                  onChange={(e) => setObraAsignada(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-medium"
                >
                  <option value="">Seleccionar obra...</option>
                  {obrasEmpresa.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} - {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNuevoTrabajador(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-[#9AA2AE] hover:bg-white/5 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6A1F] px-4 py-2 font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-md cursor-pointer"
                >
                  Guardar en Cuadrilla
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
