import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Empresa,
  Obra,
  Trabajador,
  Herramienta,
  TableroElectrico,
  BitacoraRegistro,
  RegistroDiaria,
  RolUsuario,
  Tarea,
  EMPRESAS_INICIALES,
  OBRAS_INICIALES,
  TRABAJADORES_INICIALES,
  HERRAMIENTAS_INICIALES,
  TABLEROS_INICIALES,
  BITACORA_INICIAL,
  TAREAS_INICIALES,
  DIARIAS_INICIALES
} from "./data";
import { cargarDatosEmpresa } from "./appwrite-data";
import { databases, DATABASE_ID, COLLECTIONS, generateId } from "./appwrite";

interface ObraStoreState {
  empresaActual: Empresa;
  empresas: Empresa[];
  obras: Obra[];
  trabajadores: Trabajador[];
  herramientas: Herramienta[];
  tableros: TableroElectrico[];
  bitacoras: BitacoraRegistro[];
  diarias: RegistroDiaria[];
  tareas: Tarea[];
  usuarioAutenticado: any;
  rolActual: RolUsuario;
  isLoading: boolean;

  // Acciones
  setEmpresaActual: (empresaId: string) => void;
  setUsuarioAutenticado: (usuario: any) => void;
  setRolActual: (rol: RolUsuario) => void;
  cargarDatosDesdeSupabase: (empresaId: string) => Promise<void>;
  cargarDatosDesdeAppwrite: (empresaId: string) => Promise<void>;
  agregarObra: (obra: Omit<Obra, "id">) => void;
  actualizarProgresoObra: (obraId: string, progreso: number) => void;
  
  // Personal & Diarias
  agregarTrabajador: (trabajador: Omit<Trabajador, "id">) => void;
  registrarAsistencia: (registro: Omit<RegistroDiaria, "id">) => void;
  
  // Herramientas
  agregarHerramienta: (herramienta: Omit<Herramienta, "id">) => void;
  asignarHerramienta: (herramientaId: string, funcionario: string, obra: string, fechaEstimada: string) => void;
  devolverHerramienta: (herramientaId: string) => void;
  
  // Tableros
  actualizarFaseTablero: (tableroId: string, fase: TableroElectrico["faseActual"], progreso: number) => void;
  
  // Bitácora
  agregarEntradaBitacora: (entrada: Omit<BitacoraRegistro, "id">) => void;

  // Fase 2: Tareas y Portal del Trabajador
  asignarTarea: (tarea: Omit<Tarea, "id">) => void;
  reportarTarea: (tareaId: string, fotos: string[], comentario?: string, herramientaUsada?: string, eppVerificado?: boolean) => void;
  reportarProblemaTarea: (tareaId: string, descripcion: string, fotos?: string[]) => void;
  aprobarTarea: (tareaId: string, supervisorNombre: string) => void;
  rechazarTarea: (tareaId: string, comentario: string) => void;
  activarDiaLluvia: (obraId: string, politicaPago: "sin_pago" | "medio_dia" | "completo") => void;
}


