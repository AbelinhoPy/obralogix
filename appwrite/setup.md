# 🚀 Guía de Configuración - ObraLogix con Appwrite

## 📋 Configuración de Appwrite

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
5. Copia el **Project ID** y el **API Key**

### 4. Configurar las variables de entorno
En tu archivo `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=obralogix_db
```

### 5. Crear base de datos
1. En Appwrite, ve a **Databases** → **Create Database**
2. Nombre: `obralogix_db`
3. Database ID: `obralogix_db`
4. Haz clic en "Create"

### 6. Crear colecciones (tablas)

Para cada colección, sigue estos pasos:

#### Colección: `empresas`
1. **Create Collection** → Nombre: `empresas` → Collection ID: `empresas`
2. **Attributes** → Add Attribute:
   - `nombre` (String, size: 255, required)
   - `tipo` (String, size: 50, default: "electrico")
   - `ruc` (String, size: 50, optional)
   - `moneda` (String, size: 20, default: "PYG (₲)")
   - `contacto` (String, size: 100, optional)
   - `plan` (String, size: 50, default: "Empresa")
   - `estado_suscripcion` (String, size: 50, default: "Activo")
   - `created_at` (DateTime)

#### Colección: `usuarios`
1. **Create Collection** → Nombre: `usuarios` → Collection ID: `usuarios`
2. **Attributes** → Add Attribute:
   - `empresa_id` (String, size: 255, required, relate to empresas)
   - `email` (String, size: 255, required, unique)
   - `nombre` (String, size: 255, required)
   - `rol` (String, size: 50, default: "admin")
   - `telefono` (String, size: 50, optional)
   - `activo` (Boolean, default: true)
   - `created_at` (DateTime)

#### Colección: `obras`
1. **Create Collection** → Nombre: `obras` → Collection ID: `obras`
2. **Attributes** → Add Attribute:
   - `empresa_id` (String, size: 255, required, relate to empresas)
   - `codigo` (String, size: 50, required)
   - `nombre` (String, size: 255, required)
   - `tipo` (String, size: 50, default: "civil")
   - `cliente` (String, size: 255, required)
   - `ubicacion` (String, size: 255, optional)
   - `fecha_inicio` (Date, optional)
   - `fecha_fin_estimada` (Date, optional)
   - `responsable` (String, size: 255, optional)
   - `estado` (String, size: 50, default: "En Ejecución")
   - `progreso` (Integer, default: 0)
   - `presupuesto_pyg` (BigInt, default: 0)
   - `costo_ejecutado_pyg` (BigInt, default: 0)
   - `created_at` (DateTime)

#### Colección: `trabajadores`
1. **Create Collection** → Nombre: `trabajadores` → Collection ID: `trabajadores`
2. **Attributes** → Add Attribute:
   - `empresa_id` (String, size: 255, required, relate to empresas)
   - `nombre` (String, size: 255, required)
   - `documento` (String, size: 50, optional)
   - `categoria` (String, size: 100, required)
   - `diaria_pyg` (BigInt, default: 150000)
   - `telefono` (String, size: 50, optional)
   - `obra_actual_id` (String, size: 255, optional, relate to obras)
   - `activo` (Boolean, default: true)
   - `created_at` (DateTime)

#### Colección: `asistencias_diarias`
1. **Create Collection** → Nombre: `asistencias_diarias` → Collection ID: `asistencias_diarias`
2. **Attributes** → Add Attribute:
   - `fecha` (Date, required)
   - `trabajador_id` (String, size: 255, required, relate to trabajadores)
   - `obra_id` (String, size: 255, required, relate to obras)
   - `estado_asistencia` (String, size: 50, default: "Presente")
   - `horas_extra` (Integer, default: 0)
   - `vale_pyg` (BigInt, default: 0)
   - `observaciones` (String, optional)
   - `created_at` (DateTime)

