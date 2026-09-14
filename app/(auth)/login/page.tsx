"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useObraStore } from "@/lib/store";
import { iniciarSesion } from "@/lib/auth-appwrite";
import { Lock, Mail, ArrowRight, ShieldCheck, HardHat, Crown, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setRolActual, setUsuarioAutenticado, empresas, setEmpresaActual } = useObraStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña");
      return;
    }

    setIsLoading(true);
    try {
      const res = await iniciarSesion({ email, password });
      if (res.success) {
        toast.success("¡Bienvenido a ObraLogix!");
        if (res.empresa) {
          setEmpresaActual(res.empresa.id || (res.empresa as any).$id);
        }
        if (res.usuario) {
          setUsuarioAutenticado(res.usuario);
          setRolActual(res.usuario.rol || "admin");
        }
        document.cookie = `obralogix_session=${res.session?.$id || 'active'}; path=/; max-age=2592000; SameSite=Lax`;
        if (typeof window !== "undefined") {
          localStorage.setItem("obralogix_view", "app");
        }
        window.location.href = "/dashboard";
      } else {
        toast.error(res.error || "Credenciales incorrectas");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo direct login for quick testing
  const handleDemoLogin = (rol: "admin" | "supervisor" | "operario") => {
    setRolActual(rol);
    const demoUser = {
      id: rol === "operario" ? "tr-2" : rol === "supervisor" ? "tr-1" : "usr-admin",
      nombre:
        rol === "operario"
          ? "Ronaldo Peña (Operario)"
          : rol === "supervisor"
          ? "Darío González (Supervisor)"
          : "Ing. Marcos Vera (Admin)",
      email: `${rol}@construlogica.com.py`,
      rol: rol,
    };
    setUsuarioAutenticado(demoUser);
    // Establecer cookie para que el middleware valide la sesión
    document.cookie = `obralogix_session=demo_${rol}; path=/; max-age=86400; SameSite=Lax`;
    if (typeof window !== "undefined") {
      localStorage.setItem("obralogix_view", "app");
    }

    toast.success(`Acceso demo como ${rol.toUpperCase()}`);
    if (rol === "operario") {
      window.location.href = "/mis-tareas";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#12151b] text-[#F4F1EA] flex flex-col justify-center items-center p-4 selection:bg-[#FF6A1F] selection:text-[#181205]">
      {/* Botón Volver */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9AA2AE] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF6A1F]" />
          <span>Volver a la página principal</span>
        </Link>
      </div>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md bg-[#181c24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A1F] to-[#FFC93C] text-[#181205] font-black mx-auto flex items-center justify-center text-lg shadow-lg shadow-orange-500/25">
            OL
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-wide">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-[#9AA2AE]">
            Accede al panel de control y gestión de obras de ObraLogix
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-white block">Correo Electrónico:</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#9AA2AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@constructora.com.py"
                className="w-full bg-[#12151b] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-white block">Contraseña:</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#9AA2AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#12151b] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] disabled:opacity-50 text-[#181205] font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-orange-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? "Validando..." : "Entrar a la Plataforma"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Separador */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#181c24] px-3 text-[10px] uppercase font-bold text-[#9AA2AE] shrink-0">
            o prueba rápida con 1 clic
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Botones Demo por Rol */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("admin")}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-[11px] font-bold text-white transition-all active:scale-95 cursor-pointer"
          >
            <Crown className="h-4 w-4 text-[#FFC93C]" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("supervisor")}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-[11px] font-bold text-white transition-all active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-[#45B2FF]" />
            <span>Supervisor</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("operario")}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-[11px] font-bold text-white transition-all active:scale-95 cursor-pointer"
          >
            <HardHat className="h-4 w-4 text-[#3BC97C]" />
            <span>Operario</span>
          </button>
        </div>

        {/* Pie de Registro */}
        <div className="text-center pt-2 text-xs text-[#9AA2AE]">
          ¿Tu empresa no tiene cuenta?{" "}
          <Link href="/registro" className="text-[#FF6A1F] font-bold hover:underline">
            Registrar empresa aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
