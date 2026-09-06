-- ==========================================================
-- 🏗️ OBRALOGIX SAAS - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==========================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA EMPRESAS (TENANTS MULTI-EMPRESA)
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'electrico', -- 'electrico', 'civil', 'mixto'
    ruc VARCHAR(50),
    moneda VARCHAR(20) DEFAULT 'PYG (₲)',
    contacto VARCHAR(100),
    plan VARCHAR(50) DEFAULT 'Empresa', -- 'Obra Única', 'Empresa', 'Multi-empresa'
    estado_suscripcion VARCHAR(50) DEFAULT 'Activo', -- 'Activo', 'Prueba', 'Vencido'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA USUARIOS DE EMPRESA (AUTH & ROLES)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin', -- 'admin', 'supervisor', 'panolero', 'cliente'
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA OBRAS Y PROYECTOS
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'civil', -- 'civil', 'electrico', 'mixto'
    cliente VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    responsable VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'En Ejecución', -- 'En Ejecución', 'Planificada', 'Pausada', 'Finalizada'
    progreso INTEGER DEFAULT 0,
    presupuesto_pyg BIGINT DEFAULT 0,
    costo_ejecutado_pyg BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA TRABAJADORES (CUADRILLAS)
CREATE TABLE IF NOT EXISTS public.trabajadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    documento VARCHAR(50),
    categoria VARCHAR(100) NOT NULL, -- 'Oficial Albañil', 'Ayudante', 'Electricista Matriculado', 'Técnico Tablerista', 'Capataz'
    diaria_pyg BIGINT NOT NULL DEFAULT 150000,
    telefono VARCHAR(50),
    obra_actual_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA ASISTENCIA DIARIA & VALES (JORNALES)
CREATE TABLE IF NOT EXISTS public.asistencias_diarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL,
    trabajador_id UUID REFERENCES public.trabajadores(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    estado_asistencia VARCHAR(50) DEFAULT 'Presente', -- 'Presente', 'Ausente', 'Medio Día', 'Horas Extras'
    horas_extra INTEGER DEFAULT 0,
    vale_pyg BIGINT DEFAULT 0,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(fecha, trabajador_id)
);

-- 7. TABLA BITÁCORA DIGITAL (DIARIO DE CAMPO)
CREATE TABLE IF NOT EXISTS public.bitacoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    clima VARCHAR(50) DEFAULT 'Soleado', -- 'Soleado', 'Caluroso', 'Nublado', 'Lluvia'
    personal_presente INTEGER DEFAULT 1,
    avance_descripcion TEXT NOT NULL,
    trabas_novedades TEXT,
    responsable VARCHAR(255),
    fotos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA PAÑOL & HERRAMIENTAS (CUSTODIA QR)
CREATE TABLE IF NOT EXISTS public.herramientas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo_qr VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    numero_serie VARCHAR(100),
    categoria VARCHAR(100), -- 'Electromecánica', 'Medición y Ensayos', 'Fijación y Corte', 'Seguridad y Altura'
    estado VARCHAR(50) DEFAULT 'Disponible en Pañol', -- 'Disponible en Pañol', 'En Obra / Asignada', 'En Mantenimiento'
    asignado_a VARCHAR(255),
    obra_asignada VARCHAR(255),
    fecha_prestamo DATE,
    fecha_devolucion_estimada DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA TABLEROS ELÉCTRICOS (CONSTRULÓGICA)
CREATE TABLE IF NOT EXISTS public.tableros_electricos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    cliente VARCHAR(255),
    tension VARCHAR(50),
    corriente_nominal VARCHAR(50),
    gabinete_tipo VARCHAR(100),
    fase_actual VARCHAR(100) DEFAULT 'Diseño y Planos',
    progreso INTEGER DEFAULT 0,
    responsable VARCHAR(255),
    fecha_entrega_objetivo DATE,
    materiales JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA PAGOS Y SUSCRIPCIONES
CREATE TABLE IF NOT EXISTS public.suscripciones_pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    monto_pyg BIGINT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL, -- 'Bancard', 'Transferencia SIPAP', 'PagoMóvil'
    estado VARCHAR(50) DEFAULT 'Aprobado',
    comprobante VARCHAR(100),
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    fecha_vencimiento DATE
);
