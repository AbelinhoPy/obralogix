require('dotenv').config({ path: '.env.local' });
const { Client, Databases, ID } = require('node-appwrite');

// Configuración de Appwrite
const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6aa224b2003b0db37a3a';
const apiKey = process.env.APPWRITE_API_KEY; // Necesitas crear esta API key en Appwrite

if (!apiKey) {
  console.error('❌ Error: Necesitas configurar APPWRITE_API_KEY en tus variables de entorno');
  console.log('💡 Para obtener una API Key:');
  console.log('1. Ve a https://cloud.appwrite.io');
  console.log('2. Entra a tu proyecto');
  console.log('3. Ve a Settings → API Keys → Create API Key');
  console.log('4. Dale permisos de "Databases" (todos)');
  console.log('5. Copia la key y agrégala a tu .env.local como APPWRITE_API_KEY=tu-key');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'obralogix_db';

// Definición de colecciones y sus atributos
const collections = [
  {
    name: 'empresas',
    id: 'empresas',
    attributes: [
      { name: 'nombre', type: 'string', size: 255, required: true },
      { name: 'tipo', type: 'string', size: 50, required: false, default: 'electrico' },
      { name: 'ruc', type: 'string', size: 50, required: false },
      { name: 'moneda', type: 'string', size: 20, required: false, default: 'PYG (₲)' },
      { name: 'contacto', type: 'string', size: 100, required: false },
      { name: 'plan', type: 'string', size: 50, required: false, default: 'Empresa' },
      { name: 'estado_suscripcion', type: 'string', size: 50, required: false, default: 'Activo' },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'usuarios',
    id: 'usuarios',
    attributes: [
      { name: 'empresa_id', type: 'string', size: 255, required: true },
      { name: 'email', type: 'string', size: 255, required: true },
      { name: 'nombre', type: 'string', size: 255, required: true },
      { name: 'rol', type: 'string', size: 50, required: false, default: 'admin' },
      { name: 'telefono', type: 'string', size: 50, required: false },
      { name: 'activo', type: 'boolean', required: false, default: true },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'obras',
    id: 'obras',
    attributes: [
      { name: 'empresa_id', type: 'string', size: 255, required: true },
      { name: 'codigo', type: 'string', size: 50, required: true },
      { name: 'nombre', type: 'string', size: 255, required: true },
      { name: 'tipo', type: 'string', size: 50, required: false, default: 'civil' },
      { name: 'cliente', type: 'string', size: 255, required: true },
      { name: 'ubicacion', type: 'string', size: 255, required: false },
      { name: 'fecha_inicio', type: 'datetime', required: false },
      { name: 'fecha_fin_estimada', type: 'datetime', required: false },
      { name: 'responsable', type: 'string', size: 255, required: false },
      { name: 'estado', type: 'string', size: 50, required: false, default: 'En Ejecución' },
      { name: 'progreso', type: 'integer', required: false, default: 0 },
      { name: 'presupuesto_pyg', type: 'bigint', required: false, default: 0 },
      { name: 'costo_ejecutado_pyg', type: 'bigint', required: false, default: 0 },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'trabajadores',
    id: 'trabajadores',
    attributes: [
      { name: 'empresa_id', type: 'string', size: 255, required: true },
      { name: 'nombre', type: 'string', size: 255, required: true },
      { name: 'documento', type: 'string', size: 50, required: false },
      { name: 'categoria', type: 'string', size: 100, required: true },
      { name: 'diaria_pyg', type: 'bigint', required: false, default: 150000 },
      { name: 'telefono', type: 'string', size: 50, required: false },
      { name: 'obra_actual_id', type: 'string', size: 255, required: false },
      { name: 'activo', type: 'boolean', required: false, default: true },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'asistencias_diarias',
    id: 'asistencias_diarias',
    attributes: [
      { name: 'fecha', type: 'datetime', required: true },
      { name: 'trabajador_id', type: 'string', size: 255, required: true },
      { name: 'obra_id', type: 'string', size: 255, required: true },
      { name: 'estado_asistencia', type: 'string', size: 50, required: false, default: 'Presente' },
      { name: 'horas_extra', type: 'integer', required: false, default: 0 },
      { name: 'vale_pyg', type: 'bigint', required: false, default: 0 },
      { name: 'observaciones', type: 'string', required: false },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'bitacoras',
    id: 'bitacoras',
    attributes: [
      { name: 'obra_id', type: 'string', size: 255, required: true },
      { name: 'fecha', type: 'datetime', required: true },
      { name: 'clima', type: 'string', size: 50, required: false, default: 'Soleado' },
      { name: 'personal_presente', type: 'integer', required: false, default: 1 },
      { name: 'avance_descripcion', type: 'string', required: true },
      { name: 'trabas_novedades', type: 'string', required: false },
      { name: 'responsable', type: 'string', size: 255, required: false },
      { name: 'fotos', type: 'array', required: false, default: [] },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'herramientas',
    id: 'herramientas',
    attributes: [
      { name: 'empresa_id', type: 'string', size: 255, required: true },
      { name: 'codigo_qr', type: 'string', size: 50, required: true },
      { name: 'nombre', type: 'string', size: 255, required: true },
      { name: 'marca', type: 'string', size: 100, required: false },
      { name: 'numero_serie', type: 'string', size: 100, required: false },
      { name: 'categoria', type: 'string', size: 100, required: false },
      { name: 'estado', type: 'string', size: 50, required: false, default: 'Disponible en Pañol' },
      { name: 'asignado_a', type: 'string', size: 255, required: false },
      { name: 'obra_asignada', type: 'string', size: 255, required: false },
      { name: 'fecha_prestamo', type: 'datetime', required: false },
      { name: 'fecha_devolucion_estimada', type: 'datetime', required: false },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'tableros_electricos',
    id: 'tableros_electricos',
    attributes: [
      { name: 'empresa_id', type: 'string', size: 255, required: true },
      { name: 'codigo', type: 'string', size: 50, required: true },
      { name: 'nombre', type: 'string', size: 255, required: true },
      { name: 'obra_id', type: 'string', size: 255, required: false },
      { name: 'cliente', type: 'string', size: 255, required: false },
      { name: 'tension', type: 'string', size: 50, required: false },
      { name: 'corriente_nominal', type: 'string', size: 50, required: false },
      { name: 'gabinete_tipo', type: 'string', size: 100, required: false },
      { name: 'fase_actual', type: 'string', size: 100, required: false, default: 'Diseño y Planos' },
      { name: 'progreso', type: 'integer', required: false, default: 0 },
      { name: 'responsable', type: 'string', size: 255, required: false },
      { name: 'fecha_entrega_objetivo', type: 'datetime', required: false },
      { name: 'materiales', type: 'array', required: false, default: [] },
      { name: 'created_at', type: 'datetime', required: false },
    ]
  },
  {
    name: 'suscripciones_pagos',
    id: 'suscripciones_pagos',
    attributes: [
      { name: 'empresa_id', type: 'string', size: 255, required: true },
      { name: 'plan', type: 'string', size: 50, required: true },
      { name: 'monto_pyg', type: 'bigint', required: true },
      { name: 'metodo_pago', type: 'string', size: 50, required: true },
      { name: 'estado', type: 'string', size: 50, required: false, default: 'Aprobado' },
      { name: 'comprobante', type: 'string', size: 100, required: false },
      { name: 'fecha_pago', type: 'datetime', required: false },
      { name: 'fecha_vencimiento', type: 'datetime', required: false },
    ]
  }
];

async function createDatabase() {
  try {
    console.log('📦 Verificando base de datos existente...');
    await databases.get(DATABASE_ID);
    console.log('✅ Base de datos encontrada, usando base de datos existente');
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('📦 Creando base de datos...');
      await databases.create(DATABASE_ID, DATABASE_ID);
      console.log('✅ Base de datos creada exitosamente');
    } else {
      console.error('❌ Error verificando base de datos:', error.message);
      throw error;
    }
  }
}

async function createCollection(collection) {
  try {
    console.log(`📁 Creando colección: ${collection.name}...`);
    
    await databases.createCollection(
      DATABASE_ID,
      collection.id,
      collection.name,
      [
        // Permisos para desarrollo (cualquiera puede leer/escribir)
        // Para producción, configurar permisos más restrictivos
      ]
    );
    
    console.log(`✅ Colección ${collection.name} creada`);
    
    // Crear atributos
    for (const attr of collection.attributes) {
      try {
        console.log(`   ↳ Creando atributo: ${attr.name} (${attr.type})`);
        
        let attribute;
        switch (attr.type) {
          case 'string':
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              attr.size || 255,
              attr.required || false
            );
            break;
          case 'integer':
            attribute = await databases.createIntegerAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              attr.required || false,
              attr.default || 0,
              0,
              100, // Rango porcentual para progreso
              attr.array || false
            );
            break;
          case 'bigint':
            // Usar integer en lugar de bigint para compatibilidad
            attribute = await databases.createIntegerAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              attr.required || false,
              attr.default || 0,
              0,
              1000000000, // Rango máximo para montos en guaraníes
              attr.array || false
            );
            break;
          case 'boolean':
            attribute = await databases.createBooleanAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              attr.required || false,
              attr.default || false
            );
            break;
          case 'datetime':
            attribute = await databases.createDatetimeAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              attr.required || false,
              attr.default || null
            );
            break;
          case 'array':
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              1000000,
              attr.required || false,
              null, // No usar default para arrays
              true // array
            );
            break;
          default:
            console.log(`   ⚠️  Tipo ${attr.type} no soportado, usando string por defecto`);
            attribute = await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.name,
              255,
              attr.required || false
            );
        }
        
        console.log(`   ✅ Atributo ${attr.name} creado`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Atributo ${attr.name} ya existe`);
        } else {
          console.error(`   ❌ Error creando atributo ${attr.name}:`, error.message);
        }
      }
    }
    
    // Configurar permisos para desarrollo
    try {
      await databases.updatePermission(
        DATABASE_ID,
        collection.id,
        'read("any")'
      );
      await databases.updatePermission(
        DATABASE_ID,
        collection.id,
        'write("any")'
      );
      console.log(`   ✅ Permisos configurados para desarrollo`);
    } catch (error) {
      console.log(`   ⚠️  Error configurando permisos (puede que ya estén configurados)`);
    }
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Colección ${collection.name} ya existe, verificando atributos...`);
      // Aquí podríamos agregar lógica para verificar/actualizar atributos existentes
    } else {
      console.error(`❌ Error creando colección ${collection.name}:`, error.message);
    }
  }
}

async function setup() {
  try {
    console.log('🚀 Iniciando configuración de Appwrite para ObraLogix...\n');
    
    // Crear base de datos
    await createDatabase();
    
    // Crear todas las colecciones
    for (const collection of collections) {
      await createCollection(collection);
    }
    
    console.log('\n✨ ¡Configuración completada exitosamente!');
    console.log('📋 Base de datos y colecciones creadas en Appwrite');
    console.log('🎯 Ya puedes probar el sistema de autenticación');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setup();