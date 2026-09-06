# 🚀 Guía de Configuración - ObraLogix SaaS

## 🔑 Configuración de Supabase

Para que el sistema de autenticación funcione correctamente, necesitas configurar las variables de entorno de Supabase.

### 1. Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto llamado "obralogix"
3. Espera a que el proyecto se inicialice (2-3 minutos)

### 2. Ejecutar el esquema de base de datos

1. En tu proyecto de Supabase, ve a "SQL Editor"
2. Copia el contenido del archivo `supabase/schema.sql`
3. Pégalo en el editor SQL y ejecútalo
4. Esto creará todas las tablas necesarias para el sistema

### 3. Configurar las variables de entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Para obtener estos valores:
1. En tu proyecto de Supabase, ve a "Settings" → "API"
2. Copia la "Project URL" y pégala en `NEXT_PUBLIC_SUPABASE_URL`
3. Copia la "anon public key" y pégala en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Habilitar autenticación por email

1. En Supabase, ve a "Authentication" → "Providers"
2. Habilita el proveedor "Email"
3. Configura las opciones de confirmación de email según tus preferencias

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

- El sistema usa Supabase Auth para gestión de sesiones
- Las contraseñas se hashean automáticamente
- Las API routes están protegidas
- El middleware protege las rutas de la aplicación

## 🚀 Despliegue

Para desplegar en producción:

1. Configura las variables de entorno en tu plataforma de hosting
2. Ejecuta el esquema de base de datos en tu instancia de Supabase de producción
3. Construye la aplicación:
```bash
npm run build
```

4. Despliega siguiendo las instrucciones de tu plataforma (Vercel, Netlify, etc.)

## 📞 Soporte

Si encuentras problemas:
- Verifica que las variables de entorno estén correctamente configuradas
- Revisa la consola del navegador para errores
- Asegúrate de que el esquema de base de datos se haya ejecutado correctamente en Supabase