export const useObraStore = create<ObraStoreState>()(
  persist(
    (set, get) => ({
      empresaActual: EMPRESAS_INICIALES[0],
      empresas: EMPRESAS_INICIALES,
      obras: OBRAS_INICIALES,
      trabajadores: TRABAJADORES_INICIALES,
      herramientas: HERRAMIENTAS_INICIALES,
      tableros: TABLEROS_INICIALES,
      bitacoras: BITACORA_INICIAL,
      tareas: TAREAS_INICIALES,
      diarias: DIARIAS_INICIALES,
      usuarioAutenticado: null,
      rolActual: "admin",
      isLoading: false,

      setEmpresaActual: (empresaId) =>
        set((state) => ({
          empresaActual: state.empresas.find((e) => e.id === empresaId) || state.empresaActual
        })),

      setUsuarioAutenticado: (usuario) =>
        set({ 
          usuarioAutenticado: usuario,
          rolActual: (usuario?.rol as RolUsuario) || "admin"
        }),

      setRolActual: (rol) => set({ rolActual: rol }),

      cargarDatosDesdeSupabase: async (empresaId) => {
        return get().cargarDatosDesdeAppwrite(empresaId);
      },

      cargarDatosDesdeAppwrite: async (empresaId) => {
        set({ isLoading: true });
        try {
          const resultado = await cargarDatosEmpresa(empresaId);
          if (resultado.success && resultado.obras && resultado.trabajadores && resultado.herramientas && resultado.tableros && resultado.bitacoras && resultado.diarias) {
            set({
              obras: resultado.obras,
              trabajadores: resultado.trabajadores,
              herramientas: resultado.herramientas,
              tableros: resultado.tableros,
              bitacoras: resultado.bitacoras,
              diarias: resultado.diarias,
              ...(resultado.tareas && resultado.tareas.length > 0 ? { tareas: resultado.tareas } : {}),
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error cargando datos desde Appwrite:', error);
          set({ isLoading: false });
        }
      },

      agregarObra: (nueva) => {
        const id = generateId();
        set((state) => ({
          obras: [{ ...nueva, id }, ...state.obras]
        }));
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.OBRAS,
          id,
          {
            empresa_id: nueva.empresaId,
            codigo: nueva.codigo,
            nombre: nueva.nombre,
            tipo: nueva.tipo,
            cliente: nueva.cliente,
            ubicacion: nueva.ubicacion || '',
            fecha_inicio: nueva.fechaInicio ? new Date(nueva.fechaInicio).toISOString() : new Date().toISOString(),
            fecha_fin_estimada: nueva.fechaFinEstimada ? new Date(nueva.fechaFinEstimada).toISOString() : new Date().toISOString(),
            responsable: nueva.responsable || '',
            estado: nueva.estado,
            progreso: Number(nueva.progreso) || 0,
            presupuesto_pyg: Number(nueva.presupuestoPYG) || 0,
            costo_ejecutado_pyg: Number(nueva.costoEjecutadoPYG) || 0,
          }
        ).catch((err) => console.warn('Appwrite sync (agregarObra):', err.message));
      },

      actualizarProgresoObra: (obraId, progreso) => {
        set((state) => ({
          obras: state.obras.map((o) => (o.id === obraId ? { ...o, progreso } : o))
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.OBRAS,
          obraId,
          { progreso: Number(progreso) }
        ).catch((err) => console.warn('Appwrite sync (actualizarProgresoObra):', err.message));
      },

      agregarTrabajador: (nuevo) => {
        const id = generateId();
        set((state) => ({
          trabajadores: [{ ...nuevo, id }, ...state.trabajadores]
        }));
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TRABAJADORES,
          id,
          {
            empresa_id: nuevo.empresaId,
            nombre: nuevo.nombre,
            documento: nuevo.documento || '',
            categoria: nuevo.categoria,
            diaria_pyg: Number(nuevo.diariaPYG) || 150000,
            telefono: nuevo.telefono || '',
            obra_actual_id: nuevo.obraActualId || '',
            activo: nuevo.activo ?? true,
          }
        ).catch((err) => console.warn('Appwrite sync (agregarTrabajador):', err.message));
      },

      registrarAsistencia: (registro) => {
        const id = generateId();
        set((state) => ({
          diarias: [
            ...state.diarias.filter(
              (d) => !(d.fecha === registro.fecha && d.trabajadorId === registro.trabajadorId)
            ),
            { ...registro, id }
          ]
        }));
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ASISTENCIAS_DIARIAS,
          id,
          {
            fecha: registro.fecha ? new Date(registro.fecha).toISOString() : new Date().toISOString(),
            trabajador_id: registro.trabajadorId,
            obra_id: registro.obraId,
            estado_asistencia: registro.estadoAsistencia,
            horas_extra: Number(registro.horasExtra) || 0,
            vale_pyg: Number(registro.valePYG) || 0,
            observaciones: registro.observaciones || '',
          }
        ).catch((err) => console.warn('Appwrite sync (registrarAsistencia):', err.message));
      },

      agregarHerramienta: (nueva) => {
        const id = generateId();
        const nuevaHerramienta: Herramienta = { ...nueva, id };
        set((state) => ({
          herramientas: [nuevaHerramienta, ...state.herramientas]
        }));
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.HERRAMIENTAS,
          id,
          {
            empresa_id: nueva.empresaId,
            codigo_qr: nueva.codigoQR,
            nombre: nueva.nombre,
            marca: nueva.marca || '',
            numero_serie: nueva.numeroSerie || '',
            categoria: nueva.categoria || 'Electromecánica',
            estado: nueva.estado || 'Disponible en Pañol',
            asignado_a: nueva.asignadoA || null,
            obra_asignada: nueva.obraAsignada || null,
          }
        ).catch((err) => console.warn('Appwrite sync (agregarHerramienta):', err.message));
      },

      asignarHerramienta: (herramientaId, funcionario, obra, fechaEstimada) => {
        const fechaPrestamo = new Date().toISOString().split("T")[0];
        set((state) => ({
          herramientas: state.herramientas.map((h) =>
            h.id === herramientaId
              ? {
                  ...h,
                  estado: "En Obra / Asignada",
                  asignadoA: funcionario,
                  obraAsignada: obra,
                  fechaPrestamo,
                  fechaDevolucionEstimada: fechaEstimada
                }
              : h
          )
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.HERRAMIENTAS,
          herramientaId,
          {
            estado: "En Obra / Asignada",
            asignado_a: funcionario,
            obra_asignada: obra,
            fecha_prestamo: new Date().toISOString(),
            fecha_devolucion_estimada: fechaEstimada ? new Date(fechaEstimada).toISOString() : new Date().toISOString()
          }
        ).catch((err) => console.warn('Appwrite sync (asignarHerramienta):', err.message));
      },

      devolverHerramienta: (herramientaId) => {
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
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.HERRAMIENTAS,
          herramientaId,
          {
            estado: "Disponible en Pañol",
            asignado_a: null,
            obra_asignada: null,
            fecha_prestamo: null,
            fecha_devolucion_estimada: null
          }
        ).catch((err) => console.warn('Appwrite sync (devolverHerramienta):', err.message));
      },

      actualizarFaseTablero: (tableroId, fase, progreso) => {
        set((state) => ({
          tableros: state.tableros.map((t) =>
            t.id === tableroId ? { ...t, faseActual: fase, progreso } : t
          )
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TABLEROS_ELECTRICOS,
          tableroId,
          {
            fase_actual: fase,
            progreso: Number(progreso)
          }
        ).catch((err) => console.warn('Appwrite sync (actualizarFaseTablero):', err.message));
      },

      agregarEntradaBitacora: (nueva) => {
        const id = generateId();
        set((state) => ({
          bitacoras: [{ ...nueva, id }, ...state.bitacoras]
        }));
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.BITACORAS,
          id,
          {
            obra_id: nueva.obraId,
            fecha: nueva.fecha ? new Date(nueva.fecha).toISOString() : new Date().toISOString(),
            clima: nueva.clima,
            personal_presente: Number(nueva.personalPresente) || 1,
            avance_descripcion: nueva.avanceDescripcion,
            trabas_novedades: nueva.trabasNovedades || '',
            responsable: nueva.responsable || '',
            fotos: Array.isArray(nueva.fotos) ? nueva.fotos : []
          }
        ).catch((err) => console.warn('Appwrite sync (agregarEntradaBitacora):', err.message));
      },

      // FASE 2: Métodos de Tareas y Portal del Trabajador
      asignarTarea: (tarea) => {
        const id = generateId();
        const nuevaTarea: Tarea = {
          ...tarea,
          id,
          fecha: tarea.fecha || new Date().toISOString().split("T")[0],
          estado: tarea.estado || "Pendiente",
          porcentajeAvanceAsociado: Number(tarea.porcentajeAvanceAsociado) || 0,
        };
        set((state) => ({
          tareas: [nuevaTarea, ...state.tareas]
        }));
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TAREAS,
          id,
          {
            obra_id: nuevaTarea.obraId,
            trabajador_id: nuevaTarea.trabajadorId,
            descripcion: nuevaTarea.descripcion,
            fecha: nuevaTarea.fecha,
            estado: nuevaTarea.estado,
            fotos: Array.isArray(nuevaTarea.fotos) ? nuevaTarea.fotos : [],
            comentario_trabajador: nuevaTarea.comentarioTrabajador || "",
            comentario_supervisor: nuevaTarea.comentarioSupervisor || "",
            aprobado_por: nuevaTarea.aprobadoPor || "",
            fecha_aprobacion: nuevaTarea.fechaAprobacion || "",
            porcentaje_avance_asociado: nuevaTarea.porcentajeAvanceAsociado,
            herramienta_usada: nuevaTarea.herramientaUsada || "",
            epp_verificado: Boolean(nuevaTarea.eppVerificado),
          }
        ).catch((err) => console.warn('Appwrite sync (asignarTarea):', err.message));
      },

      reportarTarea: (tareaId, fotos, comentario, herramientaUsada, eppVerificado) => {
        set((state) => ({
          tareas: state.tareas.map((t) =>
            t.id === tareaId
              ? {
                  ...t,
                  estado: "Reportada",
                  fotos: fotos && fotos.length > 0 ? fotos : t.fotos,
                  comentarioTrabajador: comentario || t.comentarioTrabajador,
                  herramientaUsada: herramientaUsada || t.herramientaUsada,
                  eppVerificado: eppVerificado ?? t.eppVerificado,
                }
              : t
          )
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TAREAS,
          tareaId,
          {
            estado: "Reportada",
            fotos: Array.isArray(fotos) ? fotos : [],
            comentario_trabajador: comentario || "",
            herramienta_usada: herramientaUsada || "",
            epp_verificado: Boolean(eppVerificado),
          }
        ).catch((err) => console.warn('Appwrite sync (reportarTarea):', err.message));
      },

      reportarProblemaTarea: (tareaId, descripcion, fotos) => {
        set((state) => ({
          tareas: state.tareas.map((t) =>
            t.id === tareaId
              ? {
                  ...t,
                  estado: "Con Problema",
                  comentarioTrabajador: descripcion,
                  fotos: fotos && fotos.length > 0 ? fotos : t.fotos,
                }
              : t
          )
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TAREAS,
          tareaId,
          {
            estado: "Con Problema",
            comentario_trabajador: descripcion,
            fotos: Array.isArray(fotos) ? fotos : [],
          }
        ).catch((err) => console.warn('Appwrite sync (reportarProblemaTarea):', err.message));
      },

      aprobarTarea: (tareaId, supervisorNombre) => {
        const state = get();
        const tarea = state.tareas.find((t) => t.id === tareaId);
        if (!tarea) return;

        const fechaHoy = new Date().toISOString().split("T")[0];

        // 1. Marcar tarea como Aprobada
        set((s) => ({
          tareas: s.tareas.map((t) =>
            t.id === tareaId
              ? {
                  ...t,
                  estado: "Aprobada",
                  aprobadoPor: supervisorNombre,
                  fechaAprobacion: fechaHoy,
                }
              : t
          )
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TAREAS,
          tareaId,
          {
            estado: "Aprobada",
            aprobado_por: supervisorNombre,
            fecha_aprobacion: new Date().toISOString(),
          }
        ).catch((err) => console.warn('Appwrite sync (aprobarTarea):', err.message));

        // 2. Incrementar progreso de obra (REGLA CRÍTICA: solo tras aprobación)
        const obra = state.obras.find((o) => o.id === tarea.obraId);
        if (obra) {
          const incremento = Number(tarea.porcentajeAvanceAsociado) || 0;
          const nuevoProgreso = Math.min(100, (obra.progreso || 0) + incremento);
          get().actualizarProgresoObra(obra.id, nuevoProgreso);

          // 3. Crear registro en bitácora oficial de obra
          get().agregarEntradaBitacora({
            obraId: obra.id,
            fecha: fechaHoy,
            clima: "Soleado",
            personalPresente: 1,
            avanceDescripcion: `Tarea aprobada (+${incremento}%): ${tarea.descripcion}${tarea.comentarioTrabajador ? ` | Nota: ${tarea.comentarioTrabajador}` : ''}`,
            trabasNovedades: `Validado y aprobado en sitio por ${supervisorNombre}.`,
            responsable: supervisorNombre,
            fotos: Array.isArray(tarea.fotos) ? tarea.fotos : []
          });
        }
      },

      rechazarTarea: (tareaId, comentario) => {
        set((state) => ({
          tareas: state.tareas.map((t) =>
            t.id === tareaId
              ? {
                  ...t,
                  estado: "Rechazada",
                  comentarioSupervisor: comentario,
                }
              : t
          )
        }));
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TAREAS,
          tareaId,
          {
            estado: "Rechazada",
            comentario_supervisor: comentario,
          }
        ).catch((err) => console.warn('Appwrite sync (rechazarTarea):', err.message));
      },

      activarDiaLluvia: (obraId, politicaPago) => {
        const state = get();
        const obra = state.obras.find((o) => o.id === obraId);
        const fechaHoy = new Date().toISOString().split("T")[0];

        const estadoAsistencia =
          politicaPago === "completo"
            ? "Presente"
            : politicaPago === "medio_dia"
            ? "Medio Día"
            : "Ausente";

        const descPolitica =
          politicaPago === "completo"
            ? "Jornal Completo cubierto"
            : politicaPago === "medio_dia"
            ? "Medio Jornal por lluvia"
            : "Sin goce de jornal por lluvia";

        const cuadrilla = state.trabajadores.filter((t) => t.obraActualId === obraId && t.activo);

        cuadrilla.forEach((trab) => {
          get().registrarAsistencia({
            fecha: fechaHoy,
            trabajadorId: trab.id,
            obraId: obraId,
            estadoAsistencia,
            horasExtra: 0,
            valePYG: 0,
            observaciones: `Jornada suspendida por lluvia (${descPolitica})`
          });
        });

        get().agregarEntradaBitacora({
          obraId: obraId,
          fecha: fechaHoy,
          clima: "Lluvia",
          personalPresente: cuadrilla.length,
          avanceDescripcion: `Jornada suspendida por inclemencias del tiempo (Lluvia). Protocolo de pago: ${descPolitica}.`,
          trabasNovedades: "Paralización preventiva por seguridad y lluvias en la zona.",
          responsable: obra?.responsable || "Supervisor",
          fotos: []
        });
      },
    }),
    {
      name: "obralogix_prod_clean",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        empresaActual: state.empresaActual,
        empresas: state.empresas,
        obras: state.obras,
        trabajadores: state.trabajadores,
        herramientas: state.herramientas,
        tableros: state.tableros,
        bitacoras: state.bitacoras,
        diarias: state.diarias,
        tareas: state.tareas,
        usuarioAutenticado: state.usuarioAutenticado,
        rolActual: state.rolActual,
      }),
      merge: (persistedState: any, currentState: ObraStoreState) => {
        if (!persistedState) return currentState;
        return {
          ...currentState,
          ...persistedState,
          empresas: persistedState.empresas && persistedState.empresas.length > 0 
            ? persistedState.empresas 
            : currentState.empresas,
          empresaActual: persistedState.empresaActual || currentState.empresaActual,
          obras: persistedState.obras || currentState.obras,
          trabajadores: persistedState.trabajadores || currentState.trabajadores,
          herramientas: persistedState.herramientas || currentState.herramientas,
          tableros: persistedState.tableros || currentState.tableros,
          bitacoras: persistedState.bitacoras || currentState.bitacoras,
          tareas: persistedState.tareas || currentState.tareas,
          diarias: persistedState.diarias || currentState.diarias,
        };
      }
    }
  )
);
