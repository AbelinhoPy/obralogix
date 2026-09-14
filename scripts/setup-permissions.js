require('dotenv').config({ path: '.env.local' });
const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6aa224b300346dc0c7d0';
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: Necesitas configurar APPWRITE_API_KEY');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6aa2276f002ca27420ce';

const COLLECTIONS = {
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

async function updateCollectionPermissions(collectionId, collectionName) {
  try {
    console.log(`🔐 Configurando permisos para: ${collectionName}...`);
    
    const col = await databases.getCollection(DATABASE_ID, collectionId);
    
    const permissions = [
      Permission.read(Role.any()),
      Permission.create(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ];

    await databases.updateCollection(
      DATABASE_ID,
      collectionId,
      col.name,
      permissions,
      false,
      true
    );
    
    console.log(`✅ Permisos configurados para ${collectionName}`);
  } catch (error) {
    console.log(`⚠️  Error configurando permisos para ${collectionName}:`, error.message);
  }
}

async function setupPermissions() {
  try {
    console.log('🚀 Configurando permisos de colecciones para desarrollo...\n');
    
    for (const [key, collectionId] of Object.entries(COLLECTIONS)) {
      await updateCollectionPermissions(collectionId, key);
    }
    
    console.log('\n✨ ¡Permisos configurados exitosamente!');
    console.log('🎯 Las colecciones ahora tienen permisos de lectura/escritura para desarrollo');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración de permisos:', error.message);
    process.exit(1);
  }
}

setupPermissions();