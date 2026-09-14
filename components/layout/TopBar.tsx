"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useObraStore } from "@/lib/store";
import { Building2, Layers, Zap } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const {
    empresaActual,
    empresas,
    setEmpresaActual,
    obras,
    herramientas,
    rolActual,
    setRolActual,
  } = useObraStore();

  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);
  const herramientasEmpresa = herramientas.filter(
    (h) => h.empresaId === empresaActual.id
  );
  const herramientasEnUso = herramientasEmpresa.filter(
    (h) => h.estado === "En Obra / Asignada"
  ).length;

  const getTituloSeccion = () => {
    if (pathname.includes("/dashboard")) return "Dashboard de Control";
    if (pathname.includes("/obras/")) return "Ficha de Obra";
    if (pathname.includes("/obras")) return "Listado de Obras";
    if (pathname.includes("/cuadrilla")) return "Cuadrilla & Asistencias";
    if (pathname.includes("/panol")) return "Pañol de Herramientas";
    if (pathname.includes("/tableros")) return "Tableros Eléctricos (BOM)";
    if (pathname.includes("/bitacora")) return "Bitácora Digital de Faena";
    if (pathname.includes("/mis-tareas")) return "Portal del Trabajador";
    if (pathname.includes("/bandeja")) return "Bandeja de Supervisión";
    return "ObraLogix";
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#181c24]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Título de Sección con margen izquierdo para botón móvil */}
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        <h1 className="text-base sm:text-lg font-black text-white font-heading tracking-wide truncate">
          {getTituloSeccion()}
        </h1>
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#FF6A1F]" />
      </div>

      {/* Controles del TopBar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Micro métricas en desktop */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl bg-[#232833] border border-white/10 px-3 py-1.5 text-[#F4F1EA] font-medium">
            <Layers className="h-3.5 w-3.5 text-[#45B2FF]" />
            <span>{obrasEmpresa.length} Obras</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-[#232833] border border-white/10 px-3 py-1.5 text-[#F4F1EA] font-medium">
            <Zap className="h-3.5 w-3.5 text-[#FFC93C]" />
            <span>{herramientasEnUso} Herr. en obra</span>
          </div>
        </div>

        {/* Selector de Empresa Multi-Tenant */}
        <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-[#232833] px-2.5 sm:px-3 py-1 text-xs">
          <Building2 className="h-3.5 w-3.5 text-[#FF6A1F] shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-bold text-[#9AA2AE] uppercase tracking-wider hidden sm:block">
              Empresa:
            </span>
            <select
              value={empresaActual.id}
              onChange={(e) => setEmpresaActual(e.target.value)}
              className="bg-transparent font-bold text-white cursor-pointer focus:outline-none pr-1 text-[11px] sm:text-xs max-w-[110px] sm:max-w-none truncate"
            >
              {empresas.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                  className="bg-[#1e2229] text-[#F4F1EA]"
                >
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Rol Activo */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#232833] px-2.5 py-1 text-xs">
          <span className="text-[9px] font-bold uppercase text-[#9AA2AE] hidden sm:inline">
            Rol:
          </span>
          <select
            value={rolActual}
            onChange={(e) => setRolActual(e.target.value as any)}
            className="bg-transparent font-bold text-xs cursor-pointer focus:outline-none text-[#FFC93C]"
            title="Cambiar rol activo"
          >
            <option value="admin" className="bg-[#1e2229] text-[#F4F1EA]">
              👑 Admin
            </option>
            <option value="supervisor" className="bg-[#1e2229] text-[#F4F1EA]">
              👷 Supervisor
            </option>
            <option value="operario" className="bg-[#1e2229] text-[#F4F1EA]">
              🛠️ Operario
            </option>
          </select>
        </div>
      </div>
    </header>
  );
}
