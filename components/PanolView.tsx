"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { Herramienta } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Search, 
  QrCode, 
  UserCheck, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export default function PanolView() {
  const { 
    empresaActual, 
    herramientas, 
    trabajadores, 
    obras, 
    asignarHerramienta, 
    devolverHerramienta 
  } = useObraStore();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [modalAsignar, setModalAsignar] = useState<Herramienta | null>(null);

  // Formulario de asignación
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState("");
  const [obraSeleccionada, setObraSeleccionada] = useState("");
  const [fechaDevolucion, setFechaDevolucion] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const herramientasEmpresa = herramientas.filter((h) => h.empresaId === empresaActual.id);
  const trabajadoresEmpresa = trabajadores.filter((t) => t.empresaId === empresaActual.id);
  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);

  const herramientasFiltradas = herramientasEmpresa.filter((h) => {
    const coincideTexto = 
      h.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.codigoQR.toLowerCase().includes(busqueda.toLowerCase()) ||
      (h.asignadoA && h.asignadoA.toLowerCase().includes(busqueda.toLowerCase()));
    
    if (!coincideTexto) return false;
    if (filtroEstado === "todas") return true;
    return h.estado === filtroEstado;
  });

  const handleConfirmarAsignacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAsignar) return;
    if (!funcionarioSeleccionado) {
      toast.error("Selecciona el funcionario responsable de la herramienta.");
      return;
    }

    const obraNombre = obraSeleccionada || (obrasEmpresa[0]?.nombre ?? "Obra General");
    asignarHerramienta(modalAsignar.id, funcionarioSeleccionado, obraNombre, fechaDevolucion);

    toast.success(`Herramienta ${modalAsignar.codigoQR} asignada a ${funcionarioSeleccionado}`);
    setModalAsignar(null);
    setFuncionarioSeleccionado("");
  };

  const handleDevolucion = (herramienta: Herramienta) => {
    devolverHerramienta(herramienta.id);
    toast.success(`Herramienta ${herramienta.codigoQR} reingresada a Pañol central.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#FF6A1F]" />
            Pañol & Control de Herramientas (Custodia QR)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA2AE]">
            Seguimiento de instrumental eléctrico, rotomartillos y equipos de porte: quién la tiene, en qué obra y cuándo la devuelve.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>{herramientasEmpresa.filter(h => h.estado === "Disponible en Pañol").length} Disponibles</span>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-amber-300 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            <span>{herramientasEmpresa.filter(h => h.estado === "En Obra / Asignada").length} En Obra</span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9AA2AE]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por herramienta, marca, código QR o funcionario responsable..."
            className="w-full rounded-xl border border-white/10 bg-[#1e2229] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F4F1EA] focus:outline-none focus:border-[#FF6A1F] shadow-xl placeholder:text-[#6b7280]"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1.5 text-xs">
          {["todas", "Disponible en Pañol", "En Obra / Asignada"].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroEstado(st)}
              className={`rounded-xl px-3.5 py-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filtroEstado === st
                  ? "bg-[#FF6A1F] text-[#181205] shadow-xs font-bold"
                  : "bg-[#1e2229] text-[#9AA2AE] border border-white/10 hover:bg-white/5 hover:text-[#F4F1EA]"
              }`}
            >
              {st === "todas" ? "Todas las Herramientas" : st}
            </button>
          ))}
        </div>

      </div>

      {/* Grid de Herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {herramientasFiltradas.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 p-12 text-center text-[#9AA2AE] bg-[#1e2229]">
            <Wrench className="mx-auto h-12 w-12 text-[#9AA2AE]/50 mb-2" />
            <p className="font-semibold text-[#F4F1EA]">No se encontraron herramientas con este criterio</p>
          </div>
        ) : (
          herramientasFiltradas.map((her) => {
            const estaEnObra = her.estado === "En Obra / Asignada";

            return (
              <Card 
                key={her.id} 
                className={`transition-all ${
                  estaEnObra 
                    ? "border-amber-500/30 bg-[#241c18]" 
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <CardContent className="p-5 space-y-3.5 text-xs">
                  
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[11px] font-bold bg-[#12151b] text-[#FFC93C] border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <QrCode className="h-3 w-3 text-[#FF6A1F]" />
                          {her.codigoQR}
                        </span>
                        <span className="text-[10px] text-[#9AA2AE] font-bold uppercase">
                          {her.categoria}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#F4F1EA] text-sm leading-snug font-heading">{her.nombre}</h3>
                      <p className="text-[#9AA2AE] font-medium mt-0.5">{her.marca} • SN: {her.numeroSerie}</p>
                    </div>

                    <Badge variant={estaEnObra ? "warning" : "success"}>
                      {estaEnObra ? "En Obra" : "En Pañol"}
                    </Badge>
                  </div>

                  {/* Estado de Asignación / Custodia */}
                  {estaEnObra ? (
                    <div className="rounded-xl bg-[#1e1713] border border-amber-500/30 p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#F4F1EA]">
                        <span className="text-[#9AA2AE] text-[11px]">Responsable a cargo:</span>
                        <strong className="font-bold text-[#FFC93C]">{her.asignadoA}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[#F4F1EA]">
                        <span className="text-[#9AA2AE] text-[11px]">Obra destino:</span>
                        <span className="font-medium truncate max-w-[160px] text-right">{her.obraAsignada}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-amber-300 pt-1.5 border-t border-white/10">
                        <span className="text-[#9AA2AE]">Retiro: {her.fechaPrestamo}</span>
                        <span className="font-bold text-[#FF6A1F]">Devuelve: {her.fechaDevolucionEstimada}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#12151b] border border-white/5 p-3 text-[#9AA2AE] text-center">
                      <p className="text-[#3BC97C] font-bold">Disponible para retiro inmediato</p>
                      <p className="text-[11px] text-[#6b7280] mt-0.5">Ubicación: Estante Pañol Central</p>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                    {estaEnObra ? (
                      <button
                        onClick={() => handleDevolucion(her)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#F4F1EA] hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-[#3BC97C]" />
                        Reingresar a Pañol
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setModalAsignar(her);
                          setFuncionarioSeleccionado(trabajadoresEmpresa[0]?.nombre || "");
                          setObraSeleccionada(obrasEmpresa[0]?.nombre || "");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6A1F] px-3 py-1.5 text-xs font-bold text-[#181205] hover:bg-[#E14E10] transition-all cursor-pointer shadow-md shadow-orange-500/20"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Asignar a Funcionario
                      </button>
                    )}
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Asignar Herramienta */}
      {modalAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#1e2229] border border-white/15 p-6 shadow-2xl space-y-4 text-[#F4F1EA]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#FF6A1F]" />
                  Salida de Pañol: {modalAsignar.codigoQR}
                </h2>
                <p className="text-xs text-[#9AA2AE]">{modalAsignar.nombre}</p>
              </div>
              <button 
                onClick={() => setModalAsignar(null)} 
                className="rounded-lg p-1 text-[#9AA2AE] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAsignacion} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Funcionario Responsable (Custodio) *</label>
                <select
                  required
                  value={funcionarioSeleccionado}
                  onChange={(e) => setFuncionarioSeleccionado(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                >
                  <option value="">Seleccionar operario / técnico...</option>
                  {trabajadoresEmpresa.map((t) => (
                    <option key={t.id} value={t.nombre}>
                      {t.nombre} ({t.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Obra o Destino *</label>
                <select
                  value={obraSeleccionada}
                  onChange={(e) => setObraSeleccionada(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                >
                  {obrasEmpresa.map((o) => (
                    <option key={o.id} value={o.nombre}>
                      {o.codigo} - {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Fecha Estimada de Devolución</label>
                <input
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-medium text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151b] border border-white/5 text-[#9AA2AE] text-[11px] leading-relaxed">
                ℹ️ Al confirmar, el sistema registrará la fecha y hora de entrega y guardará la constancia de custodia para {empresaActual.nombre}.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAsignar(null)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-[#9AA2AE] hover:bg-white/5 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6A1F] px-4 py-2 font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-md cursor-pointer"
                >
                  Confirmar Entrega
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
