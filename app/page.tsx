"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import DashboardView from "@/components/DashboardView";
import ObrasView from "@/components/ObrasView";
import CuadrillaView from "@/components/CuadrillaView";
import BitacoraView from "@/components/BitacoraView";
import PanolView from "@/components/PanolView";
import TablerosView from "@/components/TablerosView";
import LandingPage from "@/components/LandingPage";
import { useObraStore } from "@/lib/store";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Wrench, 
  Cpu
} from "lucide-react";

export default function Home() {
  const [vista, setVista] = useState<"landing" | "app">("landing");
  const [tabActiva, setTabActiva] = useState<string>("dashboard");
  const { empresaActual } = useObraStore();

  const handleOpenApp = (tab?: string) => {
    if (tab) setTabActiva(tab);
    setVista("app");
  };

  if (vista === "landing") {
    return <LandingPage onOpenApp={handleOpenApp} />;
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "obras", label: "Obras", icon: Building2 },
    { id: "cuadrilla", label: "Cuadrilla & Diarias", icon: Users },
    { id: "bitacora", label: "Bitácora Digital", icon: FileText },
    { id: "panol", label: "Pañol de Herramientas", icon: Wrench },
    { id: "tableros", label: "Tableros Eléctricos", icon: Cpu, badge: "Construlógica" },
  ];

  return (
    <div className="min-h-screen bg-[#12151b] text-[#F4F1EA] flex flex-col font-sans selection:bg-[#FF6A1F] selection:text-[#181205]">
      {/* Barra de Navegación Superior */}
      <Header onVolverLanding={() => setVista("landing")} />

      {/* Barra de Pestañas / Módulos de Trabajo */}
      <div className="border-b border-white/10 bg-[#181c24]/90 sticky top-16 z-20 shadow-lg backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const esActiva = tabActiva === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                    esActiva
                      ? "bg-[#FF6A1F] text-[#181205] font-bold shadow-md shadow-orange-500/25"
                      : "text-[#9AA2AE] hover:bg-white/5 hover:text-[#F4F1EA]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${esActiva ? "text-[#181205]" : "text-[#9AA2AE]"}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md ${
                      esActiva ? "bg-[#181205]/20 text-[#181205]" : "bg-[#FFC93C]/20 text-[#FFC93C] border border-[#FFC93C]/30"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido Principal según Pestaña */}
      <main className="mx-auto max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full">
        {tabActiva === "dashboard" && <DashboardView onNavigateTab={setTabActiva} />}
        {tabActiva === "obras" && <ObrasView />}
        {tabActiva === "cuadrilla" && <CuadrillaView />}
        {tabActiva === "bitacora" && <BitacoraView />}
        {tabActiva === "panol" && <PanolView />}
        {tabActiva === "tableros" && <TablerosView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#181c24] py-5 mt-auto text-xs text-[#9AA2AE]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F4F1EA] font-heading">ObraLogix SaaS</span>
            <span>•</span>
            <span>Gestión de Obras Civiles y Eléctricas</span>
            <span>•</span>
            <span className="font-mono text-[#3BC97C] font-bold bg-[#3BC97C]/15 border border-[#3BC97C]/30 px-2 py-0.5 rounded">
              ₲ PYG Paraguay
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#6b7280]">
            <span>Construlógica & Aliados</span>
            <button 
              onClick={() => setVista("landing")} 
              className="text-[#FF6A1F] hover:underline cursor-pointer font-semibold"
            >
              Volver a la Página Principal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
