import { create } from "zustand";
import {
  Empresa,
  Obra,
  Trabajador,
  Herramienta,
  TableroElectrico,
  BitacoraRegistro,
  RegistroDiaria,
  EMPRESAS_INICIALES,
  OBRAS_INICIALES,
  TRABAJADORES_INICIALES,
  HERRAMIENTAS_INICIALES,
  TABLEROS_INICIALES,
  BITACORA_INICIAL
} from "./data";
import { cargarDatosEmpresa } from "./supabase-data";

interface ObraStoreState {
  empresaActual: Empresa;
  empresas: Empresa[];
  obras: Obra[];
  trabajadores: Trabajador[];
  herramientas: Herramienta[];
  tableros: TableroElectrico[];
  bitacoras: BitacoraRegistro[];
  diarias: RegistroDiaria[];
  usuarioAutenticado: any;
  isLoading: boolean;

  // Acciones
  setEmpresaActual: (empresaId: string) => void;
  setUsuarioAutenticado: (usuario: any) => void;
  cargarDatosDesdeSupabase: (empresaId: string) => Promise<void>;
  agregarObra: (obra: Omit<Obra, "id">) => void;
  actualizarProgresoObra: (obraId: string, progreso: number) => void;
  
  // Personal & Diarias
  agregarTrabajador: (trabajador: Omit<Trabajador, "id">) => void;
  registrarAsistencia: (registro: Omit<RegistroDiaria, "id">) => void;
  
  // Herramientas
  asignarHerramienta: (herramientaId: string, funcionario: string, obra: string, fechaEstimada: string) => void;
  devolverHerramienta: (herramientaId: string) => void;
  
  // Tableros
  actualizarFaseTablero: (tableroId: string, fase: TableroElectrico["faseActual"], progreso: number) => void;
  
  // Bitácora
  agregarEntradaBitacora: (entrada: Omit<BitacoraRegistro, "id">) => void;
}

