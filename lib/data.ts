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

export interface Trabajador {
  id: string;
  empresaId: string;
  nombre: string;
  documento: string;
  categoria: "Oficial Albañil" | "Ayudante" | "Electricista Matriculado" | "Técnico Tablerista" | "Capataz" | "Soldador";
  diariaPYG: number;
  telefono: string;
  obraActualId: string;
  activo: boolean;
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

export const EMPRESAS_INICIALES: Empresa[] = [
  {
    id: "emp-1",
    nombre: "Construlógica Servicios Eléctricos",
    tipo: "electrico",
    ruc: "80094521-3",
    moneda: "PYG (₲)",
    contacto: "+595 981 445 220"
  },
  {
    id: "emp-2",
    nombre: "Constructora del Este & Obras Civiles",
    tipo: "civil",
    ruc: "80041289-7",
    moneda: "PYG (₲)",
    contacto: "+595 983 112 990"
  }
];

export const OBRAS_INICIALES: Obra[] = [
  {
    id: "obr-1",
    empresaId: "emp-1",
    codigo: "OBR-EL-01",
    nombre: "Montaje TGBT & Alimentadores Planta Industrial Cervepar",
    tipo: "electrico",
    cliente: "Cervepar S.A.",
    ubicacion: "Ypané, Dpto. Central",
    fechaInicio: "2026-08-10",
    fechaFinEstimada: "2026-10-30",
    responsable: "Ing. Marcos Vera (Construlógica)",
    estado: "En Ejecución",
    progreso: 65,
    presupuestoPYG: 340000000,
    costoEjecutadoPYG: 215000000,
    trabajadoresAsignados: 6
  },
  {
    id: "obr-2",
    empresaId: "emp-1",
    codigo: "OBR-EL-02",
    nombre: "Subestación y Tableros Seccionales Centro Logístico San Lorenzo",
    tipo: "electrico",
    cliente: "Grupo Retail S.A.",
    ubicacion: "San Lorenzo, Ruta 2",
    fechaInicio: "2026-09-01",
    fechaFinEstimada: "2026-11-15",
    responsable: "Téc. Lucas Benítez (Construlógica)",
    estado: "En Ejecución",
    progreso: 30,
    presupuestoPYG: 185000000,
    costoEjecutadoPYG: 52000000,
    trabajadoresAsignados: 4
  },
  {
    id: "obr-3",
    empresaId: "emp-2",
    codigo: "OBR-CIV-01",
    nombre: "Edificio Residencial Las Palmeras - Estructura y Mampostería",
    tipo: "civil",
    cliente: "Fideicomiso Palmeras",
    ubicacion: "Asunción, B° Villa Morra",
    fechaInicio: "2026-07-15",
    fechaFinEstimada: "2027-02-28",
    responsable: "Arq. Diego Fernández",
    estado: "En Ejecución",
    progreso: 45,
    presupuestoPYG: 850000000,
    costoEjecutadoPYG: 410000000,
    trabajadoresAsignados: 14
  }
];

export const TRABAJADORES_INICIALES: Trabajador[] = [
  {
    id: "tr-1",
    empresaId: "emp-1",
    nombre: "Darío González",
    documento: "4.356.120",
    categoria: "Técnico Tablerista",
    diariaPYG: 220000,
    telefono: "0981-555123",
    obraActualId: "obr-1",
    activo: true
  },
  {
    id: "tr-2",
    empresaId: "emp-1",
    nombre: "Ronaldo Peña",
    documento: "3.890.412",
    categoria: "Electricista Matriculado",
    diariaPYG: 200000,
    telefono: "0982-334112",
    obraActualId: "obr-1",
    activo: true
  },
  {
    id: "tr-3",
    empresaId: "emp-1",
    nombre: "Ever Cabrera",
    documento: "5.112.780",
    categoria: "Ayudante",
    diariaPYG: 140000,
    telefono: "0971-889001",
    obraActualId: "obr-1",
    activo: true
  },
  {
    id: "tr-4",
    empresaId: "emp-1",
    nombre: "Víctor Samudio",
    documento: "4.891.223",
    categoria: "Electricista Matriculado",
    diariaPYG: 190000,
    telefono: "0985-776120",
    obraActualId: "obr-2",
    activo: true
  },
  {
    id: "tr-5",
    empresaId: "emp-2",
    nombre: "Ramón Benítez",
    documento: "3.456.789",
    categoria: "Capataz",
    diariaPYG: 250000,
    telefono: "0983-998811",
    obraActualId: "obr-3",
    activo: true
  },
  {
    id: "tr-6",
    empresaId: "emp-2",
    nombre: "Ignacio Florentín",
    documento: "4.712.901",
    categoria: "Oficial Albañil",
    diariaPYG: 180000,
    telefono: "0972-445566",
    obraActualId: "obr-3",
    activo: true
  },
  {
    id: "tr-7",
    empresaId: "emp-2",
    nombre: "Julio Almada",
    documento: "5.441.200",
    categoria: "Ayudante",
    diariaPYG: 130000,
    telefono: "0981-667788",
    obraActualId: "obr-3",
    activo: true
  }
];

export const HERRAMIENTAS_INICIALES: Herramienta[] = [
  {
    id: "her-1",
    empresaId: "emp-1",
    codigoQR: "QR-HER-001",
    nombre: "Rotomartillo SDS-Max 1500W",
    marca: "Bosch GBH 8-45 D",
    numeroSerie: "SN-BSH-88912",
    categoria: "Electromecánica",
    estado: "En Obra / Asignada",
    asignadoA: "Ronaldo Peña",
    obraAsignada: "Montaje TGBT Planta Industrial Cervepar",
    fechaPrestamo: "2026-09-02",
    fechaDevolucionEstimada: "2026-09-12"
  },
  {
    id: "her-2",
    empresaId: "emp-1",
    codigoQR: "QR-HER-002",
    nombre: "Pinza Amperimétrica True RMS c/ iFlex",
    marca: "Fluke 376 FC",
    numeroSerie: "SN-FLK-44102",
    categoria: "Medición y Ensayos",
    estado: "En Obra / Asignada",
    asignadoA: "Darío González",
    obraAsignada: "Montaje TGBT Planta Industrial Cervepar",
    fechaPrestamo: "2026-09-04",
    fechaDevolucionEstimada: "2026-09-08"
  },
  {
    id: "her-3",
    empresaId: "emp-1",
    codigoQR: "QR-HER-003",
    nombre: "Crimpador Hidráulico Hexagonal 16-300 mm²",
    marca: "Klauke HK 60/22",
    numeroSerie: "SN-KLK-99011",
    categoria: "Fijación y Corte",
    estado: "Disponible en Pañol"
  },
  {
    id: "her-4",
    empresaId: "emp-1",
    codigoQR: "QR-HER-004",
    nombre: "Megóhmetro Digital 1000V (Medidor de Aislación)",
    marca: "Megger MIT410/2",
    numeroSerie: "SN-MEG-12004",
    categoria: "Medición y Ensayos",
    estado: "Disponible en Pañol"
  },
  {
    id: "her-5",
    empresaId: "emp-1",
    codigoQR: "QR-HER-005",
    nombre: "Escalera Dieléctrica Tijera 8 peldaños (Fibra de Vidrio)",
    marca: "Werner Fibra T6208",
    numeroSerie: "SN-WRN-30119",
    categoria: "Seguridad y Altura",
    estado: "En Obra / Asignada",
    asignadoA: "Víctor Samudio",
    obraAsignada: "Subestación Centro Logístico San Lorenzo",
    fechaPrestamo: "2026-09-01",
    fechaDevolucionEstimada: "2026-09-15"
  }
];

export const TABLEROS_INICIALES: TableroElectrico[] = [
  {
    id: "tab-1",
    empresaId: "emp-1",
    codigo: "TGBT-CP-01",
    nombre: "Tablero General de Baja Tensión 1600A - Sala de Compresores",
    obraId: "obr-1",
    cliente: "Cervepar S.A.",
    tension: "380V / 220V - 50Hz",
    corrienteNominal: "1600 A - Icu 50kA",
    gabineteTipo: "Autoportante PrismaSeT P - IP54",
    faseActual: "Cableado y Maniobra",
    progreso: 75,
    responsable: "Darío González (Construlógica)",
    fechaEntregaObjetivo: "2026-09-22",
    materiales: [
      { descripcion: "Gabinete Metálico 2000x800x600 IP54", cantidad: 2, comprado: true },
      { descripcion: "Interruptor Bastidor Abierto 1600A 4P Micrologic", cantidad: 1, comprado: true },
      { descripcion: "Juego de Barras de Cobre Electrolítico 80x10 mm", cantidad: 6, comprado: true },
      { descripcion: "Interruptores Caja Moldeada 250A y 400A", cantidad: 8, comprado: true },
      { descripcion: "Central de Medida PM5350 c/ Modbus", cantidad: 1, comprado: true },
      { descripcion: "Cable Extra Flexible de Comando 1.5 mm² Rojo/Negro", cantidad: 300, comprado: true },
      { descripcion: "Transformadores de Corriente 1600/5A Clase 0.5", cantidad: 3, comprado: false }
    ]
  },
  {
    id: "tab-2",
    empresaId: "emp-1",
    codigo: "TS-CL-02",
    nombre: "Tablero Seccional Iluminación y Fuerza Nave 3",
    obraId: "obr-2",
    cliente: "Grupo Retail S.A.",
    tension: "380V / 220V",
    corrienteNominal: "250 A",
    gabineteTipo: "Mural 1200x800x300 IP65",
    faseActual: "Montaje de Barras",
    progreso: 45,
    responsable: "Víctor Samudio (Construlógica)",
    fechaEntregaObjetivo: "2026-10-05",
    materiales: [
      { descripcion: "Gabinete Mural IP65 con chapa de montaje", cantidad: 1, comprado: true },
      { descripcion: "Disyuntor Principal 250A 3P", cantidad: 1, comprado: true },
      { descripcion: "Termomagnéticas DIN 3x32A y 1x16A (Curva C)", cantidad: 24, comprado: true },
      { descripcion: "Disyuntores Diferenciales 4x40A 30mA", cantidad: 6, comprado: false }
    ]
  }
];

export const BITACORA_INICIAL: BitacoraRegistro[] = [
  {
    id: "bit-1",
    obraId: "obr-1",
    fecha: "2026-09-05",
    clima: "Soleado",
    personalPresente: 6,
    avanceDescripcion: "Se completó el tendido de bandeja portacable perforada de 400mm en el tramo Sala de Generadores hacia TGBT. Cableado de 4 conductores de 240mm² por fase.",
    trabasNovedades: "Se solicitó grúa para izaje de gabinete el día martes. Ningún accidente registrado.",
    responsable: "Ing. Marcos Vera",
    fotos: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: "bit-2",
    obraId: "obr-3",
    fecha: "2026-09-05",
    clima: "Soleado",
    personalPresente: 13,
    avanceDescripcion: "Hormigonado de 4 columnas en nivel 3. Encofrado de losa sobre tanque inferior. Recepción de 14m3 de hormigón elaborado H21.",
    trabasNovedades: "Camión mixer demoró 40 minutos por congestión en Av. Mariscal López. Se cumplió el vaciado sin fisuras.",
    responsable: "Arq. Diego Fernández",
    fotos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=60"
    ]
  }
];