#### Colección: `bitacoras`
1. **Create Collection** → Nombre: `bitacoras` → Collection ID: `bitacoras`
2. **Attributes** → Add Attribute:
   - `obra_id` (String, size: 255, required, relate to obras)
   - `fecha` (Date, required)
   - `clima` (String, size: 50, default: "Soleado")
   - `personal_presente` (Integer, default: 1)
   - `avance_descripcion` (String, required)
   - `trabas_novedades` (String, optional)
   - `responsable` (String, size: 255, optional)
   - `fotos` (Array of strings, default: [])
   - `created_at` (DateTime)

#### Colección: `herramientas`
1. **Create Collection** → Nombre: `herramientas` → Collection ID: `herramientas`
2. **Attributes** → Add Attribute:
   - `empresa_id` (String, size: 255, required, relate to empresas)
   - `codigo_qr` (String, size: 50, required, unique)
   - `nombre` (String, size: 255, required)
   - `marca` (String, size: 100, optional)
   - `numero_serie` (String, size: 100, optional)
   - `categoria` (String, size: 100, optional)
   - `estado` (String, size: 50, default: "Disponible en Pañol")
   - `asignado_a` (String, size: 255, optional)
   - `obra_asignada` (String, size: 255, optional)
   - `fecha_prestamo` (Date, optional)
   - `fecha_devolucion_estimada` (Date, optional)
   - `created_at` (DateTime)

#### Colección: `tableros_electricos`
1. **Create Collection** → Nombre: `tableros_electricos` → Collection ID: `tableros_electricos`
2. **Attributes** → Add Attribute:
   - `empresa_id` (String, size: 255, required, relate to empresas)
   - `codigo` (String, size: 50, required)
   - `nombre` (String, size: 255, required)
   - `obra_id` (String, size: 255, optional, relate to obras)
   - `cliente` (String, size: 255, optional)
   - `tension` (String, size: 50, optional)
   - `corriente_nominal` (String, size: 50, optional)
   - `gabinete_tipo` (String, size: 100, optional)
   - `fase_actual` (String, size: 100, default: "Diseño y Planos")
   - `progreso` (Integer, default: 0)
   - `responsable` (String, size: 255, optional)
   - `fecha_entrega_objetivo` (Date, optional)
   - `materiales` (Array of objects, default: [])
   - `created_at` (DateTime)

#### Colección: `suscripciones_pagos`
1. **Create Collection** → Nombre: `suscripciones_pagos` → Collection ID: `suscripciones_pagos`
2. **Attributes** → Add Attribute:
   - `empresa_id` (String, size: 255, required, relate to empresas)
   - `plan` (String, size: 50, required)
   - `monto_pyg` (BigInt, required)
   - `metodo_pago` (String, size: 50, required)
   - `estado` (String, size: 50, default: "Aprobado")
   - `comprobante` (String, size: 100, optional)
   - `fecha_pago` (DateTime)
   - `fecha_vencimiento` (Date, optional)

### 7. Configurar permisos
Para cada colección, configura los permisos:

**Para desarrollo:**
- **Read Access**: `Role: any` (cualquiera puede leer)
- **Write Access**: `Role: any` (cualquiera puede escribir)

**Para producción:**
- Configura permisos más restrictivos basados en roles de usuario

### 8. Habilitar autenticación por email
1. Ve a **Auth** → **Settings**
2. Habilita **Email/Password**
3. Configura las opciones según prefieras

### 9. Probar el sistema
1. Reinicia el servidor: `npm run dev`
2. Abre http://localhost:3000
3. Prueba registrarte con el nuevo AuthModal

## 🔒 Ventajas de Appwrite

- **Sin límite de proyectos gratuitos**
- **Hosting de bases de datos incluido**
- **Autenticación integrada**
- **Storage para archivos**
- **Funciones serverless**
- **API REST completa**
- **SDKs para múltiples lenguajes**

## 📞 Soporte

Si encuentras problemas:
- Verifica que las variables de entorno estén correctamente configuradas
- Revisa la consola del navegador para errores
- Asegúrate de que todas las colecciones estén creadas con los atributos correctos
- Verifica los permisos de las colecciones