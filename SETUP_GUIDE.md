# 🚀 Guía de Configuración - ObraLogix SaaS

## 🔑 Configuración con Appwrite

El proyecto ahora usa **Appwrite** como backend, que ofrece plan gratuito sin límite de proyectos (a diferencia de Supabase que solo permite 2 proyectos gratis).

### 1. Crear cuenta en Appwrite

1. Ve a [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Haz clic en "Sign Up"
3. Regístrate con GitHub, Google o email
4. Verifica tu email si es necesario

### 2. Crear un nuevo proyecto

1. En el dashboard de Appwrite, haz clic en "Create Project"
2. Nombre del proyecto: `obralogix`
3. Selecciona la región más cercana (South America si está disponible)
4. Haz clic en "Create"

### 3. Obtener las credenciales

1. Cuando el proyecto esté listo, ve a **Settings** → **API Keys**
2. Haz clic en "Create API Key"
3. Nombre: `ObraLogix Web`
4. Permisos: Selecciona todos los permisos necesarios
5. Copia el **Project ID**

### 4. Configurar las variables de entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=obralogix_db
```

### 5. Configurar base de datos y colecciones

Sigue la guía detallada en `appwrite/setup.md` para crear:
- Base de datos `obralogix_db`
- 9 colecciones con sus atributos
- Configuración de permisos

**Resumen rápido de colecciones:**
- `empresas` - Datos de empresas/constructoras
- `usuarios` - Usuarios del sistema
- `obras` - Proyectos de construcción
- `trabajadores` - Personal de cuadrillas
- `asistencias_diarias` - Control de asistencia y jornales
- `bitacoras` - Registro diario de obra
- `herramientas` - Inventario del pañol
- `tableros_electricos` - Seguimiento de tableros
- `suscripciones_pagos` - Historial de pagos

### 6. Habilitar autenticación por email

1. Ve a **Auth** → **Settings**
2. Habilita **Email/Password**
3. Configura las opciones según prefieras

## 🧪 Probar el sistema

Una vez configurado:

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre [http://localhost:3000](http://localhost:3000)

3. Prueba el flujo de registro:
   - Haz clic en "Registrarse" o "Empezar Prueba Gratis"
   - Completa el formulario de registro
   - Selecciona un plan
   - Simula el pago (en desarrollo esto es solo una simulación)
   - Accede al sistema

4. Prueba el flujo de login:
   - Cierra sesión
   - Vuelve a ingresar con tus credenciales

## 📋 Planes disponibles

- **Obra Única**: ₲350.000/mes - 1 obra, hasta 10 trabajadores
- **Empresa**: ₲890.000/mes - Obras ilimitadas, hasta 40 trabajadores
- **Multi-empresa**: A medida - Varias empresas bajo un mismo panel

## 🔒 Seguridad

- El sistema usa Appwrite Auth para gestión de sesiones
- Las contraseñas se hashean automáticamente
- Las API routes están protegidas
- El middleware protege las rutas de la aplicación

## 🚀 Despliegue

Para desplegar en producción:

1. Configura las variables de entorno en tu plataforma de hosting
2. Configura la base de datos de Appwrite para producción
3. Construye la aplicación:
```bash
npm run build
```

4. Despliega siguiendo las instrucciones de tu plataforma (Vercel, Netlify, etc.)

## 📞 Soporte

Si encuentras problemas:
- Verifica que las variables de entorno estén correctamente configuradas
- Revisa la consola del navegador para errores
- Consulta la guía detallada en `appwrite/setup.md`
- Asegúrate de que todas las colecciones estén creadas con los atributos correctos

## 🔄 Migración desde Supabase

Si tenías una versión con Supabase:
- El código ha sido migrado completamente a Appwrite
- Solo necesitas configurar Appwrite siguiendo esta guía
- Los datos existentes de Supabase no se migran automáticamente