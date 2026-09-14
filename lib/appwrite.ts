import { Client, Account, Databases, ID, Query } from 'appwrite';

// Configuración de Appwrite
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Clientes para diferentes servicios
export const account = new Account(client);
export const databases = new Databases(client);

// Exportar Query para consultas
export { Query };

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
  TAREAS: 'tareas',
};

// Función helper para generar IDs únicos
export const generateId = () => ID.unique();

export default client;