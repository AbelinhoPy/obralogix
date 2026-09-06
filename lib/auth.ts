import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  empresaId: string;
  rol: string;
}

export interface RegistroData {
  email: string;
  password: string;
  nombre: string;
  nombreEmpresa: string;
  ruc?: string;
  tipoEmpresa: 'electrico' | 'civil';
  plan: 'Obra Única' | 'Empresa' | 'Multi-empresa';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PagoData {
  metodoPago: 'tarjeta' | 'sipap' | 'pagomovil';
  plan: string;
  monto: number;
}

// Registrar nuevo usuario y empresa
export async function registrarUsuario(data: RegistroData) {
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.nombre,
          nombre_empresa: data.nombreEmpresa,
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // 2. Crear empresa en la base de datos
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .insert({
        nombre: data.nombreEmpresa,
        tipo: data.tipoEmpresa,
        ruc: data.ruc || null,
        moneda: 'PYG (₲)',
        contacto: data.email,
        plan: data.plan,
        estado_suscripcion: 'Prueba',
      })
      .select()
      .single();

    if (empresaError) throw empresaError;
    if (!empresaData) throw new Error('No se pudo crear la empresa');

    // 3. Crear usuario en la tabla usuarios vinculado a la empresa
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        empresa_id: empresaData.id,
        email: data.email,
        nombre: data.nombre,
        rol: 'admin',
        activo: true,
      })
      .select()
      .single();

    if (usuarioError) throw usuarioError;

    return {
      success: true,
      user: authData.user,
      empresa: empresaData,
      usuario: usuarioData,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Iniciar sesión
export async function iniciarSesion(data: LoginData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo iniciar sesión');

    // Obtener datos del usuario y empresa
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*, empresas(*)')
      .eq('email', data.email)
      .single();

    if (usuarioError) throw usuarioError;
    if (!usuarioData) throw new Error('Usuario no encontrado');

    return {
      success: true,
      user: authData.user,
      usuario: usuarioData,
      empresa: usuarioData.empresas,
    };
  } catch (error) {
    console.error('Error en login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Cerrar sesión
export async function cerrarSesion() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Procesar pago y activar suscripción
export async function procesarPago(data: PagoData, empresaId: string) {
  try {
    // En un sistema real, aquí se integraría con pasarela de pago
    // Por ahora simulamos el pago exitoso
    
    const { data: pagoData, error: pagoError } = await supabase
      .from('suscripciones_pagos')
      .insert({
        empresa_id: empresaId,
        plan: data.plan,
        monto_pyg: data.monto,
        metodo_pago: data.metodoPago === 'tarjeta' ? 'Bancard' : 
                     data.metodoPago === 'sipap' ? 'Transferencia SIPAP' : 'PagoMóvil',
        estado: 'Aprobado',
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      })
      .select()
      .single();

    if (pagoError) throw pagoError;

    // Actualizar estado de suscripción de la empresa
    const { error: updateError } = await supabase
      .from('empresas')
      .update({
        estado_suscripcion: 'Activo',
        plan: data.plan,
      })
      .eq('id', empresaId);

    if (updateError) throw updateError;

    return {
      success: true,
      pago: pagoData,
    };
  } catch (error) {
    console.error('Error en procesar pago:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Obtener usuario actual
export async function obtenerUsuarioActual() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { success: false, user: null };

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*, empresas(*)')
      .eq('email', user.email)
      .single();

    if (usuarioError) throw usuarioError;

    return {
      success: true,
      user: user,
      usuario: usuarioData,
      empresa: usuarioData?.empresas,
    };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Verificar estado de suscripción
export async function verificarSuscripcion(empresaId: string) {
  try {
    const { data: empresa, error } = await supabase
      .from('empresas')
      .select('estado_suscripcion, plan, created_at')
      .eq('id', empresaId)
      .single();

    if (error) throw error;

    // Verificar si está en período de prueba (7 días)
    const fechaCreacion = new Date(empresa.created_at);
    const fechaActual = new Date();
    const diasPrueba = 7;
    const esPrueba = (fechaActual.getTime() - fechaCreacion.getTime()) < (diasPrueba * 24 * 60 * 60 * 1000);

    return {
      success: true,
      estado: empresa.estado_suscripcion,
      plan: empresa.plan,
      esPrueba,
    };
  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}