"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { TableroElectrico } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  CheckSquare, 
  Square, 
  ChevronRight, 
  ShoppingBag
} from "lucide-react";
import toast from "react-hot-toast";

const ETAPAS_FABRICACION: TableroElectrico["faseActual"][] = [
  "Diseño y Planos",
  "Mecanizado de Gabinete",
  "Montaje de Barras",
  "Cableado y Maniobra",
  "Pruebas FAT (Aislación)",
  "Entregado en Obra"
];

export default function TablerosView() {
  const { empresaActual, tableros, actualizarFaseTablero } = useObraStore();
  const [tableroActivoId, setTableroActivoId] = useState<string>(tableros[0]?.id || "");

  const tablerosEmpresa = tableros.filter((t) => t.empresaId === empresaActual.id);
  const tableroSeleccionado = tablerosEmpresa.find((t) => t.id === tableroActivoId) || tablerosEmpresa[0];

  const handleAvanzarFase = (tablero: TableroElectrico, nuevaFase: TableroElectrico["faseActual"]) => {
    const idx = ETAPAS_FABRICACION.indexOf(nuevaFase);
    const nuevoProgreso = Math.round(((idx + 1) / ETAPAS_FABRICACION.length) * 100);
    actualizarFaseTablero(tablero.id, nuevaFase, nuevoProgreso);
    toast.success(`Tablero ${tablero.codigo} actualizado a fase: ${nuevaFase} (${nuevoProgreso}%)`);
  };

  if (tablerosEmpresa.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-[#9AA2AE] bg-[#1e2229]">
        <Cpu className="mx-auto h-12 w-12 text-[#9AA2AE]/50 mb-2" />
        <p className="font-semibold text-[#F4F1EA]">Módulo exclusivo para servicios eléctricos y tableristas</p>
        <p className="text-xs text-[#9AA2AE] mt-1">
          Cambia a la empresa &quot;Construlógica Servicios Eléctricos&quot; en el encabezado para ver el flujo de fabricación de tableros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
            <Cpu className="h-6 w-6 text-[#FF6A1F]" />
            Fabricación de Tableros Eléctricos & Compras
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA2AE]">
            Pipeline técnico de armado de tableros de gran porte (Construlógica), control de materiales (BOM) y ensayos FAT.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="warning" className="px-3 py-1 text-xs">
            ⚡ Especial Construlógica
          </Badge>
        </div>
      </div>

      {/* Selector de Tablero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tablerosEmpresa.map((tab) => {
          const esActivo = tableroSeleccionado?.id === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setTableroActivoId(tab.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                esActivo
                  ? "border-[#FF6A1F] bg-[#221a15] shadow-lg shadow-orange-500/10"
                  : "border-white/10 bg-[#1e2229] hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-[#FFC93C] bg-[#12151b] border border-white/10 px-2 py-0.5 rounded">
                    {tab.codigo}
                  </span>
                  <h3 className="font-bold text-[#F4F1EA] text-sm mt-1 font-heading">{tab.nombre}</h3>
                  <p className="text-xs text-[#9AA2AE] mt-0.5">Cliente: {tab.cliente}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#FF6A1F] font-heading">{tab.progreso}%</span>
                  <p className="text-[10px] text-[#9AA2AE]">Avance</p>
                </div>
              </div>

              <div className="w-full bg-[#12151b] rounded-full h-2 mb-3 overflow-hidden border border-white/5">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#FF6A1F] to-[#FFC93C] transition-all duration-300"
                  style={{ width: `${tab.progreso}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#9AA2AE] pt-2 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#FF6A1F]" />
                  Fase: <strong className="text-[#F4F1EA]">{tab.faseActual}</strong>
                </span>
                <span className="text-[11px] text-[#9AA2AE]">Entrega: {tab.fechaEntregaObjetivo}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle y Fases del Tablero Seleccionado */}
      {tableroSeleccionado && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Pipeline de Etapas (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-[#F4F1EA]">
                      Etapas de Fabricación en Taller
                    </CardTitle>
                    <CardDescription className="text-xs text-[#9AA2AE]">
                      Haz clic en cualquier fase para certificar el avance del tablero
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-[#12151b] border border-white/10 px-2.5 py-1 rounded-lg font-mono font-bold text-[#FFC93C]">
                      {tableroSeleccionado.corrienteNominal}
                    </span>
                    <span className="bg-[#12151b] border border-white/10 px-2.5 py-1 rounded-lg font-semibold text-[#F4F1EA]">
                      {tableroSeleccionado.tension}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                <div className="space-y-2">
                  {ETAPAS_FABRICACION.map((etapa, idx) => {
                    const idxActual = ETAPAS_FABRICACION.indexOf(tableroSeleccionado.faseActual);
                    const completada = idx <= idxActual;
                    const esActual = etapa === tableroSeleccionado.faseActual;

                    return (
                      <div
                        key={etapa}
                        onClick={() => handleAvanzarFase(tableroSeleccionado, etapa)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                          esActual
                            ? "border-[#FF6A1F] bg-[#FF6A1F] text-[#181205] font-bold shadow-lg shadow-orange-500/25"
                            : completada
                            ? "border-emerald-500/30 bg-emerald-500/10 text-[#F4F1EA] hover:bg-emerald-500/15"
                            : "border-white/10 bg-[#12151b]/60 text-[#9AA2AE] hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            esActual
                              ? "bg-[#181205] text-[#FFC93C]"
                              : completada
                              ? "bg-[#3BC97C] text-[#12151b]"
                              : "bg-[#232833] text-[#9AA2AE]"
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold">{etapa}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {completada && !esActual && (
                            <span className="text-xs text-[#3BC97C] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-[#3BC97C]" />
                              Completado
                            </span>
                          )}
                          {esActual && (
                            <span className="text-xs bg-[#181205] text-[#FFC93C] px-2.5 py-1 rounded-md font-bold">
                              En Curso
                            </span>
                          )}
                          {!completada && (
                            <span className="text-xs text-[#6b7280] flex items-center gap-1">
                              Pendiente <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Lista de Materiales (BOM) & Compras (1 col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-[#F4F1EA] flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-[#FF6A1F]" />
                    Lista de Materiales (BOM)
                  </CardTitle>
                  <span className="text-[11px] text-[#3BC97C] font-mono font-bold">
                    {tableroSeleccionado.materiales.filter(m => m.comprado).length}/{tableroSeleccionado.materiales.length} en stock
                  </span>
                </div>
                <CardDescription className="text-xs text-[#9AA2AE]">
                  Insumos eléctricos asignados a este tablero
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2.5 pt-4 text-xs">
                {tableroSeleccionado.materiales.map((mat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-[#12151b] border border-white/5"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {mat.comprado ? (
                          <CheckSquare className="h-4 w-4 text-[#3BC97C]" />
                        ) : (
                          <Square className="h-4 w-4 text-[#6b7280]" />
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${mat.comprado ? "text-[#F4F1EA]" : "text-[#9AA2AE]"}`}>
                          {mat.descripcion}
                        </p>
                        <span className="text-[10px] text-[#6b7280]">Cantidad: {mat.cantidad} u.</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      mat.comprado ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}>
                      {mat.comprado ? "En Stock" : "Por Comprar"}
                    </span>
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    onClick={() => toast.success("Orden de compra de materiales generada")}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-[#F4F1EA] hover:bg-white/10 shadow-xs cursor-pointer transition-all"
                  >
                    Generar Solicitud de Compra
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
