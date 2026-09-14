require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

async function fixAttributes() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  console.log('Iniciando creación de atributos faltantes...');

  // 1. obras
  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'obras', key: 'progreso', required: false, min: 0, max: 100, default: 0 });
    console.log('✅ obras.progreso creado');
  } catch (e) { console.log('obras.progreso:', e.message); }

  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'obras', key: 'presupuesto_pyg', required: false, default: 0 });
    console.log('✅ obras.presupuesto_pyg creado');
  } catch (e) { console.log('obras.presupuesto_pyg:', e.message); }

  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'obras', key: 'costo_ejecutado_pyg', required: false, default: 0 });
    console.log('✅ obras.costo_ejecutado_pyg creado');
  } catch (e) { console.log('obras.costo_ejecutado_pyg:', e.message); }

  // 2. trabajadores
  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'trabajadores', key: 'diaria_pyg', required: false, default: 150000 });
    console.log('✅ trabajadores.diaria_pyg creado');
  } catch (e) { console.log('trabajadores.diaria_pyg:', e.message); }

  try {
    await db.createStringAttribute({ databaseId: dbId, collectionId: 'trabajadores', key: 'email', size: 255, required: false });
    console.log('✅ trabajadores.email creado');
  } catch (e) { console.log('trabajadores.email:', e.message); }

  try {
    await db.createStringAttribute({ databaseId: dbId, collectionId: 'trabajadores', key: 'rol', size: 50, required: false, default: 'operario' });
    console.log('✅ trabajadores.rol creado');
  } catch (e) { console.log('trabajadores.rol:', e.message); }

  try {
    await db.createStringAttribute({ databaseId: dbId, collectionId: 'trabajadores', key: 'supervisor_id', size: 255, required: false });
    console.log('✅ trabajadores.supervisor_id creado');
  } catch (e) { console.log('trabajadores.supervisor_id:', e.message); }

  // 3. asistencias_diarias
  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'asistencias_diarias', key: 'horas_extra', required: false, default: 0 });
    console.log('✅ asistencias_diarias.horas_extra creado');
  } catch (e) { console.log('asistencias_diarias.horas_extra:', e.message); }

  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'asistencias_diarias', key: 'vale_pyg', required: false, default: 0 });
    console.log('✅ asistencias_diarias.vale_pyg creado');
  } catch (e) { console.log('asistencias_diarias.vale_pyg:', e.message); }

  // 4. bitacoras
  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'bitacoras', key: 'personal_presente', required: false, default: 1 });
    console.log('✅ bitacoras.personal_presente creado');
  } catch (e) { console.log('bitacoras.personal_presente:', e.message); }

  try {
    await db.createStringAttribute({ databaseId: dbId, collectionId: 'bitacoras', key: 'fotos', size: 1000, required: false, array: true });
    console.log('✅ bitacoras.fotos (array) creado');
  } catch (e) { console.log('bitacoras.fotos:', e.message); }

  // 5. tableros_electricos
  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'tableros_electricos', key: 'progreso', required: false, min: 0, max: 100, default: 0 });
    console.log('✅ tableros_electricos.progreso creado');
  } catch (e) { console.log('tableros_electricos.progreso:', e.message); }

  try {
    await db.createStringAttribute({ databaseId: dbId, collectionId: 'tableros_electricos', key: 'materiales', size: 1000, required: false, array: true });
    console.log('✅ tableros_electricos.materiales creado');
  } catch (e) { console.log('tableros_electricos.materiales:', e.message); }

  // 6. suscripciones_pagos
  try {
    await db.createIntegerAttribute({ databaseId: dbId, collectionId: 'suscripciones_pagos', key: 'monto_pyg', required: false, default: 0 });
    console.log('✅ suscripciones_pagos.monto_pyg creado');
  } catch (e) { console.log('suscripciones_pagos.monto_pyg:', e.message); }

  console.log('✨ Todos los atributos procesados.');
}

fixAttributes().catch(console.error);
