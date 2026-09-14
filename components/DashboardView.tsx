"use client";

import React from "react";
import { useObraStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Wrench, 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileText
} from "lucide-react";

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export default function DashboardView({ onNavigateTab }: DashboardViewProps) {
  const { empresaActual, obras, trabajadores, herramientas, tableros, rolActual } = useObraStore();

  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);
  const trabajadoresEmpresa = trabajadores.filter((t) => t.empresaId === empresaActual.id);
  const herramientasEmpresa = herramientas.filter((h) => h.empresaId === empresaActual.id);
  const tablerosEmpresa = tableros.filter((t) => t.empresaId === empresaActual.id);
  
  const herramientasEnCampo = herramientasEmpresa.filter((h) => h.estado === "En Obra / Asignada");
  const progresoPromedio = obrasEmpresa.length 
    ? Math.round(obrasEmpresa.reduce((acc, o) => acc + o.progreso, 0) / obrasEmpresa.length)
    : 0;

  const formatoPYG = (monto: number) => {
    return new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(monto);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Bienvenida y Empresa */}
      <div className="rounded-2xl bg-gradient-to-r from-[#181c24] via-[#232833] to-[#2d1b12] border border-white/10 p-6 text-[#F4F1EA] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A1F]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-[#FF6A1F]/20 px-3 py-0.5 text-xs font-semibold text-[#FF6A1F] border border-[#FF6A1F]/30">
                {empresaActual.tipo === "electrico" ? "⚡ Sector Eléctrico & Automatización" : "🏗️ Sector Construcción & Obras Civiles"}
              </span>
              <span className="text-xs text-[#9AA2AE]">RUC: {empresaActual.ruc}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F1EA] font-heading">
              Panel de Control · {empresaActual.nombre}
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA2AE] mt-1.5 max-w-2xl leading-relaxed">
              Monitoreo en tiempo real de cuadrillas en obra, avance de proyectos, stock de herramientas con custodia QR y fabricación de tableros.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab("bitacora")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A1F] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/25 active:scale-95 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Cargar Bitácora
            </button>
            <button
              onClick={() => onNavigateTab("cuadrilla")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#F4F1EA] hover:bg-white/15 transition-all border border-white/15 cursor-pointer"
            >
              <Users className="h-4 w-4 text-[#FFC93C]" />
              Llamar Lista (Diarias)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Métricas Clave con Space Grotesk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Obras Activas */}
        <Card className="hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#9AA2AE]">Obras en Ejecución</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-[#5B8DC0]/20 text-[#5B8DC0] border border-[#5B8DC0]/30 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#F4F1EA] font-heading">{obrasEmpresa.length}</div>
            <p className="text-xs text-[#9AA2AE] mt-1.5 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#3BC97C]" />
              <span className="font-bold text-[#3BC97C]">{progresoPromedio}%</span> promedio de avance
            </p>
          </CardContent>
        </Card>

        {/* Cuadrilla / Personal */}
        <Card className="hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#9AA2AE]">Personal en Cuadrilla</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-[#3BC97C]/20 text-[#3BC97C] border border-[#3BC97C]/30 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#F4F1EA] font-heading">{trabajadoresEmpresa.length}</div>
            <p className="text-xs text-[#9AA2AE] mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3BC97C]" />
              100% operativos con diarias
            </p>
          </CardContent>
        </Card>

        {/* Pañol / Herramientas */}
        <Card className="hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#9AA2AE]">Herramientas en Obra</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-[#FFC93C]/20 text-[#FFC93C] border border-[#FFC93C]/30 flex items-center justify-center">
              <Wrench className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#F4F1EA] font-heading">{herramientasEnCampo.length}</div>
            <p className="text-xs text-[#9AA2AE] mt-1.5">
              de {herramientasEmpresa.length} herramientas registradas
            </p>
          </CardContent>
        </Card>

        {/* Tableros / Proyectos Técnicos */}
        <Card className="hover:border-white/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#9AA2AE]">
              {empresaActual.tipo === "electrico" ? "Tableros en Taller" : "Frentes Activos"}
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-[#FF6A1F]/20 text-[#FF6A1F] border border-[#FF6A1F]/30 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#F4F1EA] font-heading">
              {empresaActual.tipo === "electrico" ? tablerosEmpresa.length : obrasEmpresa.length}
            </div>
            <p className="text-xs text-[#9AA2AE] mt-1.5">
              {empresaActual.tipo === "electrico" ? "Fabricación & Ensayos FAT" : "Etapas en curso"}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Grid de Estado de Obras y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Obras en Progreso (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#FF6A1F]" />
              Obras Activas y Avance Físico
            </h2>
            <button
              onClick={() => onNavigateTab("obras")}
              className="text-xs font-bold text-[#FF6A1F] hover:text-[#FFC93C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {obrasEmpresa.length === 0 ? (
              <Card className="border-dashed border-white/15 bg-white/5 p-8 text-center space-y-3">
                <Building2 className="h-10 w-10 text-[#9AA2AE] mx-auto opacity-40" />
                <h3 className="font-bold text-[#F4F1EA] text-sm">No tienes obras registradas aún</h3>
                <p className="text-xs text-[#9AA2AE] max-w-sm mx-auto">
                  Comienza cargando tu primera obra civil o eléctrica para dar seguimiento al avance y costos.
                </p>
                <button
                  onClick={() => onNavigateTab("obras")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A1F] text-[#181205] text-xs font-bold rounded-xl hover:bg-[#E14E10] transition-all cursor-pointer mx-auto"
                >
                  + Cargar mi primera Obra
                </button>
              </Card>
            ) : (
              obrasEmpresa.map((obra) => (
                <Card key={obra.id} className="hover:border-white/25 transition-all">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#FFC93C] bg-[#232833] border border-white/10 px-2 py-0.5 rounded">
                            {obra.codigo}
                          </span>
                          <Badge variant={obra.estado === "En Ejecución" ? "success" : "secondary"}>
                            {obra.estado}
                          </Badge>
                          <span className="text-[10px] font-bold text-[#9AA2AE] uppercase tracking-wider">
                            {obra.tipo === "electrico" ? "⚡ Eléctrico" : "🏗️ Civil"}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#F4F1EA] text-base font-heading">{obra.nombre}</h3>
                        <p className="text-xs text-[#9AA2AE] mt-0.5">Cliente: <strong className="text-[#F4F1EA]">{obra.cliente}</strong> • {obra.ubicacion}</p>
                      </div>

                      <div className="text-right sm:self-center">
                        <span className="text-2xl font-black text-[#F4F1EA] font-heading">{obra.progreso}%</span>
                        <p className="text-[10px] text-[#9AA2AE]">Avance físico</p>
                      </div>
                    </div>

                    {/* Barra de Progreso Industrial */}
                    <div className="w-full bg-[#12151b] rounded-full h-2.5 mb-3 overflow-hidden border border-white/5">
                      <div 
                        className="h-2.5 rounded-full bg-gradient-to-r from-[#FF6A1F] to-[#FFC93C] transition-all duration-500" 
                        style={{ width: `${obra.progreso}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA2AE] pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#5B8DC0]" />
                        <span>{obra.trabajadoresAsignados} funcionarios asignados</span>
                      </div>
                      <div>
                        <span>Responsable: <strong className="text-[#F4F1EA]">{obra.responsable}</strong></span>
                      </div>
                      {rolActual === "admin" ? (
                        <div>
                          <span className="text-[#9AA2AE]">Presupuesto: </span>
                          <strong className="text-[#3BC97C] font-mono">{formatoPYG(obra.presupuestoPYG)}</strong>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#9AA2AE] italic">
                          Presupuesto: Confidencial (Solo Dueño/Admin)
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Alertas de Pañol & Próximos Vencimientos (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#FF6A1F]" />
              Custodia de Pañol
            </h2>
            <button
              onClick={() => onNavigateTab("panol")}
              className="text-xs font-bold text-[#FF6A1F] hover:text-[#FFC93C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              Ir al pañol <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#F4F1EA]">Herramientas en Mano de Operarios</CardTitle>
              <CardDescription className="text-xs text-[#9AA2AE]">Trazabilidad por funcionario y obra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {herramientasEnCampo.length === 0 ? (
                <p className="text-xs text-[#9AA2AE] py-4 text-center">No hay herramientas prestadas actualmente.</p>
              ) : (
                herramientasEnCampo.map((her) => (
                  <div key={her.id} className="p-3 rounded-xl bg-[#232833] border border-white/10 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#F4F1EA] font-semibold">{her.nombre}</strong>
                      <span className="font-mono text-[10px] bg-[#12151b] text-[#FFC93C] px-2 py-0.5 rounded font-bold border border-white/5">
                        {her.codigoQR}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#9AA2AE]">
                      <span>Responsable: <strong className="text-[#F4F1EA]">{her.asignadoA}</strong></span>
                      <span className="text-[#FF6A1F] font-semibold">Devuelve: {her.fechaDevolucionEstimada}</span>
                    </div>
                    <p className="text-[11px] text-[#6b7280] truncate">Obra: {her.obraAsignada}</p>
                  </div>
                ))
              )}

              {/* Tips para Construlógica */}
              <div className="mt-4 rounded-xl bg-[#261912] border border-[#FF6A1F]/30 p-3.5 text-xs text-amber-200/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#FF6A1F]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Control de Pérdidas Activo</span>
                </div>
                <p className="text-[11px] text-[#9AA2AE] leading-relaxed">
                  Cada entrega cuenta con firma digital y registro de código QR para evitar extravíos entre frentes de trabajo.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
