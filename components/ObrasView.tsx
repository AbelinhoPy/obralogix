"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign, 
  X,
  Sliders
} from "lucide-react";
import toast from "react-hot-toast";

export default function ObrasView() {
  const { empresaActual, obras, agregarObra, actualizarProgresoObra } = useObraStore();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");

  // Formulario nueva obra
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [cliente, setCliente] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [responsable, setResponsable] = useState("");
  const [presupuestoPYG, setPresupuestoPYG] = useState<number>(150000000);
  const [tipo, setTipo] = useState<"civil" | "electrico" | "mixto">(
    empresaActual.tipo === "electrico" ? "electrico" : "civil"
  );

  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);
  const obrasFiltradas = obrasEmpresa.filter((o) => {
    if (filtroEstado === "todas") return true;
    return o.estado === filtroEstado;
  });

  const formatoPYG = (monto: number) => {
    return new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(monto);
  };

  const handleCrearObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !cliente) {
      toast.error("Por favor completa el nombre de la obra y el cliente.");
      return;
    }

    const cod = codigo.trim() || `OBR-${Date.now().toString().slice(-4)}`;

    agregarObra({
      empresaId: empresaActual.id,
      codigo: cod,
      nombre,
      tipo,
      cliente,
      ubicacion: ubicacion || "Asunción / Gran Asunción",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFinEstimada: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      responsable: responsable || "Supervisor de Obra",
      estado: "En Ejecución",
      progreso: 10,
      presupuestoPYG: Number(presupuestoPYG) || 50000000,
      costoEjecutadoPYG: 0,
      trabajadoresAsignados: 2
    });

    toast.success("¡Obra creada exitosamente!");
    setModalAbierto(false);
    setNombre("");
    setCliente("");
    setCodigo("");
    setUbicacion("");
    setResponsable("");
  };

  return (
    <div className="space-y-6">
      
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#FF6A1F]" />
            Gestión de Obras y Proyectos
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA2AE]">
            Control de frentes activos, avance físico y presupuestos asignados a {empresaActual.nombre}.
          </p>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6A1F] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Nueva Obra
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["todas", "En Ejecución", "Planificada", "Pausada", "Finalizada"].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all capitalize whitespace-nowrap cursor-pointer ${
              filtroEstado === estado
                ? "bg-[#FF6A1F] text-[#181205] shadow-xs"
                : "bg-[#1e2229] text-[#9AA2AE] border border-white/10 hover:bg-white/5 hover:text-[#F4F1EA]"
            }`}
          >
            {estado === "todas" ? "Todas las Obras" : estado}
          </button>
        ))}
      </div>

      {/* Lista de Obras en Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {obrasFiltradas.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-dashed border-white/15 p-12 text-center text-[#9AA2AE] bg-[#1e2229]">
            <Building2 className="mx-auto h-12 w-12 text-[#9AA2AE]/50 mb-2" />
            <p className="font-semibold text-[#F4F1EA]">No hay obras registradas con este filtro</p>
            <p className="text-xs text-[#9AA2AE] mt-1">Haz clic en &quot;Nueva Obra&quot; para crear tu primer frente de trabajo.</p>
          </div>
        ) : (
          obrasFiltradas.map((obra) => (
            <Card key={obra.id} className="hover:border-white/25 transition-all">
              <CardContent className="p-5 space-y-4">
                
                {/* Header de la Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-[#FFC93C] bg-[#12151b] border border-white/10 px-2 py-0.5 rounded">
                        {obra.codigo}
                      </span>
                      <Badge variant={obra.estado === "En Ejecución" ? "success" : "secondary"}>
                        {obra.estado}
                      </Badge>
                      <span className="text-[10px] font-bold text-[#9AA2AE] uppercase tracking-wider">
                        {obra.tipo === "electrico" ? "⚡ Eléctrico" : "🏗️ Civil"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F4F1EA] font-heading">{obra.nombre}</h3>
                    <p className="text-xs text-[#9AA2AE] font-medium mt-0.5">Cliente: {obra.cliente}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-[#F4F1EA] font-heading">{obra.progreso}%</span>
                    <p className="text-[10px] text-[#9AA2AE]">Avance</p>
                  </div>
                </div>

                {/* Barra de Progreso y Ajustador */}
                <div className="space-y-2">
                  <div className="w-full bg-[#12151b] rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-[#FF6A1F] to-[#FFC93C] transition-all duration-300"
                      style={{ width: `${obra.progreso}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9AA2AE]">
                    <span className="flex items-center gap-1">
                      <Sliders className="h-3 w-3 text-[#FF6A1F]" /> Actualizar avance:
                    </span>
                    <div className="flex items-center gap-1">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => {
                            actualizarProgresoObra(obra.id, pct);
                            toast.success(`Progreso actualizado a ${pct}%`);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                            obra.progreso === pct 
                              ? "bg-[#FF6A1F] text-[#181205]" 
                              : "bg-[#232833] hover:bg-white/10 text-[#F4F1EA]"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metadatos */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#9AA2AE] pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6A1F] shrink-0" />
                    <span className="truncate">{obra.ubicacion}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 text-[#5B8DC0] shrink-0" />
                    <span className="truncate">{obra.responsable}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#9AA2AE] shrink-0" />
                    <span>Inicio: {obra.fechaInicio}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#3BC97C] font-mono">
                    <DollarSign className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatoPYG(obra.presupuestoPYG)}</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal para Crear Obra */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#1e2229] border border-white/15 p-6 shadow-2xl space-y-4 text-[#F4F1EA]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#FF6A1F]" />
                Registrar Nueva Obra
              </h2>
              <button 
                onClick={() => setModalAbierto(false)} 
                className="rounded-lg p-1 text-[#9AA2AE] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearObra} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Código de Obra</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej: OBR-2026-05"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Tipo de Proyecto</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-medium"
                  >
                    <option value="electrico">⚡ Servicio Eléctrico / Tableros</option>
                    <option value="civil">🏗️ Construcción Civil</option>
                    <option value="mixto">🔧 Obra Integral / Mixta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Nombre de la Obra *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Montaje Tableros Nave Industrial 4"
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Cliente / Contratista *</label>
                  <input
                    type="text"
                    required
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ej: Cervepar S.A., Fideicomiso..."
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Ubicación / Ciudad</label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    placeholder="Ej: San Lorenzo, Ruta 2"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Responsable / Jefe</label>
                  <input
                    type="text"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder="Ej: Ing. Marcos Vera"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Presupuesto en Guaraníes (PYG)</label>
                  <input
                    type="number"
                    value={presupuestoPYG}
                    onChange={(e) => setPresupuestoPYG(Number(e.target.value))}
                    step={10000000}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-[#9AA2AE] hover:bg-white/5 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6A1F] px-4 py-2 font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-md cursor-pointer"
                >
                  Guardar y Abrir Obra
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
