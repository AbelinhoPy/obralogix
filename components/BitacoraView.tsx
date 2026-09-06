"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  Sun, 
  CloudRain, 
  Cloud, 
  Flame, 
  Camera, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  X,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

export default function BitacoraView() {
  const { empresaActual, obras, bitacoras, agregarEntradaBitacora } = useObraStore();
  
  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);
  const [obraSeleccionadaId, setObraSeleccionadaId] = useState<string>(
    obrasEmpresa[0]?.id || "todas"
  );
  const [modalAbierto, setModalAbierto] = useState(false);

  // Formulario nueva bitácora
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
  const [obraFormId, setObraFormId] = useState<string>(obrasEmpresa[0]?.id || "");
  const [clima, setClima] = useState<"Soleado" | "Lluvia" | "Nublado" | "Caluroso">("Soleado");
  const [personalPresente, setPersonalPresente] = useState(6);
  const [avanceDescripcion, setAvanceDescripcion] = useState("");
  const [trabasNovedades, setTrabasNovedades] = useState("");
  const [responsable, setResponsable] = useState(empresaActual.tipo === "electrico" ? "Ing. Marcos Vera" : "Arq. Diego Fernández");

  const bitacorasFiltradas = bitacoras.filter((b) => {
    const obra = obras.find((o) => o.id === b.obraId);
    if (!obra || obra.empresaId !== empresaActual.id) return false;
    if (obraSeleccionadaId !== "todas" && b.obraId !== obraSeleccionadaId) return false;
    return true;
  });

  const handleCrearEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avanceDescripcion) {
      toast.error("Por favor ingresa la descripción del avance de hoy.");
      return;
    }

    agregarEntradaBitacora({
      obraId: obraFormId || obrasEmpresa[0]?.id || "obr-1",
      fecha,
      clima,
      personalPresente: Number(personalPresente) || 4,
      avanceDescripcion,
      trabasNovedades: trabasNovedades || "Sin incidentes ni demoras reportadas.",
      responsable,
      fotos: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=600&auto=format&fit=crop&q=60"
      ]
    });

    toast.success("¡Entrada de bitácora registrada exitosamente!");
    setModalAbierto(false);
    setAvanceDescripcion("");
    setTrabasNovedades("");
  };

  const iconoClima = (tipo: string) => {
    switch (tipo) {
      case "Soleado": return <Sun className="h-4 w-4 text-[#FFC93C]" />;
      case "Lluvia": return <CloudRain className="h-4 w-4 text-[#5B8DC0]" />;
      case "Nublado": return <Cloud className="h-4 w-4 text-[#9AA2AE]" />;
      case "Caluroso": return <Flame className="h-4 w-4 text-[#FF6A1F]" />;
      default: return <Sun className="h-4 w-4 text-[#FFC93C]" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#FF6A1F]" />
            Bitácora Digital de Obra (Reporte Diario)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA2AE]">
            Registro cronológico con fotos georreferenciadas, clima, mano de obra presente y novedades de cada proyecto.
          </p>
        </div>

        <button
          onClick={() => {
            setObraFormId(obrasEmpresa[0]?.id || "");
            setModalAbierto(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A1F] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Nueva Entrada de Bitácora
        </button>
      </div>

      {/* Selector de Obra */}
      <div className="flex items-center gap-3 bg-[#1e2229] p-4 rounded-2xl border border-white/10 text-xs">
        <span className="font-bold text-[#9AA2AE] uppercase tracking-wider">Filtrar por Obra:</span>
        <select
          value={obraSeleccionadaId}
          onChange={(e) => setObraSeleccionadaId(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:outline-none focus:border-[#FF6A1F] cursor-pointer"
        >
          <option value="todas">Ver todas las obras de {empresaActual.nombre}</option>
          {obrasEmpresa.map((o) => (
            <option key={o.id} value={o.id}>
              {o.codigo} - {o.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Entradas de Bitácora */}
      <div className="space-y-4">
        {bitacorasFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-[#9AA2AE] bg-[#1e2229]">
            <FileText className="mx-auto h-12 w-12 text-[#9AA2AE]/50 mb-2" />
            <p className="font-semibold text-[#F4F1EA]">No hay registros de bitácora para esta selección</p>
            <p className="text-xs text-[#9AA2AE] mt-1">Registra el primer reporte diario haciendo clic en &quot;Nueva Entrada de Bitácora&quot;.</p>
          </div>
        ) : (
          bitacorasFiltradas.map((bitacora) => {
            const obra = obras.find((o) => o.id === bitacora.obraId);
            return (
              <Card key={bitacora.id} className="hover:border-white/25 transition-all overflow-hidden">
                <div className="bg-[#181c24] border-b border-white/10 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#FF6A1F]/15 text-[#FF6A1F] border border-[#FF6A1F]/30 px-2 py-0.5 rounded">
                      {obra?.codigo}
                    </span>
                    <strong className="text-[#F4F1EA] text-sm font-heading">{obra?.nombre}</strong>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#9AA2AE]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#F4F1EA]">
                      <Calendar className="h-3.5 w-3.5 text-[#FF6A1F]" />
                      <span>{bitacora.fecha}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#12151b] border border-white/10 px-2.5 py-1 rounded-lg">
                      {iconoClima(bitacora.clima)}
                      <span className="text-[#F4F1EA]">{bitacora.clima}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#5B8DC0]" />
                      <span>{bitacora.personalPresente} operarios</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4 text-xs sm:text-sm">
                  
                  {/* Avance */}
                  <div>
                    <h4 className="font-bold text-[#3BC97C] flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                      <CheckCircle className="h-4 w-4 text-[#3BC97C]" />
                      Tareas Realizadas & Avance Físico
                    </h4>
                    <p className="text-[#F4F1EA] leading-relaxed bg-[#12151b] p-3.5 rounded-xl border border-white/5">
                      {bitacora.avanceDescripcion}
                    </p>
                  </div>

                  {/* Novedades / Trabas */}
                  {bitacora.trabasNovedades && (
                    <div>
                      <h4 className="font-bold text-[#FF6A1F] flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                        <AlertTriangle className="h-4 w-4 text-[#FF6A1F]" />
                        Novedades, Trabas o Interferencias
                      </h4>
                      <p className="text-[#F4F1EA] leading-relaxed bg-[#281b14] p-3.5 rounded-xl border border-[#FF6A1F]/30">
                        {bitacora.trabasNovedades}
                      </p>
                    </div>
                  )}

                  {/* Galería de Fotos */}
                  {bitacora.fotos && bitacora.fotos.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#9AA2AE] text-xs flex items-center gap-1.5 mb-2.5">
                        <Camera className="h-3.5 w-3.5 text-[#FFC93C]" />
                        Registro Fotográfico Georreferenciado
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {bitacora.fotos.map((foto, idx) => (
                          <div key={idx} className="relative group overflow-hidden rounded-xl border border-white/10 h-28 w-44 bg-[#12151b]">
                            <img
                              src={foto}
                              alt="Foto de obra"
                              className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 opacity-85 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2 text-[#F4F1EA] text-[10px] font-mono font-bold">
                              GeoTag OK · {bitacora.fecha}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#9AA2AE] pt-3 border-t border-white/10">
                    <span>Responsable técnico: <strong className="text-[#F4F1EA]">{bitacora.responsable}</strong></span>
                    <button
                      onClick={() => toast.success("Enlace del reporte copiado para compartir por WhatsApp")}
                      className="inline-flex items-center gap-1.5 text-[#FF6A1F] hover:text-[#FFC93C] font-semibold cursor-pointer transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Compartir por WhatsApp
                    </button>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Nueva Entrada */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#1e2229] border border-white/15 p-6 shadow-2xl space-y-4 text-[#F4F1EA] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#FF6A1F]" />
                Cargar Reporte Diario de Obra
              </h2>
              <button 
                onClick={() => setModalAbierto(false)} 
                className="rounded-lg p-1 text-[#9AA2AE] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearEntrada} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Obra *</label>
                <select
                  value={obraFormId}
                  onChange={(e) => setObraFormId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                >
                  {obrasEmpresa.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} - {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-medium text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Clima</label>
                  <select
                    value={clima}
                    onChange={(e) => setClima(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-medium text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  >
                    <option value="Soleado">☀️ Soleado</option>
                    <option value="Caluroso">🔥 Caluroso</option>
                    <option value="Nublado">☁️ Nublado</option>
                    <option value="Lluvia">🌧️ Lluvia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Operarios</label>
                  <input
                    type="number"
                    value={personalPresente}
                    onChange={(e) => setPersonalPresente(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Descripción del Avance de Hoy *</label>
                <textarea
                  rows={3}
                  required
                  value={avanceDescripcion}
                  onChange={(e) => setAvanceDescripcion(e.target.value)}
                  placeholder="Ej: Se finalizó el cableado del alimentador principal y se montaron 3 bandejas portacables..."
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-3 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Novedades, Trabas o Solicitudes de Material</label>
                <textarea
                  rows={2}
                  value={trabasNovedades}
                  onChange={(e) => setTrabasNovedades(e.target.value)}
                  placeholder="Ej: Faltan terminales de compresión 150mm². Se necesita grúa para mañana..."
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-3 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Responsable que Firma</label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                />
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
                  Publicar en Bitácora
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
