export interface Empresa {
  id: string;
  nombre: string;
  tipo: "electrico" | "civil" | "mixto";
  ruc: string;
  moneda: string;
  contacto: string;
}

export interface Obra {
  id: string;
  empresaId: string;
  codigo: string;
  nombre: string;
  tipo: "civil" | "electrico" | "mixto";
  cliente: string;
  ubicacion: string;
  fechaInicio: string;
  fechaFinEstimada: string;
  responsable: string;
  estado: "En Ejecución" | "Planificada" | "Pausada" | "Finalizada";
  progreso: number; // 0 a 100
  presupuestoPYG: number;
  costoEjecutadoPYG: number;
  trabajadoresAsignados: number;
}

export type RolUsuario = "admin" | "supervisor" | "operario";

export interface Trabajador {
  id: string;
  empresaId: string;
  nombre: string;
  documento: string;
  categoria: "Oficial Albañil" | "Ayudante" | "Electricista Matriculado" | "Técnico Tablerista" | "Capataz" | "Soldador" | "Oficial Carpintero" | "Oficial Armador" | "Medio Oficial";
  diariaPYG: number;
  telefono: string;
  obraActualId: string;
  activo: boolean;
  email?: string;
  rol: RolUsuario;
  supervisorId?: string;
}

export interface RegistroDiaria {
  id: string;
  fecha: string;
  trabajadorId: string;
  obraId: string;
  estadoAsistencia: "Presente" | "Ausente" | "Medio Día" | "Horas Extras";
  horasExtra: number;
  valePYG: number;
  observaciones: string;
}

export interface BitacoraRegistro {
  id: string;
  obraId: string;
  fecha: string;
  clima: "Soleado" | "Lluvia" | "Nublado" | "Caluroso";
  personalPresente: number;
  avanceDescripcion: string;
  trabasNovedades: string;
  responsable: string;
  fotos: string[];
}

export interface Herramienta {
  id: string;
  empresaId: string;
  codigoQR: string;
  nombre: string;
  marca: string;
  numeroSerie: string;
  categoria: "Medición y Ensayos" | "Fijación y Corte" | "Electromecánica" | "Seguridad y Altura";
  estado: "Disponible en Pañol" | "En Obra / Asignada" | "En Mantenimiento";
  asignadoA?: string;
  obraAsignada?: string;
  fechaPrestamo?: string;
  fechaDevolucionEstimada?: string;
  imagen?: string;
}

export interface TableroElectrico {
  id: string;
  empresaId: string;
  codigo: string;
  nombre: string;
  obraId: string;
  cliente: string;
  tension: string; // ej: "380V / 220V"
  corrienteNominal: string; // ej: "1250 A"
  gabineteTipo: string;
  faseActual: "Diseño y Planos" | "Mecanizado de Gabinete" | "Montaje de Barras" | "Cableado y Maniobra" | "Pruebas FAT (Aislación)" | "Entregado en Obra";
  progreso: number;
  responsable: string;
  fechaEntregaObjetivo: string;
  materiales: { descripcion: string; cantidad: number; comprado: boolean }[];
}

export type EstadoTarea = "Pendiente" | "En Progreso" | "Reportada" | "Aprobada" | "Rechazada" | "Con Problema";

export interface Tarea {
  id: string;
  obraId: string;
  trabajadorId: string;
  descripcion: string;
  fecha: string;
  estado: EstadoTarea;
  fotos?: string[];
  comentarioTrabajador?: string;
  comentarioSupervisor?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  porcentajeAvanceAsociado: number;
  herramientaUsada?: string;
  eppVerificado?: boolean;
}

export const EMPRESAS_INICIALES: Empresa[] = [
  {
    id: "emp-principal",
    nombre: "Mi Empresa Constructora",
    tipo: "civil",
    ruc: "80000000-1",
    moneda: "PYG (₲)",
    contacto: "+595 981 000 000"
  }
];

export const OBRAS_INICIALES: Obra[] = [];
export const TRABAJADORES_INICIALES: Trabajador[] = [];
export const HERRAMIENTAS_INICIALES: Herramienta[] = [];
export const TABLEROS_INICIALES: TableroElectrico[] = [];
export const BITACORA_INICIAL: BitacoraRegistro[] = [];
export const TAREAS_INICIALES: Tarea[] = [];
export const DIARIAS_INICIALES: RegistroDiaria[] = [];
