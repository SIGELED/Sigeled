# Backend Sigeled - Sistema de Gestión de Contratos

## 🚀 Configuración Inicial

### 1. Crear archivo .env
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/sigeled_db
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_para_jwt_tokens
PORT=4000
NODE_ENV=development
```

### 2. Configurar Base de Datos
1. Crear la base de datos PostgreSQL
2. Ejecutar el script de roles: `database/roles.sql`
3. Asegurarse de que la tabla `usuarios` tenga los campos necesarios

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Crear Administrador Inicial
```bash
node scripts/createAdmin.js
```

**Credenciales del administrador:**
- Email: `admin@sigeled.com`
- Contraseña: `Admin123!`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer inicio de sesión.

## 📋 Estructura de Roles

### Roles Disponibles:
1. **pendiente** - Usuario recién registrado (asignado automáticamente)
2. **administrador** - Acceso total al sistema (Monjes)
3. **coordinador** - Gestiona plantillas y contratos (4 personas)
4. **docente** - Profesor contratado
5. **empleado_rrhh** - Solo lectura de contratos
6. **empleado_economia** - Gestión financiera y resoluciones
7. **supervisor** - Nivel intermedio

### Permisos por Rol:

#### Administrador
- ✅ Gestión completa de usuarios y roles
- ✅ Acceso total a contratos
- ✅ Gestión de docentes, coordinadores, empleados
- ✅ Acceso a economía y reportes

#### Coordinador
- ✅ Crear y editar contratos
- ✅ Gestionar docentes y plantillas
- ✅ Ver reportes y materias
- ❌ No puede gestionar usuarios

#### Docente
- ✅ Ver su propio perfil y contratos
- ✅ Subir CV
- ✅ Ver remuneración
- ❌ Acceso limitado a su información

#### Empleado RRHH
- ✅ Ver contratos (solo lectura)
- ✅ Ver docentes y reportes
- ❌ No puede modificar datos

#### Empleado Economía
- ✅ Ver contratos y remuneraciones
- ✅ Gestionar resoluciones y pagos
- ✅ Ver reportes
- ❌ No puede gestionar usuarios

## 🔐 Endpoints de Autenticación

### POST `/api/auth/login`
```json
{
  "email": "usuario@ejemplo.com",
  "contraseña": "Contraseña123"
}
```

### POST `/api/auth/register`
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "contraseña": "Contraseña123"
}
```
*Nota: Los nuevos usuarios se registran con rol "pendiente"*

## 👥 Endpoints de Gestión de Usuarios

### Solo Administradores:

#### GET `/api/users/users`
Obtener todos los usuarios

#### GET `/api/users/users/pending`
Obtener usuarios pendientes de asignación de rol

#### POST `/api/users/users`
Crear nuevo usuario
```json
{
  "nombre": "María García",
  "email": "maria@ejemplo.com",
  "contraseña": "Contraseña123",
  "rol": 3,
  "dni": "12345678",
  "cuil": "20-12345678-9",
  "domicilio": "Calle 123",
  "titulo": "Ingeniera"
}
```

#### PATCH `/api/users/users/:userId/role`
Asignar/cambiar rol de usuario
```json
{
  "roleId": 3
}
```

#### PUT `/api/users/users/:id`
Actualizar usuario

#### DELETE `/api/users/users/:id`
Desactivar usuario

### Para Usuarios Autenticados:

#### GET `/api/users/profile`
Ver perfil propio

#### PUT `/api/users/profile`
Actualizar perfil propio

## 🎭 Endpoints de Gestión de Roles

### Solo Administradores:

#### GET `/api/roles`
Obtener todos los roles

#### GET `/api/roles/:id`
Obtener rol por ID

#### POST `/api/roles`
Crear nuevo rol
```json
{
  "nombre": "nuevo_rol",
  "descripcion": "Descripción del rol",
  "permisos": {
    "ver_contratos": true,
    "crear_contratos": false
  }
}
```

#### PUT `/api/roles/:id`
Actualizar rol

#### DELETE `/api/roles/:id`
Eliminar rol

## 🔒 Middleware de Autorización

### Verificar Token
```javascript
import { verificarToken } from '../middleware/authMiddlware.js';
router.use(verificarToken);
```

### Permitir Roles Específicos
```javascript
import { permitirRoles } from '../middleware/authMiddlware.js';
router.get('/admin', permitirRoles('administrador'), adminController);
```

## 📝 Validaciones

### Contraseñas Seguras
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número

### DNI y CUIL
- DNI: 7 u 8 dígitos
- CUIL: Formato XX-XXXXXXXX-X

## 🚨 Seguridad

1. **JWT Tokens** con expiración de 1 hora
2. **Contraseñas hasheadas** con bcrypt
3. **Validación de entrada** en todos los endpoints
4. **Autorización por roles** en rutas sensibles
5. **Soft delete** para usuarios (no se eliminan permanentemente)

## 🐛 Solución de Problemas

### Error: "Cannot find package 'dotenv'"
```bash
npm install dotenv
```

### Error: "No se encontró el rol 'administrador'"
Ejecuta primero el script de roles: `database/roles.sql`

### Error de conexión a base de datos
Verifica que el archivo `.env` tenga la URL correcta de la base de datos

## 📞 Soporte

Para problemas técnicos, revisa los logs del servidor y verifica la configuración de la base de datos. 