"use client";

import React from "react";
import { useObraStore } from "@/lib/store";
import { useAuth } from "@/lib/use-auth";
import { 
  Building2, 
  Zap, 
  HardHat, 
  Calendar,
  Layers,
  ArrowLeft,
  LogOut,
  User
} from "lucide-react";
import toast from "react-hot-toast";

interface HeaderProps {
  onVolverLanding?: () => void;
}

export default function Header({ onVolverLanding }: HeaderProps) {
  const { empresaActual, empresas, setEmpresaActual, obras, herramientas, usuarioAutenticado, rolActual, setRolActual } = useObraStore();
  const { logout } = useAuth();

  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);
  const herramientasEmpresa = herramientas.filter((h) => h.empresaId === empresaActual.id);
  const herramientasEnUso = herramientasEmpresa.filter((h) => h.estado === "En Obra / Asignada").length;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      if (onVolverLanding) {
        onVolverLanding();
      }
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#181c24]/95 backdrop-blur-md shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A1F] to-[#FFC93C] text-[#181205] font-black shadow-lg shadow-orange-500/20 -rotate-3">
              <span className="font-heading font-black text-sm tracking-tight text-[#181205]">OL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#F4F1EA] font-heading">
                  Obra<span className="text-[#FF6A1F]">Logix</span>
                </span>
                <span className="rounded-md bg-[#FF6A1F]/15 border border-[#FF6A1F]/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#FF6A1F]">
                  SaaS B2B
                </span>
              </div>
              <p className="text-[11px] text-[#9AA2AE] hidden sm:block">
                Construcción Civil & Servicios Eléctricos (Paraguay)
              </p>
            </div>
          </div>

          {/* Selector de Empresa Multi-Tenant & Botón Volver */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Volver a la Landing */}
            {onVolverLanding && (
              <button
                onClick={onVolverLanding}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#F4F1EA] hover:bg-white/10 hover:border-white/25 transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#FF6A1F]" />
                <span className="hidden sm:inline">Ver</span> Landing
              </button>
            )}

            {/* Selector de Empresa */}
            <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-[#232833] px-3 py-1.5 text-xs sm:text-sm">
              <Building2 className="h-4 w-4 text-[#FF6A1F] shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-[#9AA2AE] uppercase tracking-wider">Empresa Activa:</span>
                <select
                  value={empresaActual.id}
                  onChange={(e) => setEmpresaActual(e.target.value)}
                  className="bg-transparent font-bold text-[#F4F1EA] cursor-pointer focus:outline-none pr-2 text-xs"
                >
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-[#1e2229] text-[#F4F1EA]">
                      {emp.nombre} ({emp.tipo === "electrico" ? "⚡ Eléctrico" : "🏗️ Civil"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Micro badges de estado rápido */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-xl bg-[#232833] border border-white/10 px-3 py-1.5 text-[#F4F1EA] font-medium">
                <Layers className="h-3.5 w-3.5 text-[#5B8DC0]" />
                <span>{obrasEmpresa.length} Obras</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-[#232833] border border-white/10 px-3 py-1.5 text-[#F4F1EA] font-medium">
                <Zap className="h-3.5 w-3.5 text-[#FFC93C]" />
                <span>{herramientasEnUso} Herr. en uso</span>
              </div>
            </div>

            {/* Fecha Actual */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#9AA2AE]">
              <Calendar className="h-3.5 w-3.5 text-[#9AA2AE]" />
              <span>{new Date().toLocaleDateString("es-PY", { weekday: "short", day: "numeric", month: "short" })}</span>
            </div>

            {/* Selector y Badge de Rol Activo */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#232833] px-2.5 py-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-[#9AA2AE] hidden sm:inline">Rol:</span>
              <select
                value={rolActual}
                onChange={(e) => setRolActual(e.target.value as any)}
                className="bg-transparent font-bold text-xs cursor-pointer focus:outline-none text-[#FFC93C]"
                title="Cambiar rol activo para pruebas de permisos"
              >
                <option value="admin" className="bg-[#1e2229] text-[#F4F1EA]">👑 Admin (Dueño)</option>
                <option value="supervisor" className="bg-[#1e2229] text-[#F4F1EA]">👷 Supervisor</option>
                <option value="operario" className="bg-[#1e2229] text-[#F4F1EA]">🛠️ Operario</option>
              </select>
            </div>

            {/* Usuario y Logout */}
            {usuarioAutenticado ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#232833] border border-white/10 px-3 py-1.5 text-xs">
                  <User className="h-3.5 w-3.5 text-[#FFC93C]" />
                  <span className="text-[#F4F1EA] font-medium">{usuarioAutenticado.nombre}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onVolverLanding) onVolverLanding();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#F4F1EA] hover:bg-white/10 transition-all cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-[#FF6A1F]" />
                <span>Iniciar Sesión</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
