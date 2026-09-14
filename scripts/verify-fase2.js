const { Client, Databases, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Leer .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const client = new Client()
  .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

const db = new Databases(client);
const DATABASE_ID = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function testFase2() {
  console.log('=== VERIFICANDO FASE 2: TAREAS EN APPWRITE ===');
  try {
    const testId = 'test_tar_' + Date.now();
    console.log('1. Creando tarea de prueba en Appwrite...');
    const doc = await db.createDocument(
      DATABASE_ID,
      'tareas',
      testId,
      {
        obra_id: 'obr-1',
        trabajador_id: 'tr-2',
        descripcion: 'Verificación de canalizaciones Fase 2',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Reportada',
        fotos: [],
        comentario_trabajador: 'Todo instalado según especificaciones técnicas',
        porcentaje_avance_asociado: 5,
        herramienta_usada: 'Taladro Bosch',
        epp_verificado: true
      }
    );
    console.log('✔ Tarea creada exitosamente:', doc.$id);

    console.log('2. Actualizando tarea a Aprobada...');
    const docActualizado = await db.updateDocument(
      DATABASE_ID,
      'tareas',
      testId,
      {
        estado: 'Aprobada',
        aprobado_por: 'Supervisor Marcos Vera',
        fecha_aprobacion: new Date().toISOString()
      }
    );
    console.log('✔ Tarea aprobada exitosamente:', docActualizado.estado, docActualizado.aprobado_por);

    console.log('3. Limpiando tarea de prueba...');
    await db.deleteDocument(DATABASE_ID, 'tareas', testId);
    console.log('✔ Tarea de prueba eliminada');

    console.log('🎉 FASE 2 VERIFICADA AL 100% EN BACKEND Y APPWRITE');
  } catch (err) {
    console.error('❌ Error en prueba de Fase 2:', err);
    process.exit(1);
  }
}

testFase2();
