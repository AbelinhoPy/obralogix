require('dotenv').config({ path: '.env.local' });
const { Client, Databases, Permission, Role } = require('node-appwrite');

async function setupTareas() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  console.log('Iniciando creación de colección tareas...');

  try {
    await db.createCollection(
      dbId,
      'tareas',
      'tareas',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    console.log('Colección tareas creada');
  } catch (e) {
    console.log('Colección tareas ya existe o error:', e.message);
  }

  // Atributos
  const attrs = [
    { type: 'string', key: 'obra_id', size: 255, required: true },
    { type: 'string', key: 'trabajador_id', size: 255, required: true },
    { type: 'string', key: 'descripcion', size: 500, required: true },
    { type: 'string', key: 'fecha', size: 50, required: true },
    { type: 'string', key: 'estado', size: 50, required: false, default: 'Pendiente' },
    { type: 'string', key: 'fotos', size: 2000, required: false, array: true },
    { type: 'string', key: 'comentario_trabajador', size: 1000, required: false },
    { type: 'string', key: 'comentario_supervisor', size: 1000, required: false },
    { type: 'string', key: 'aprobado_por', size: 255, required: false },
    { type: 'string', key: 'fecha_aprobacion', size: 50, required: false },
    { type: 'integer', key: 'porcentaje_avance_asociado', required: false, min: 0, max: 100, default: 0 },
    { type: 'string', key: 'herramienta_usada', size: 255, required: false },
    { type: 'boolean', key: 'epp_verificado', required: false, default: false }
  ];

  for (const a of attrs) {
    try {
      if (a.type === 'string') {
        await db.createStringAttribute({
          databaseId: dbId,
          collectionId: 'tareas',
          key: a.key,
          size: a.size,
          required: a.required,
          default: a.default,
          array: a.array || false
        });
      } else if (a.type === 'integer') {
        await db.createIntegerAttribute({
          databaseId: dbId,
          collectionId: 'tareas',
          key: a.key,
          required: a.required,
          min: a.min,
          max: a.max,
          default: a.default
        });
      } else if (a.type === 'boolean') {
        await db.createBooleanAttribute({
          databaseId: dbId,
          collectionId: 'tareas',
          key: a.key,
          required: a.required,
          default: a.default
        });
      }
      console.log('Atributo creado:', a.key);
    } catch (err) {
      console.log('Atributo', a.key, ':', err.message);
    }
  }

  console.log('Tareas configurado exitosamente en Appwrite!');
}

setupTareas().catch(console.error);