export const useObraStore = create<ObraStoreState>((set) => ({
  empresaActual: EMPRESAS_INICIALES[0],
  empresas: EMPRESAS_INICIALES,
  obras: OBRAS_INICIALES,
  trabajadores: TRABAJADORES_INICIALES,
  herramientas: HERRAMIENTAS_INICIALES,
  tableros: TABLEROS_INICIALES,
  bitacoras: BITACORA_INICIAL,
  diarias: [
    {
      id: "dia-1",
      fecha: "2026-09-05",
      trabajadorId: "tr-1",
      obraId: "obr-1",
      estadoAsistencia: "Presente",
      horasExtra: 2,
      valePYG: 50000,
      observaciones: "Armado de barras de cobre TGBT"
    },
    {
      id: "dia-2",
      fecha: "2026-09-05",
      trabajadorId: "tr-2",
      obraId: "obr-1",
      estadoAsistencia: "Presente",
      horasExtra: 0,
      valePYG: 0,
      observaciones: "Tendido de bandejas"
    },
    {
      id: "dia-3",
      fecha: "2026-09-05",
      trabajadorId: "tr-3",
      obraId: "obr-1",
      estadoAsistencia: "Presente",
      horasExtra: 1,
      valePYG: 30000,
      observaciones: "Ayudante general"
    }
  ],
  usuarioAutenticado: null,
  isLoading: false,

  setEmpresaActual: (empresaId) =>
    set((state) => ({
      empresaActual: state.empresas.find((e) => e.id === empresaId) || state.empresaActual
    })),

  setUsuarioAutenticado: (usuario) =>
    set({ usuarioAutenticado: usuario }),

  cargarDatosDesdeSupabase: async (empresaId) => {
    set({ isLoading: true });
    try {
      const resultado = await cargarDatosEmpresa(empresaId);
      if (resultado.success) {
        set({
          obras: resultado.obras.map(obra => ({
            id: obra.id,
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
            progreso: obra.progreso,
            presupuestoPYG: obra.presupuesto_pyg,
            costoEjecutadoPYG: obra.costo_ejecutado_pyg,
            trabajadoresAsignados: 0, // Se puede calcular
          })),
          trabajadores: resultado.trabajadores.map(trab => ({
            id: trab.id,
            empresaId: trab.empresa_id,
            nombre: trab.nombre,
            documento: trab.documento,
            categoria: trab.categoria as any,
            diariaPYG: trab.diaria_pyg,
            telefono: trab.telefono,
            obraActualId: trab.obra_actual_id || '',
            activo: trab.activo,
          })),
          herramientas: resultado.herramientas.map(her => ({
            id: her.id,
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
          tableros: resultado.tableros.map(tab => ({
            id: tab.id,
            empresaId: tab.empresa_id,
            codigo: tab.codigo,
            nombre: tab.nombre,
            obraId: tab.obra_id || '',
            cliente: tab.cliente,
            tension: tab.tension,
            corrienteNominal: tab.corriente_nominal,
            gabineteTipo: tab.gabinete_tipo,
            faseActual: tab.fase_actual as any,
            progreso: tab.progreso,
            responsable: tab.responsable,
            fechaEntregaObjetivo: tab.fecha_entrega_objetivo,
            materiales: tab.materiales as any,
          })),
          bitacoras: resultado.bitacoras.map(bit => ({
            id: bit.id,
            obraId: bit.obra_id,
            fecha: bit.fecha,
            clima: bit.clima as any,
            personalPresente: bit.personal_presente,
            avanceDescripcion: bit.avance_descripcion,
            trabasNovedades: bit.trabas_novedades,
            responsable: bit.responsable,
            fotos: bit.fotos as any,
          })),
          diarias: resultado.diarias.map(dia => ({
            id: dia.id,
            fecha: dia.fecha,
            trabajadorId: dia.trabajador_id,
            obraId: dia.obra_id,
            estadoAsistencia: dia.estado_asistencia as any,
            horasExtra: dia.horas_extra,
            valePYG: dia.vale_pyg,
            observaciones: dia.observaciones,
          })),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error cargando datos desde Supabase:', error);
      set({ isLoading: false });
    }
  },

  agregarObra: (nueva) =>
    set((state) => ({
      obras: [
        {
          ...nueva,
          id: `obr-${Date.now()}`
        },
        ...state.obras
      ]
    })),

  actualizarProgresoObra: (obraId, progreso) =>
    set((state) => ({
      obras: state.obras.map((o) => (o.id === obraId ? { ...o, progreso } : o))
    })),

  agregarTrabajador: (nuevo) =>
    set((state) => ({
      trabajadores: [
        ...state.trabajadores,
        {
          ...nuevo,
          id: `tr-${Date.now()}`
        }
      ]
    })),

  registrarAsistencia: (registro) =>
    set((state) => ({
      diarias: [
        ...state.diarias.filter(
          (d) => !(d.fecha === registro.fecha && d.trabajadorId === registro.trabajadorId)
        ),
        {
          ...registro,
          id: `dia-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
        }
      ]
    })),

  asignarHerramienta: (herramientaId, funcionario, obra, fechaEstimada) =>
    set((state) => ({
      herramientas: state.herramientas.map((h) =>
        h.id === herramientaId
          ? {
              ...h,
              estado: "En Obra / Asignada",
              asignadoA: funcionario,
              obraAsignada: obra,
              fechaPrestamo: new Date().toISOString().split("T")[0],
              fechaDevolucionEstimada: fechaEstimada
            }
          : h
      )
    })),

  devolverHerramienta: (herramientaId) =>
    set((state) => ({
      herramientas: state.herramientas.map((h) =>
        h.id === herramientaId
          ? {
              ...h,
              estado: "Disponible en Pañol",
              asignadoA: undefined,
              obraAsignada: undefined,
              fechaPrestamo: undefined,
              fechaDevolucionEstimada: undefined
            }
          : h
      )
    })),

  actualizarFaseTablero: (tableroId, fase, progreso) =>
    set((state) => ({
      tableros: state.tableros.map((t) =>
        t.id === tableroId ? { ...t, faseActual: fase, progreso } : t
      )
    })),

  agregarEntradaBitacora: (nueva) =>
    set((state) => ({
      bitacoras: [
        {
          ...nueva,
          id: `bit-${Date.now()}`
        },
        ...state.bitacoras
      ]
    }))
}));
