import { Client, Account, Databases, ID, Query } from 'appwrite';

// Configuración de Appwrite del lado del cliente
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Clientes para diferentes servicios
export const account = new Account(client);
export const databases = new Databases(client);

// ID de la base de datos (se configura en Appwrite)
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'obralogix_db';

// IDs de las colecciones (se configuran en Appwrite)
export const COLLECTIONS = {
  EMPRESAS: 'empresas',
  USUARIOS: 'usuarios',
  OBRAS: 'obras',
  TRABAJADORES: 'trabajadores',
  ASISTENCIAS_DIARIAS: 'asistencias_diarias',
  BITACORAS: 'bitacoras',
  HERRAMIENTAS: 'herramientas',
  TABLEROS_ELECTRICOS: 'tableros_electricos',
  SUSCRIPCIONES_PAGOS: 'suscripciones_pagos',
};

// Función helper para generar IDs únicos
export const generateId = () => ID.unique();

export { Query };

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
    // Si había una sesión previa, cerrarla para evitar error session_already_exists
    await account.deleteSession('current').catch(() => {});

    // 1. Crear usuario en Appwrite Auth
    const user = await account.create(
      ID.unique(),
      data.email,
      data.password,
      data.nombre
    );

    // 2. Crear sesión automáticamente en el cliente
    const session = await account.createEmailPasswordSession(data.email, data.password);

    // 3. Crear empresa en la base de datos
    const empresaId = ID.unique();
    const empresa = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.EMPRESAS,
      empresaId,
      {
        nombre: data.nombreEmpresa,
        tipo: data.tipoEmpresa,
        ruc: data.ruc || null,
        moneda: 'PYG (₲)',
        contacto: data.email,
        plan: data.plan,
        estado_suscripcion: 'Prueba',
        created_at: new Date().toISOString(),
      }
    );

    // 4. Crear usuario en la tabla usuarios vinculado a la empresa
    const usuarioId = ID.unique();
    const usuario = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USUARIOS,
      usuarioId,
      {
        empresa_id: empresa.$id,
        email: data.email,
        nombre: data.nombre,
        rol: 'admin',
        telefono: '',
        activo: true,
        created_at: new Date().toISOString(),
      }
    );

    // Persistir cookie para middleware y navegación
    if (typeof document !== 'undefined') {
      document.cookie = `obralogix_session=${session.$id}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      localStorage.setItem('obralogix_view', 'app');
    }

    return {
      success: true,
      user: user,
      session: session,
      empresa: {
        ...empresa,
        id: empresa.$id
      },
      usuario: {
        ...usuario,
        id: usuario.$id
      },
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
    // Si había una sesión previa, cerrarla para evitar error session_already_exists
    await account.deleteSession('current').catch(() => {});

    const session = await account.createEmailPasswordSession(data.email, data.password);
    const user = await account.get();

    // Obtener datos del usuario y empresa
    const usuarios = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USUARIOS,
      [Query.equal('email', data.email)]
    );

    let usuario: any = null;
    let empresa: any = null;

    if (usuarios.documents.length > 0) {
      usuario = usuarios.documents[0];
      try {
        empresa = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.EMPRESAS,
          usuario.empresa_id
        );
      } catch (err) {
        console.warn('Empresa no encontrada en BD:', err);
      }
    }

    // Persistir cookie para middleware y sesión cliente
    if (typeof document !== 'undefined') {
      document.cookie = `obralogix_session=${session.$id}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      localStorage.setItem('obralogix_view', 'app');
    }

    return {
      success: true,
      user: user,
      session: session,
      usuario: usuario ? {
        ...usuario,
        id: usuario.$id
      } : { id: user.$id, email: user.email, nombre: user.name, rol: 'admin' },
      empresa: empresa ? {
        ...empresa,
        id: empresa.$id
      } : { id: 'emp-1', nombre: 'Construlógica Servicios Eléctricos', tipo: 'electrico', ruc: '80094521-3', moneda: 'PYG (₲)', contacto: data.email },
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
    await account.deleteSession('current').catch(() => {});
    if (typeof document !== 'undefined') {
      document.cookie = 'obralogix_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('obralogix_view');
      localStorage.removeItem('obralogix_store');
    }
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    if (typeof document !== 'undefined') {
      document.cookie = 'obralogix_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('obralogix_view');
    }
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
    
    const pago = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SUSCRIPCIONES_PAGOS,
      ID.unique(),
      {
        empresa_id: empresaId,
        plan: data.plan,
        monto_pyg: data.monto,
        metodo_pago: data.metodoPago === 'tarjeta' ? 'Bancard' : 
                     data.metodoPago === 'sipap' ? 'Transferencia SIPAP' : 'PagoMóvil',
        estado: 'Aprobado',
        comprobante: '',
        fecha_pago: new Date().toISOString(),
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      }
    );

    // Actualizar estado de suscripción de la empresa
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.EMPRESAS,
      empresaId,
      {
        estado_suscripcion: 'Activo',
        plan: data.plan,
      }
    );

    return {
      success: true,
      pago: pago,
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
    const user = await account.get();
    
    // Obtener datos del usuario y empresa
    const usuarios = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USUARIOS,
      [Query.equal('email', user.email)]
    );

    if (usuarios.documents.length === 0) {
      return { success: false, user: null };
    }

    const usuario = usuarios.documents[0];
    const empresa = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.EMPRESAS,
      usuario.empresa_id
    );

    return {
      success: true,
      user: user,
      usuario: usuario,
      empresa: empresa,
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
    const empresa = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.EMPRESAS,
      empresaId
    );

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