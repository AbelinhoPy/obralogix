"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useObraStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { empresaActual, cargarDatosDesdeAppwrite } = useObraStore();

  useEffect(() => {
    // Asegurar carga de datos de la empresa activa desde Appwrite al montar
    if (empresaActual?.id) {
      cargarDatosDesdeAppwrite(empresaActual.id);
    }
  }, [empresaActual?.id, cargarDatosDesdeAppwrite]);

  return (
    <div className="min-h-screen bg-[#12151b] text-[#F4F1EA] font-sans selection:bg-[#FF6A1F] selection:text-[#181205]">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
