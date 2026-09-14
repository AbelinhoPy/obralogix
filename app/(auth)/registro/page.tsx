"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useObraStore } from "@/lib/store";
import { registrarUsuario, procesarPago } from "@/lib/auth-appwrite";
import {
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

export default function RegistroPage() {
  const router = useRouter();
  const { setEmpresaActual, empresas } = useObraStore();

  const [paso, setPaso] = useState<"datos" | "pago">("datos");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [ruc, setRuc] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState<"electrico" | "civil">("electrico");
  const [planSeleccionado, setPlanSeleccionado] = useState<"Obra Única" | "Empresa" | "Multi-empresa">("Empresa");
  const [isLoading, setIsLoading] = useState(false);

  // Pago
  const [metodoPago, setMetodoPago] = useState<"tarjeta" | "sipap">("tarjeta");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");

  const planes = [
    { id: "Obra Única", nombre: "Obra Única", precio: "₲350.000 / mes", desc: "1 obra activa, hasta 8 operarios" },
    { id: "Empresa", nombre: "Empresa Pro", precio: "₲890.000 / mes", desc: "Obras ilimitadas, cuadrilla completa y pañol QR" },
    { id: "Multi-empresa", nombre: "Multi-empresa", precio: "₲1.800.000 / mes", desc: "Consorcios y contratistas con múltiples RUCs" },
  ];

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreUsuario || !email || !password || !nombreEmpresa) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    setIsLoading(true);
    try {
      const data = await registrarUsuario({
        email,
        password,
        nombre: nombreUsuario,
        nombreEmpresa,
        ruc: ruc || "80000000-1",
        tipoEmpresa,
        plan: planSeleccionado,
      });

      if (data.success) {
        toast.success("Empresa registrada. Procede a confirmar tu suscripción.");
        setPaso("pago");
      } else {
        toast.error(data.error || "Error al registrar la empresa");
      }
    } catch {
      toast.error("Error al registrar cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagoConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulación de pasarela Bancard / SIPAP
      await new Promise((r) => setTimeout(r, 1200));

      const nuevaEmpresa = {
        id: `emp-${Date.now()}`,
        nombre: nombreEmpresa,
        tipo: tipoEmpresa,
        ruc: ruc || "80000000-1",
        moneda: "PYG (₲)",
        contacto: email,
      };

      useObraStore.setState((state) => ({
        empresas: [nuevaEmpresa, ...state.empresas],
        empresaActual: nuevaEmpresa,
      }));

      document.cookie = `obralogix_session=activa_${email}; path=/; max-age=86400; SameSite=Lax`;
      if (typeof window !== "undefined") {
        localStorage.setItem("obralogix_view", "app");
      }

      toast.success("¡Suscripción aprobada! Bienvenido a ObraLogix.");
      window.location.href = "/dashboard";
    } catch {
      toast.error("Error en la confirmación de pago");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12151b] text-[#F4F1EA] flex flex-col justify-center items-center p-4 selection:bg-[#FF6A1F] selection:text-[#181205]">
      <div className="w-full max-w-lg mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9AA2AE] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF6A1F]" />
          <span>Volver a la página principal</span>
        </Link>
      </div>

      <div className="w-full max-w-lg bg-[#181c24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A1F] to-[#FFC93C] text-[#181205] font-black mx-auto flex items-center justify-center text-lg shadow-lg shadow-orange-500/25">
            OL
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-wide">
            {paso === "datos" ? "Alta de Constructora" : "Confirmar Suscripción"}
          </h1>
          <p className="text-xs text-[#9AA2AE]">
            {paso === "datos"
              ? "Crea tu espacio de trabajo y cuadrilla en la nube"
              : "Suscripción mensual facturada en Guaraníes (₲ PYG)"}
          </p>
        </div>

        {paso === "datos" ? (
          <form onSubmit={handleRegistroSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-white block">Nombre de la Empresa:</label>
                <input
                  type="text"
                  required
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  placeholder="Ej: Proyectos del Este S.A."
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">RUC (Paraguay):</label>
                <input
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  placeholder="80012345-6"
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Rubro Principal:</label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  onClick={() => setTipoEmpresa("electrico")}
                  className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                    tipoEmpresa === "electrico"
                      ? "bg-[#FF6A1F]/15 border-[#FF6A1F] text-[#FF6A1F]"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}
                >
                  ⚡ Obras Eléctricas
                </label>
                <label
                  onClick={() => setTipoEmpresa("civil")}
                  className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                    tipoEmpresa === "civil"
                      ? "bg-[#FF6A1F]/15 border-[#FF6A1F] text-[#FF6A1F]"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}
                >
                  🏗️ Construcción Civil
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-white block">Tu Nombre y Apellido:</label>
                <input
                  type="text"
                  required
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="Ing. Marcos Vera"
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Correo Electrónico:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcos@empresa.com.py"
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white block">Contraseña de Acceso:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A1F]"
              />
            </div>

            {/* Selector de Plan */}
            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-white block">Selecciona tu Plan Mensual:</label>
              <div className="grid grid-cols-1 gap-2">
                {planes.map((p) => (
                  <label
                    key={p.id}
                    onClick={() => setPlanSeleccionado(p.id as any)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      planSeleccionado === p.id
                        ? "bg-[#3BC97C]/15 border-[#3BC97C] text-white"
                        : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                    }`}
                  >
                    <div>
                      <strong className="block text-white text-xs">{p.nombre}</strong>
                      <span className="text-[11px] opacity-80">{p.desc}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#3BC97C] shrink-0">
                      {p.precio}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] disabled:opacity-50 text-[#181205] font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-orange-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? "Creando..." : "Continuar a Activación"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handlePagoConfirmar} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#12151b] border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#9AA2AE]">Plan Contratado:</span>
                <strong className="text-white">{planSeleccionado}</strong>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                <span className="text-[#9AA2AE]">Total a facturar:</span>
                <strong className="text-[#3BC97C] font-mono text-sm">
                  {planes.find((p) => p.id === planSeleccionado)?.precio}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-white block">Forma de Pago:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago("tarjeta")}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    metodoPago === "tarjeta"
                      ? "bg-[#45B2FF]/15 border-[#45B2FF] text-[#45B2FF]"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}
                >
                  💳 Tarjeta (Bancard)
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago("sipap")}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    metodoPago === "sipap"
                      ? "bg-[#3BC97C]/15 border-[#3BC97C] text-[#3BC97C]"
                      : "bg-[#12151b] border-white/10 text-[#9AA2AE]"
                  }`}
                >
                  🏦 Transferencia SIPAP
                </button>
              </div>
            </div>

            {metodoPago === "tarjeta" ? (
              <div className="space-y-2">
                <label className="font-semibold text-[#9AA2AE] block">Número de Tarjeta:</label>
                <input
                  type="text"
                  required
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  placeholder="4500 0000 0000 0000"
                  className="w-full bg-[#12151b] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-[#45B2FF]"
                />
              </div>
            ) : (
              <div className="p-3 bg-[#12151b] border border-white/10 rounded-xl text-[11px] text-[#9AA2AE] space-y-1">
                <p>Banco: <strong className="text-white">Banco Itaú Paraguay</strong></p>
                <p>Cuenta Cte: <strong className="text-white font-mono">012345678-9</strong></p>
                <p>Titular: <strong className="text-white">ObraLogix SaaS S.R.L.</strong></p>
                <p>RUC: <strong className="text-white font-mono">80123999-4</strong></p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaso("datos")}
                className="flex-1 py-3 rounded-xl border border-white/15 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-2 py-3 rounded-xl bg-[#3BC97C] hover:bg-[#34b36e] disabled:opacity-50 text-[#181205] font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-green-950/40 transition-all active:scale-95"
              >
                {isLoading ? "Procesando..." : "Confirmar y Activar Cuenta"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-[#9AA2AE]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#FF6A1F] font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
