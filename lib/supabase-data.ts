import { supabase } from './supabase';
import { Empresa, Obra, Trabajador, Herramienta, TableroElectrico, BitacoraRegistro, RegistroDiaria } from './data';

// Cargar datos de una empresa desde Supabase
export async function cargarDatosEmpresa(empresaId: string) {
  try {
    // Cargar obras
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('*')
      .eq('empresa_id', empresaId);

    if (obrasError) throw obrasError;

    // Cargar trabajadores
    const { data: trabajadores, error: trabajadoresError } = await supabase
      .from('trabajadores')
      .select('*')
      .eq('empresa_id', empresaId);

    if (trabajadoresError) throw trabajadoresError;

    // Cargar herramientas
    const { data: herramientas, error: herramientasError } = await supabase
      .from('herramientas')
      .select('*')
      .eq('empresa_id', empresaId);

    if (herramientasError) throw herramientasError;

    // Cargar tableros
    const { data: tableros, error: tablerosError } = await supabase
      .from('tableros_electricos')
      .select('*')
      .eq('empresa_id', empresaId);

    if (tablerosError) throw tablerosError;

    // Cargar bitácoras
    const { data: bitacoras, error: bitacorasError } = await supabase
      .from('bitacoras')
      .select('*')
      .in('obra_id', obras?.map(o => o.id) || []);

    if (bitacorasError) throw bitacorasError;

    // Cargar asistencias diarias
    const { data: diarias, error: diariasError } = await supabase
      .from('asistencias_diarias')
      .select('*')
      .in('trabajador_id', trabajadores?.map(t => t.id) || []);

    if (diariasError) throw diariasError;

    return {
      success: true,
      obras: obras || [],
      trabajadores: trabajadores || [],
      herramientas: herramientas || [],
      tableros: tableros || [],
      bitacoras: bitacoras || [],
      diarias: diarias || [],
    };
  } catch (error) {
    console.error('Error al cargar datos de empresa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Funciones para agregar datos a Supabase
export async function agregarObraSupabase(obra: Omit<Obra, "id">, empresaId: string) {
  try {
    const { data, error } = await supabase
      .from('obras')
      .insert({
        empresa_id: empresaId,
        codigo: obra.codigo,
        nombre: obra.nombre,
        tipo: obra.tipo,
        cliente: obra.cliente,
        ubicacion: obra.ubicacion,
        fecha_inicio: obra.fechaInicio,
        fecha_fin_estimada: obra.fechaFinEstimada,
        responsable: obra.responsable,
        estado: obra.estado,
        progreso: obra.progreso,
        presupuesto_pyg: obra.presupuestoPYG,
        costo_ejecutado_pyg: obra.costoEjecutadoPYG,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error al agregar obra:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function agregarTrabajadorSupabase(trabajador: Omit<Trabajador, "id">, empresaId: string) {
  try {
    const { data, error } = await supabase
      .from('trabajadores')
      .insert({
        empresa_id: empresaId,
        nombre: trabajador.nombre,
        documento: trabajador.documento,
        categoria: trabajador.categoria,
        diaria_pyg: trabajador.diariaPYG,
        telefono: trabajador.telefono,
        obra_actual_id: trabajador.obraActualId,
        activo: trabajador.activo,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error al agregar trabajador:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function agregarHerramientaSupabase(herramienta: Omit<Herramienta, "id">, empresaId: string) {
  try {
    const { data, error } = await supabase
      .from('herramientas')
      .insert({
        empresa_id: empresaId,
        codigo_qr: herramienta.codigoQR,
        nombre: herramienta.nombre,
        marca: herramienta.marca,
        numero_serie: herramienta.numeroSerie,
        categoria: herramienta.categoria,
        estado: herramienta.estado,
        asignado_a: herramienta.asignadoA,
        obra_asignada: herramienta.obraAsignada,
        fecha_prestamo: herramienta.fechaPrestamo,
        fecha_devolucion_estimada: herramienta.fechaDevolucionEstimada,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error al agregar herramienta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function registrarAsistenciaSupabase(registro: Omit<RegistroDiaria, "id">) {
  try {
    const { data, error } = await supabase
      .from('asistencias_diarias')
      .insert({
        fecha: registro.fecha,
        trabajador_id: registro.trabajadorId,
        obra_id: registro.obraId,
        estado_asistencia: registro.estadoAsistencia,
        horas_extra: registro.horasExtra,
        vale_pyg: registro.valePYG,
        observaciones: registro.observaciones,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function agregarBitacoraSupabase(entrada: Omit<BitacoraRegistro, "id">) {
  try {
    const { data, error } = await supabase
      .from('bitacoras')
      .insert({
        obra_id: entrada.obraId,
        fecha: entrada.fecha,
        clima: entrada.clima,
        personal_presente: entrada.personalPresente,
        avance_descripcion: entrada.avanceDescripcion,
        trabas_novedades: entrada.trabasNovedades,
        responsable: entrada.responsable,
        fotos: entrada.fotos,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error al agregar bitácora:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}