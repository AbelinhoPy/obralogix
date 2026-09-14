require('dotenv').config({ path: '.env.local' });
const { Client, Databases, ID, Query } = require('node-appwrite');

async function testPersistence() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  console.log('Iniciando prueba de persistencia real en Appwrite Cloud...');
  
  const testObraId = ID.unique();
  const obra = await db.createDocument(dbId, 'obras', testObraId, {
    empresa_id: 'emp-test-fase1',
    codigo: 'OBR-TEST',
    nombre: 'Obra de Prueba Persistencia Fase 1',
    tipo: 'electrico',
    cliente: 'Cliente Test S.A.',
    progreso: 25,
    presupuesto_pyg: 50000000,
    costo_ejecutado_pyg: 10000000
  });
  console.log('1. Obra creada con ID:', obra['$id']);

  const obraActualizada = await db.updateDocument(dbId, 'obras', testObraId, {
    progreso: 85
  });
  console.log('2. Progreso actualizado en BD a:', obraActualizada.progreso + '%');

  const { documents } = await db.listDocuments(dbId, 'obras', [
    Query.equal('empresa_id', 'emp-test-fase1'),
    Query.limit(10)
  ]);
  
  const encontrada = documents.find(d => d['$id'] === testObraId);
  if (encontrada && encontrada.progreso === 85 && encontrada.nombre === 'Obra de Prueba Persistencia Fase 1') {
    console.log('3. [CONFIRMADO] Los datos sobrevivieron a la consulta simulada de refresh!');
  } else {
    throw new Error('Error en persistencia');
  }

  const testDiaId = ID.unique();
  const diaria = await db.createDocument(dbId, 'asistencias_diarias', testDiaId, {
    fecha: new Date().toISOString(),
    trabajador_id: 'tr-test-fase1',
    obra_id: testObraId,
    estado_asistencia: 'Presente',
    horas_extra: 3,
    vale_pyg: 50000,
    observaciones: 'Prueba de horas extra y vale'
  });
  console.log('4. Asistencia diaria creada con ID:', diaria['$id'], 'Vale:', diaria.vale_pyg);

  const resDiarias = await db.listDocuments(dbId, 'asistencias_diarias', [
    Query.equal('trabajador_id', ['tr-test-fase1']),
    Query.limit(10)
  ]);
  if (resDiarias.documents.length > 0 && resDiarias.documents[0].vale_pyg === 50000) {
    console.log('5. [CONFIRMADO] La asistencia y vale sobrevivieron a la recarga!');
  }

  await db.deleteDocument(dbId, 'asistencias_diarias', testDiaId);
  await db.deleteDocument(dbId, 'obras', testObraId);
  console.log('6. Registros de prueba limpiados correctamente.');
  console.log('PRUEBA DE PERSISTENCIA EXITOSA');
}

testPersistence().catch(err => {
  console.error('Error en prueba:', err.message);
  process.exit(1);
});
