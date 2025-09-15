# SIGELED - Backend

Sistema de Gestión Integral de Legajos Digitales para Personal Docente y No Docente

---

## 🚀 Configuración Inicial

### 1. Crear archivo `.env`
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/sigeled_db
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_para_jwt_tokens
PORT=4000
NODE_ENV=development
SUPABASE_URL=tu_url_supabase
SUPABASE_SERVICE_ROLE=tu_token_supabase
```

### 2. Configurar Base de Datos
- Crear la base de datos PostgreSQL
- Ejecutar los scripts de tablas y roles necesarios
- Verifica que las tablas principales (`usuarios`, `personas`, `contratos`, `roles`, etc.) estén creadas

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Crear Administrador Inicial
```bash
node scripts/createAdmin.js
```

**Credenciales por defecto:**
- Email: `admin@sigeled.com`
- Contraseña: `Admin123!`
> Cambia la contraseña después del primer inicio de sesión.

---

## 📁 Estructura de Carpetas

- **controllers/**: Lógica de negocio y endpoints REST
- **middleware/**: Autenticación, autorización, validación de archivos
- **models/**: Acceso y lógica de base de datos
- **routes/**: Definición de rutas y endpoints
- **validators/**: Validaciones de datos
- **uploads/**: Archivos subidos (si no usas Supabase)
- **utils/**: Utilidades generales (JWT, etc.)
- **scripts/**: Scripts auxiliares (ej. crear admin)

---

## 🧩 Funcionalidades Principales

### 1. **Autenticación y Usuarios**
- Registro y login de usuarios (`auth.routes.js`)
- Asignación y gestión de roles (`role.routes.js`)
- CRUD de usuarios (`user.routes.js`)
- Protección de rutas con JWT y roles (`authMiddlware.js`)

### 2. **Gestión de Personas**
- Registro y vinculación automática de datos personales (`persona.routes.js`)
- Asignación de tipo de empleado (solo RRHH/Admin)
- Buscador avanzado de personal (solo RRHH/Admin)
- Consulta y actualización de legajos

### 3. **Documentos, Domicilios, Identificaciones, Títulos**
- Registro y consulta de documentos personales, domicilios, identificaciones y títulos
- Subida de archivos comprobatorios (validación de tipo/tamaño)
- Estados de verificación para cada documento (pendiente, aprobado, rechazado)
- Evita duplicados (ej. DNI/título)

### 4. **Contratos**
- Registro, consulta, actualización y eliminación de contratos
- Solo administradores pueden modificar contratos

### 5. **Roles y Permisos**
- CRUD de roles y asignación a usuarios
- Middleware para proteger rutas según rol (`authMiddlware.js`, `soloRRHH`)

### 6. **Auditoría y Trazabilidad**
- Registro histórico de cambios y acciones relevantes (auditoría)
- Consulta de historial por entidad

### 7. **Documentación de la API**
- Swagger disponible en `/api-docs` para probar y consultar todos los endpoints

---

## 🔎 Buscador Avanzado

- Endpoint: `GET /api/persona/buscar`
- Parámetros: `nombre`, `apellido`, `dni`, `tipo_empleado`
- Solo accesible para RRHH/Admin
- Permite filtrar y buscar personal por múltiples campos

---

## 📝 Auditoría y Registro Histórico

- Cada cambio relevante en datos personales, documentos, contratos, etc. queda registrado en la tabla de auditoría
- Endpoint para consultar historial: `GET /api/persona/{id_persona}/historial` (solo RRHH/Admin)

---

## 🔐 Seguridad y Permisos

- Todas las rutas sensibles están protegidas por JWT
- Endpoints administrativos requieren rol RRHH o Administrador
- Los usuarios solo pueden modificar/consultar su propia información y documentos
- Validación de archivos y datos en todos los endpoints

---

## 📋 Ejemplo de Flujo

1. **Registro de usuario:**  
   POST a `/api/auth/register` con email y contraseña

2. **Login:**  
   POST a `/api/auth/login` con email y contraseña  
   Recibes un JWT para autenticación

3. **Completar datos personales:**  
   POST a `/api/persona` con nombre, apellido, fecha de nacimiento y sexo  
   El backend vincula automáticamente el usuario y la persona

4. **Subir documentos/archivos:**  
   POST a `/api/persona/{id_persona}/archivo` con el archivo comprobatorio  
   POST a `/api/persona/{id_persona}/identificacion` para DNI, etc.

5. **Asignar tipo de empleado:**  
   PUT a `/api/persona/asignar-tipo` (solo RRHH/Admin)

6. **Aprobar/rechazar documentos:**  
   PUT a `/api/persona-ident/estado` (solo RRHH/Admin)

7. **Consultar estados de verificación:**  
   GET a `/api/persona/estados-verificacion` (solo RRHH/Admin)

8. **Buscador avanzado:**  
   GET a `/api/persona/buscar?nombre=...&apellido=...&dni=...&tipo_empleado=...` (solo RRHH/Admin)

9. **Consultar historial de cambios:**  
   GET a `/api/persona/{id_persona}/historial` (solo RRHH/Admin)

10. **Gestionar contratos, roles y usuarios:**  
    CRUD en `/api/contratos`, `/api/roles`, `/api/users` (solo administradores)

---

## 📑 Documentación y Pruebas

- Accede a [http://localhost:4000/api-docs](http://localhost:4000/api-docs) para ver y probar todos los endpoints con Swagger

---

## 🐛 Solución de Problemas

- **Error: "Cannot find package 'dotenv'"**  
  Ejecuta: `npm install dotenv`

- **Error de conexión a base de datos**  
  Verifica que el archivo `.env` tenga la URL correcta de la base de datos

- **Error de permisos o roles**  
  Verifica que el usuario tenga el rol adecuado y que el middleware esté correctamente aplicado

---

## 👨‍💻 Notas para desarrolladores

- **Backend:RORI**  
  - Los modelos usan SQL parametrizado para evitar inyecciones
  - Los controladores registran auditoría en cada cambio relevante
  - Los middlewares permiten extender fácilmente la lógica de permisos

- **Frontend:JUANQ**  
  - Consulta la documentación Swagger para saber qué datos enviar y recibir en cada endpoint
  - Usa JWT en el header `Authorization` para acceder a rutas protegidas
  - Los endpoints de autogestión y consulta están listos para integración

---

## ❗️ ¿Qué falta por agregar?

- Filtros avanzados en el buscador (por fecha, estado, etc.)
- Endpoints para informes y estadísticas
- Módulo para legajos de alumnos
- Integración con sistemas externos (API REST, webhooks, etc.)
- Auditoría más detallada (logs de acceso, cambios en documentos, etc.)

---

**Cualquier duda pregunten**