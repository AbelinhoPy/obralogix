import { databases, DATABASE_ID, COLLECTIONS, Query } from './appwrite';
import { Empresa, Obra, Trabajador, Herramienta, TableroElectrico, BitacoraRegistro, RegistroDiaria, Tarea } from './data';

// Cargar datos de una empresa desde Appwrite
export async function cargarDatosEmpresa(empresaId: string) {
  try {
    // Cargar obras
    const { documents: obras } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.OBRAS,
      [Query.equal('empresa_id', empresaId), Query.limit(100)]
    );

    // Cargar trabajadores
    const { documents: trabajadores } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRABAJADORES,
      [Query.equal('empresa_id', empresaId), Query.limit(100)]
    );

    // Cargar herramientas
    const { documents: herramientas } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.HERRAMIENTAS,
      [Query.equal('empresa_id', empresaId), Query.limit(100)]
    );

    // Cargar tableros
    const { documents: tableros } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TABLEROS_ELECTRICOS,
      [Query.equal('empresa_id', empresaId), Query.limit(100)]
    );

    // Cargar bitácoras de TODAS las obras de la empresa
    const obraIds = obras.map(o => o.$id);
    let bitacorasDocs: any[] = [];
    if (obraIds.length > 0) {
      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BITACORAS,
        [Query.equal('obra_id', obraIds), Query.limit(150)]
      );
      bitacorasDocs = documents;
    }

    // Cargar asistencias diarias de TODOS los trabajadores de la empresa
    const trabajadorIds = trabajadores.map(t => t.$id);
    let diariasDocs: any[] = [];
    if (trabajadorIds.length > 0) {
      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ASISTENCIAS_DIARIAS,
        [Query.equal('trabajador_id', trabajadorIds), Query.limit(300)]
      );
      diariasDocs = documents;
    }

    // Cargar tareas de las obras de la empresa
    let tareasDocs: any[] = [];
    if (obraIds.length > 0) {
      try {
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TAREAS,
          [Query.equal('obra_id', obraIds), Query.limit(200)]
        );
        tareasDocs = documents;
      } catch (tErr) {
        console.warn('Carga de tareas Appwrite:', tErr);
      }
    }

    return {
      success: true,
      obras: obras.map(obra => ({
        id: obra.$id,
        empresaId: obra.empresa_id,
        codigo: obra.codigo,
        nombre: obra.nombre,
        tipo: obra.tipo as any,
        cliente: obra.cliente,
        ubicacion: obra.ubicacion,
        fechaInicio: obra.fecha_inicio,
        fechaFinEstimada: obra.fecha_fin_estimada,
        responsable: obra.responsable,
        estado: obra.estado as any,
        progreso: Number(obra.progreso) || 0,
        presupuestoPYG: Number(obra.presupuesto_pyg) || 0,
        costoEjecutadoPYG: Number(obra.costo_ejecutado_pyg) || 0,
        trabajadoresAsignados: 0,
      })),
      trabajadores: trabajadores.map(trab => ({
        id: trab.$id,
        empresaId: trab.empresa_id,
        nombre: trab.nombre,
        documento: trab.documento || '',
        categoria: trab.categoria as any,
        diariaPYG: Number(trab.diaria_pyg) || 150000,
        telefono: trab.telefono || '',
        obraActualId: trab.obra_actual_id || '',
        activo: trab.activo ?? true,
        email: trab.email || '',
        rol: (trab.rol as any) || 'operario',
        supervisorId: trab.supervisor_id || undefined,
      })),
      herramientas: herramientas.map(her => ({
        id: her.$id,
        empresaId: her.empresa_id,
        codigoQR: her.codigo_qr,
        nombre: her.nombre,
        marca: her.marca,
        numeroSerie: her.numero_serie,
        categoria: her.categoria as any,
        estado: her.estado as any,
        asignadoA: her.asignado_a,
        obraAsignada: her.obra_asignada,
        fechaPrestamo: her.fecha_prestamo,
        fechaDevolucionEstimada: her.fecha_devolucion_estimada,
      })),
      tableros: tableros.map(tab => ({
        id: tab.$id,
        empresaId: tab.empresa_id,
        codigo: tab.codigo,
        nombre: tab.nombre,
        obraId: tab.obra_id || '',
        cliente: tab.cliente,
        tension: tab.tension,
        corrienteNominal: tab.corriente_nominal,
        gabineteTipo: tab.gabinete_tipo,
        faseActual: tab.fase_actual as any,
        progreso: Number(tab.progreso) || 0,
        responsable: tab.responsable,
        fechaEntregaObjetivo: tab.fecha_entrega_objetivo,
        materiales: Array.isArray(tab.materiales) ? tab.materiales : [],
      })),
      bitacoras: bitacorasDocs.map(bit => ({
        id: bit.$id,
        obraId: bit.obra_id,
        fecha: bit.fecha,
        clima: bit.clima as any,
        personalPresente: Number(bit.personal_presente) || 1,
        avanceDescripcion: bit.avance_descripcion,
        trabasNovedades: bit.trabas_novedades,
        responsable: bit.responsable,
        fotos: Array.isArray(bit.fotos) ? bit.fotos : [],
      })),
      diarias: diariasDocs.map(dia => ({
        id: dia.$id,
        fecha: dia.fecha,
        trabajadorId: dia.trabajador_id,
        obraId: dia.obra_id,
        estadoAsistencia: dia.estado_asistencia as any,
        horasExtra: Number(dia.horas_extra) || 0,
        valePYG: Number(dia.vale_pyg) || 0,
        observaciones: dia.observaciones || '',
      })),
      tareas: tareasDocs.map(tar => ({
        id: tar.$id,
        obraId: tar.obra_id,
        trabajadorId: tar.trabajador_id,
        descripcion: tar.descripcion,
        fecha: tar.fecha,
        estado: tar.estado as any,
        fotos: Array.isArray(tar.fotos) ? tar.fotos : (typeof tar.fotos === 'string' && tar.fotos ? [tar.fotos] : []),
        comentarioTrabajador: tar.comentario_trabajador || '',
        comentarioSupervisor: tar.comentario_supervisor || '',
        aprobadoPor: tar.aprobado_por || '',
        fechaAprobacion: tar.fecha_aprobacion || '',
        porcentajeAvanceAsociado: Number(tar.porcentaje_avance_asociado) || 0,
        herramientaUsada: tar.herramienta_usada || '',
        eppVerificado: Boolean(tar.epp_verificado),
      })),
    };
  } catch (error) {
    console.error('Error al cargar datos de empresa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}