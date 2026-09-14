"use client";

import React, { useState } from "react";
import { useObraStore } from "@/lib/store";
import { registrarUsuario, iniciarSesion, procesarPago } from "@/lib/auth-appwrite";
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  X, 
  ShieldCheck,
  ArrowRight,
  Landmark,
  Smartphone
} from "lucide-react";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planInicial?: "Obra Única" | "Empresa" | "Multi-empresa";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  planInicial = "Empresa"
}: AuthModalProps) {
  const { setEmpresaActual, empresas } = useObraStore();

  const [modo, setModo] = useState<"registro" | "pago" | "login">("registro");
  const [planSeleccionado, setPlanSeleccionado] = useState<string>(planInicial);

  // Datos de registro
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [ruc, setRuc] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState<"electrico" | "civil">("electrico");

  // Datos de pago
  const [metodoPago, setMetodoPago] = useState<"tarjeta" | "sipap" | "pagomovil">("tarjeta");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimientoTarjeta, setVencimientoTarjeta] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const preciosPlan: Record<string, { texto: string; valor: number }> = {
    "Obra Única": { texto: "₲350.000 / mes", valor: 350000 },
    "Empresa": { texto: "₲890.000 / mes", valor: 890000 },
    "Multi-empresa": { texto: "₲1.800.000 / mes", valor: 1800000 }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreUsuario || !email || !password || !nombreEmpresa) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      const data = await registrarUsuario({
        email,
        password,
        nombre: nombreUsuario,
        nombreEmpresa,
        ruc,
        tipoEmpresa,
        plan: planSeleccionado as any,
      });

      if (!data.success) {
        toast.error(data.error || 'Error en el registro');
        return;
      }

      // Guardar datos temporales para el paso de pago
      const datosRegistro = {
        empresaId: data.empresa?.id || (data.empresa as any)?.$id,
        plan: planSeleccionado,
        email,
      };
      sessionStorage.setItem('registroTemporal', JSON.stringify(datosRegistro));

      toast.success("¡Registro exitoso! Procede al pago.");
      setModo("pago");
    } catch (error) {
      toast.error('Error al registrar cuenta. Intenta nuevamente.');
    }
  };

  const handlePagoConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const registroTemporal = JSON.parse(sessionStorage.getItem('registroTemporal') || '{}');
      
      if (!registroTemporal.empresaId) {
        toast.error('Error: No se encontró el ID de empresa. Por favor vuelve a registrarte.');
        return;
      }
      
      const data = await procesarPago(
        {
          metodoPago,
          plan: planSeleccionado,
          monto: preciosPlan[planSeleccionado]?.valor || 0,
        },
        registroTemporal.empresaId
      );

      if (!data.success) {
        toast.error(data.error || 'Error en el procesamiento del pago');
        return;
      }

      // Actualizar el store con la nueva empresa
      const nuevaEmpresa = {
        id: registroTemporal.empresaId,
        nombre: nombreEmpresa,
        tipo: tipoEmpresa,
        ruc: ruc || "80000000-1",
        moneda: "PYG (₲)",
        contacto: email
      };

      useObraStore.setState((state) => ({
        empresas: [nuevaEmpresa, ...state.empresas.filter(e => e.id !== nuevaEmpresa.id)],
        empresaActual: nuevaEmpresa
      }));

      sessionStorage.removeItem('registroTemporal');
      localStorage.setItem('obralogix_view', 'app');
      toast.success("¡Pago aprobado! Cuenta y empresa activadas.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error en el pago. Intenta nuevamente.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      const data = await iniciarSesion({ email, password });

      if (!data.success) {
        toast.error(data.error || 'Error en el inicio de sesión');
        return;
      }

      // Actualizar el store con los datos del usuario y empresa
      if (data.empresa) {
        const empresaFormateada = {
          id: data.empresa.id || (data.empresa as any).$id,
          nombre: data.empresa.nombre,
          tipo: data.empresa.tipo || 'electrico',
          ruc: data.empresa.ruc || '80000000-1',
          moneda: data.empresa.moneda || 'PYG (₲)',
          contacto: data.empresa.contacto || email
        };

        useObraStore.setState((state) => ({
          empresas: [empresaFormateada, ...state.empresas.filter(e => e.id !== empresaFormateada.id)],
          empresaActual: empresaFormateada,
          usuarioAutenticado: data.usuario,
          rolActual: (data.usuario?.rol as any) || "admin"
        }));

        useObraStore.getState().cargarDatosDesdeAppwrite(empresaFormateada.id);
      } else {
        useObraStore.setState({
          usuarioAutenticado: data.usuario,
          rolActual: (data.usuario?.rol as any) || "admin"
        });
      }

      localStorage.setItem('obralogix_view', 'app');
      toast.success("¡Bienvenido de nuevo a ObraLogix!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#1e2229] border border-white/15 p-6 sm:p-8 shadow-2xl text-[#F4F1EA] max-h-[92vh] overflow-y-auto relative">
        
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[#9AA2AE] hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ----------------- 1. MODO REGISTRO ----------------- */}
        {modo === "registro" && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-black text-xs text-[#FF6A1F] uppercase tracking-wider bg-[#FF6A1F]/15 border border-[#FF6A1F]/30 px-2 py-0.5 rounded">
                  Paso 1 de 2: Crear Cuenta
                </span>
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#F4F1EA]">
                Empezá a ordenar tu constructora
              </h2>
              <p className="text-xs text-[#9AA2AE] mt-1">
                Creá tu cuenta de administrador y registrá tu empresa para gestionar obras y cuadrillas.
              </p>
            </div>

            <form onSubmit={handleRegistroSubmit} className="space-y-4 text-xs">
              
              {/* Selección de Plan */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#F4F1EA] uppercase tracking-wider text-[11px]">
                  Plan Seleccionado:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Obra Única", "Empresa", "Multi-empresa"].map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setPlanSeleccionado(plan)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        planSeleccionado === plan
                          ? "border-[#FF6A1F] bg-[#221a15] text-[#F4F1EA]"
                          : "border-white/10 bg-[#12151b] text-[#9AA2AE] hover:border-white/20"
                      }`}
                    >
                      <strong className="block text-xs font-bold truncate">{plan}</strong>
                      <span className="text-[10px] text-[#FFC93C] font-mono font-semibold">
                        {preciosPlan[plan]?.texto.split("/")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre y Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Tu Nombre Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#9AA2AE]" />
                    <input
                      type="text"
                      required
                      value={nombreUsuario}
                      onChange={(e) => setNombreUsuario(e.target.value)}
                      placeholder="Ej: Ing. Carlos Benítez"
                      className="w-full rounded-xl border border-white/10 bg-[#12151b] pl-9 pr-3 py-2 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#F4F1EA]">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#9AA2AE]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@empresa.com.py"
                      className="w-full rounded-xl border border-white/10 bg-[#12151b] pl-9 pr-3 py-2 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Contraseña de Acceso *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9AA2AE]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] pl-9 pr-3 py-2 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Datos de Empresa */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-[#FFC93C] uppercase tracking-wider block mb-2">
                  Datos de tu Empresa / Razón Social:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#F4F1EA]">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      required
                      value={nombreEmpresa}
                      onChange={(e) => setNombreEmpresa(e.target.value)}
                      placeholder="Ej: Construlógica Electricidad"
                      className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#F4F1EA]">RUC (Opcional)</label>
                    <input
                      type="text"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value)}
                      placeholder="Ej: 80094521-3"
                      className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <label className="font-semibold text-[#F4F1EA]">Ramo Principal de Actividad</label>
                  <select
                    value={tipoEmpresa}
                    onChange={(e) => setTipoEmpresa(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="electrico">⚡ Servicios Eléctricos & Tableros (Tipo Construlógica)</option>
                    <option value="civil">🏗️ Construcción Civil & Albañilería</option>
                  </select>
                </div>
              </div>

              {/* Botón Siguiente */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF6A1F] py-3 text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Continuar a Activación y Pago</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-1 text-[#9AA2AE]">
                ¿Ya tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setModo("login")}
                  className="text-[#FF6A1F] font-bold hover:underline cursor-pointer ml-1"
                >
                  Iniciar sesión
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ----------------- 2. MODO PAGO / ACTIVACIÓN ----------------- */}
        {modo === "pago" && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-black text-xs text-[#3BC97C] uppercase tracking-wider bg-[#3BC97C]/15 border border-[#3BC97C]/30 px-2 py-0.5 rounded">
                  Paso 2 de 2: Activación Inmediata
                </span>
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#F4F1EA]">
                Activación del Plan {planSeleccionado}
              </h2>
              <p className="text-xs text-[#9AA2AE] mt-1">
                Empresa: <strong className="text-[#F4F1EA]">{nombreEmpresa}</strong> · Total a pagar: <strong className="text-[#3BC97C] font-mono text-sm">{preciosPlan[planSeleccionado]?.texto}</strong>
              </p>
            </div>

            <form onSubmit={handlePagoConfirmar} className="space-y-4 text-xs">
              
              {/* Selector de Método de Pago Paraguayo */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago("tarjeta")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    metodoPago === "tarjeta"
                      ? "border-[#FF6A1F] bg-[#221a15] text-[#F4F1EA]"
                      : "border-white/10 bg-[#12151b] text-[#9AA2AE] hover:border-white/20"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-[#FF6A1F]" />
                  <span className="font-bold text-[11px]">Tarjeta (Bancard)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("sipap")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    metodoPago === "sipap"
                      ? "border-[#FF6A1F] bg-[#221a15] text-[#F4F1EA]"
                      : "border-white/10 bg-[#12151b] text-[#9AA2AE] hover:border-white/20"
                  }`}
                >
                  <Landmark className="h-5 w-5 text-[#5B8DC0]" />
                  <span className="font-bold text-[11px]">Transf. SIPAP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("pagomovil")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    metodoPago === "pagomovil"
                      ? "border-[#FF6A1F] bg-[#221a15] text-[#F4F1EA]"
                      : "border-white/10 bg-[#12151b] text-[#9AA2AE] hover:border-white/20"
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-[#FFC93C]" />
                  <span className="font-bold text-[11px]">PagoMóvil / Tigo</span>
                </button>
              </div>

              {/* Formulario según método */}
              {metodoPago === "tarjeta" && (
                <div className="space-y-3 bg-[#12151b] p-3.5 rounded-xl border border-white/5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#F4F1EA]">Número de Tarjeta</label>
                    <input
                      type="text"
                      required
                      value={numeroTarjeta}
                      onChange={(e) => setNumeroTarjeta(e.target.value)}
                      placeholder="4500 •••• •••• 1234"
                      className="w-full rounded-xl border border-white/10 bg-[#1e2229] p-2.5 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#F4F1EA]">Vencimiento</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={vencimientoTarjeta}
                        onChange={(e) => setVencimientoTarjeta(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1e2229] p-2.5 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#F4F1EA]">CVV / Seguridad</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1e2229] p-2.5 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === "sipap" && (
                <div className="space-y-2 bg-[#12151b] p-3.5 rounded-xl border border-white/5 text-xs text-[#9AA2AE] leading-relaxed">
                  <p className="font-bold text-[#F4F1EA]">Datos para Transferencia Bancaria SIPAP:</p>
                  <p>Banco: <strong className="text-[#F4F1EA]">Itaú Paraguay / Continental</strong></p>
                  <p>Titular: <strong className="text-[#F4F1EA]">ObraLogix S.A.</strong></p>
                  <p>RUC: <strong className="text-[#F4F1EA]">80124590-4</strong></p>
                  <p>Cuenta Corriente: <strong className="text-[#3BC97C] font-mono">01-445892-01</strong></p>
                  <p className="text-[10px] text-[#FFC93C] pt-1">
                    ✓ Se activa de forma automática e inmediata con comprobante digital.
                  </p>
                </div>
              )}

              {metodoPago === "pagomovil" && (
                <div className="space-y-2 bg-[#12151b] p-3.5 rounded-xl border border-white/5 text-xs text-[#9AA2AE] leading-relaxed">
                  <p className="font-bold text-[#F4F1EA]">Pago por PagoMóvil / Billetera Personal / Tigo Money:</p>
                  <p>Ingresá a tu app bancaria o billetera, buscá el servicio <strong className="text-[#FF6A1F]">ObraLogix</strong> e ingresá tu RUC o CI.</p>
                  <p className="text-[10px] text-[#3BC97C] pt-1">
                    ✓ La confirmación es instantánea.
                  </p>
                </div>
              )}

              {/* Botón Pagar y Entrar */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#3BC97C] py-3 text-sm font-bold text-[#181205] hover:bg-[#34b670] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Confirmar Pago y Entrar al Sistema</span>
              </button>

              <button
                type="button"
                onClick={() => setModo("registro")}
                className="w-full text-center text-xs text-[#9AA2AE] hover:text-[#F4F1EA] cursor-pointer"
              >
                ← Modificar datos de registro
              </button>

            </form>
          </div>
        )}

        {/* ----------------- 3. MODO LOGIN ----------------- */}
        {modo === "login" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-heading text-[#F4F1EA]">
                Iniciar Sesión en ObraLogix
              </h2>
              <p className="text-xs text-[#9AA2AE] mt-1">
                Ingresá con tu correo y contraseña para acceder al panel de tu empresa.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#9AA2AE]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@empresa.com.py"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] pl-9 pr-3 py-2.5 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9AA2AE]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-[#12151b] pl-9 pr-3 py-2.5 text-xs text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF6A1F] py-3 text-sm font-bold text-[#181205] hover:bg-[#E14E10] transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Ingresar al Sistema</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-1 text-[#9AA2AE]">
                ¿Aún no tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setModo("registro")}
                  className="text-[#FF6A1F] font-bold hover:underline cursor-pointer ml-1"
                >
                  Registrar mi empresa
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
