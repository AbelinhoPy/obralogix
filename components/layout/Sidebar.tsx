"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useObraStore } from "@/lib/store";
import { useAuth } from "@/lib/use-auth";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wrench,
  Cpu,
  HardHat,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  Zap,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";

export function Sidebar() {
  const pathname = usePathname();
  const { empresaActual, rolActual, usuarioAutenticado } = useObraStore();
  const { logout } = useAuth();

  const [colapsado, setColapsado] = useState(false);
  const [mobileAbierto, setMobileAbierto] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada");
      window.location.href = "/login";
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  const navItems = [
    {
      label: "Portal del Trabajador",
      href: "/mis-tareas",
      icon: HardHat,
      badge: "En Obra",
      roles: ["operario", "supervisor", "admin"],
    },
    {
      label: "Bandeja de Aprobación",
      href: "/bandeja",
      icon: ShieldCheck,
      badge: "Supervisión",
      roles: ["admin", "supervisor"],
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "supervisor"],
    },
    {
      label: "Obras",
      href: "/obras",
      icon: Building2,
      roles: ["admin", "supervisor"],
    },
    {
      label: "Cuadrilla & Diarias",
      href: "/cuadrilla",
      icon: Users,
      roles: ["admin", "supervisor"],
    },
    {
      label: "Bitácora Digital",
      href: "/bitacora",
      icon: FileText,
      roles: ["admin", "supervisor", "operario"],
    },
    {
      label: "Pañol de Herramientas",
      href: "/panol",
      icon: Wrench,
      roles: ["admin", "supervisor"],
    },
    {
      label: "Tableros Eléctricos",
      href: "/tableros",
      icon: Cpu,
      badge: "Construlógica",
      roles: ["admin", "supervisor"],
    },
  ];

  const itemsPermitidos = navItems.filter((item) =>
    item.roles.includes(rolActual || "admin")
  );

  return (
    <>
      {/* Botón flotante móvil para abrir drawer */}
      <button
        type="button"
        onClick={() => setMobileAbierto(true)}
        className="md:hidden fixed top-3 left-4 z-50 p-2 rounded-xl bg-[#181c24] border border-white/10 text-white shadow-lg cursor-pointer"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-[#FF6A1F]" />
      </button>

      {/* Overlay para móvil */}
      {mobileAbierto && (
        <div
          onClick={() => setMobileAbierto(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-xs"
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#14171f] border-r border-white/10 transition-all duration-300 flex flex-col justify-between ${
          colapsado ? "w-20" : "w-64"
        } ${
          mobileAbierto
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header de Sidebar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden"
            onClick={() => setMobileAbierto(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A1F] to-[#FFC93C] text-[#181205] font-black flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <span className="font-heading text-sm">OL</span>
            </div>
            {!colapsado && (
              <div className="flex flex-col">
                <span className="font-black text-white font-heading text-base leading-tight">
                  Obra<span className="text-[#FF6A1F]">Logix</span>
                </span>
                <span className="text-[10px] text-[#9AA2AE] truncate max-w-[140px]">
                  {empresaActual.nombre}
                </span>
              </div>
            )}
          </Link>

          {/* Botón de colapsar en Desktop */}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA2AE] hover:text-white transition-all cursor-pointer"
            title={colapsado ? "Expandir" : "Colapsar"}
          >
            {colapsado ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Botón de cerrar en Móvil */}
          <button
            onClick={() => setMobileAbierto(false)}
            className="md:hidden p-1.5 rounded-lg bg-white/5 text-[#9AA2AE] hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-none">
          {itemsPermitidos.map((item) => {
            const Icon = item.icon;
            const esActivo = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileAbierto(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 ${
                  esActivo
                    ? "bg-[#FF6A1F] text-[#181205] font-bold shadow-md shadow-orange-500/20"
                    : "text-[#9AA2AE] hover:bg-white/5 hover:text-white"
                }`}
                title={colapsado ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    esActivo ? "text-[#181205]" : "text-[#9AA2AE] group-hover:text-white"
                  }`}
                />
                {!colapsado && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          esActivo
                            ? "bg-[#181205]/20 text-[#181205]"
                            : "bg-[#FFC93C]/15 text-[#FFC93C] border border-[#FFC93C]/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer de Usuario y Salir */}
        <div className="p-3 border-t border-white/10 bg-[#12151b]/80 space-y-2">
          {!colapsado ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  <User className="h-4 w-4 text-[#FFC93C]" />
                </div>
                <div className="flex flex-col truncate text-[11px]">
                  <span className="font-bold text-white truncate">
                    {usuarioAutenticado?.nombre || "Usuario"}
                  </span>
                  <span className="text-[10px] text-[#9AA2AE] uppercase font-bold text-[#FFC93C]">
                    {rolActual}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
