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
  X
} from "lucide-react";
import toast from "react-hot-toast";

export default function CuadrillaView() {
  const { 
    empresaActual, 
    trabajadores, 
    obras, 
    diarias, 
    registrarAsistencia, 
    agregarTrabajador 
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

  const trabajadoresEmpresa = trabajadores.filter((t) => t.empresaId === empresaActual.id);
  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);

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
      activo: true
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
            Control de asistencia diaria, jornales pactados en Guaraníes y vales de adelanto de cuadrillas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalNuevoTrabajador(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A1F] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Funcionario
          </button>
        </div>
      </div>

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

        {/* Total Diarias del Día */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">Total Jornales del Día</span>
          <div className="text-2xl font-black text-[#F4F1EA] font-heading mt-1 font-mono">
            {formatoPYG(totalJornalesDia)}
          </div>
          <span className="text-[11px] text-[#9AA2AE]">Mano de obra estimada</span>
        </div>

        {/* Total Vales del Día */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs text-[#9AA2AE] font-semibold uppercase tracking-wider">Vales Entregados</span>
          <div className="text-2xl font-black text-[#FFC93C] font-heading mt-1 font-mono">
            {formatoPYG(totalValesDia)}
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
                    <option value="Oficial Albañil">Oficial Albañil</option>
                    <option value="Ayudante">Ayudante</option>
                    <option value="Electricista Matriculado">Electricista Matriculado</option>
                    <option value="Técnico Tablerista">Técnico Tablerista</option>
                    <option value="Capataz">Capataz</option>
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
