# SIGELED - Backend

**Sistema Integral de Gestión de Legajos de Personal Docente**

Un sistema completo para la gestión digital de legajos, documentación y validación de personal docente con funcionalidades avanzadas de autenticación, roles y permisos.

---

## 🚀 **Características**

### **✅ Funcionalidades Implementadas**

- **🔐 Autenticación y Autorización**
  - JWT con refresh tokens
  - Sistema RBAC (Roles y Permisos)
  - Middleware de autenticación robusto

- **👥 Gestión de Personal**
  - Registro de personas y docentes
  - Gestión de identificaciones con archivos
  - Manejo de domicilios y títulos
  - Sistema de contratos

- **📄 Gestión de Documentos**
  - Subida segura de archivos
  - Organización por persona/colaborador
  - Control de acceso por roles
  - Validación de formatos y tamaños

- **🔍 Digitalización (Base)**
  - Estructura para OCR e indexación
  - Búsquedas básicas en documentos
  - Estadísticas de documentos
  - API preparada para IA

- **🛡️ Seguridad y Auditoría**
  - Validadores de entrada robustos
  - Middleware de seguridad
  - Logs de auditoría
  - Control de acceso granular

---

## 🛠️ **Tecnologías Utilizadas**

- **Backend:** Node.js + Express.js
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** Joi + Validadores personalizados
- **Upload de Archivos:** Multer
- **Documentación:** Swagger/OpenAPI

---

## 📋 **Requisitos Previos**

- **Node.js** >= 18.x
- **PostgreSQL** >= 13.x (o cuenta Supabase)
- **npm** o **yarn**

---

## ⚙️ **Instalación**

### **1. Clonar el repositorio**
```bash
git clone <tu-repo-url>
cd SIGELED/backend
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

### **4. Configurar base de datos**
```bash
## no hace falta
node scripts/setupDatabase.js
```

### **5. Crear usuario administrador**

```bash
## NO hace falta porque tenemos el perfil de Juan
node scripts/createAdmin.js
```

### **6. Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:4000`

---

## 🔧 **Configuración**

### **Variables de Entorno (.env)**

Ver `.env.example` para todas las variables necesarias.

**Principales configuraciones:**

- **Puerto y Host**
- **Conexión PostgreSQL**
- **JWT Secrets**
- **Configuración de Uploads**
- **URLs de Frontend**

### **Estructura de Carpetas**
```
backend/
├── controllers/          # Lógica de negocio
├── middleware/          # Middlewares (auth, validación, etc.)
├── models/             # Modelos de datos y BD
├── routes/             # Definición de rutas API
├── validators/         # Validadores Joi
├── utils/              # Utilidades (JWT, helpers)
├── scripts/            # Scripts de configuración
├── uploads/            # Archivos subidos (desarrollo)
└── app.js             # Punto de entrada principal
```

---

## 📚 **API Endpoints**

### **🔐 Autenticación**
```
POST   /api/auth/register     # Registro de usuario
POST   /api/auth/login        # Inicio de sesión
POST   /api/auth/refresh      # Renovar token
POST   /api/auth/logout       # Cerrar sesión
```

### **👥 Gestión de Personal**
```
GET    /api/personas          # Listar personas
POST   /api/personas          # Crear persona
GET    /api/personas/:id      # Obtener persona
PUT    /api/personas/:id      # Actualizar persona

GET    /api/docentes          # Listar docentes
POST   /api/docentes          # Crear docente
```

### **📄 Documentos e Identificaciones**
```
GET    /api/personas/:id/documentos     # Documentos de persona
POST   /api/personas/:id/documentos     # Subir documento
GET    /api/personas/:id/identificacion # Identificaciones
POST   /api/personas/:id/identificacion # Subir identificación
```

### **🔍 Digitalización**
```
GET    /api/digitalizacion/estado       # Estado del sistema
GET    /api/digitalizacion/estadisticas # Métricas generales
GET    /api/digitalizacion/buscar       # Búsqueda en documentos
```

### **👔 Administración**
```
GET    /api/roles             # Gestión de roles
GET    /api/users             # Gestión de usuarios
GET    /api/contratos         # Gestión de contratos
```

---

## 🧪 **Testing**

### **Probar la API**

#### **1. Documentación Swagger**
```
http://localhost:4000/api-docs
```

#### **2. Comandos de prueba rápida**
```bash
# Verificar estado del servidor
curl http://localhost:4000/api/auth/ping

# Login (ajustar credenciales) Estos datos podrias cargarlos con los del perfil de JUAN
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sigeled.com", "password": "admin123"}'

# Usar token en requests protegidos
curl -H "Authorization: Bearer TU_TOKEN" \
  http://localhost:4000/api/digitalizacion/estado
```

---

## 🔮 **Funcionalidades Futuras (En Desarrollo)**

### **🤖 Inteligencia Artificial**
- **OCR Automático:** Extracción de texto de documentos
- **Validación IA:** Verificación automática de documentos
- **Clasificación:** Categorización inteligente de archivos

### **🔍 Búsqueda Avanzada**
- **Full-text Search:** Búsqueda semántica en contenido
- **Filtros Dinámicos:** Filtrado avanzado por múltiples criterios
- **Vector Search:** Búsqueda por similaridad de contenido

### **📊 Analytics y Reportes**
- **Dashboard:** Métricas en tiempo real
- **Reportes:** Generación automática de informes
- **Alertas:** Notificaciones inteligentes

---

## 🚦 **Scripts Disponibles**

```bash
npm start              # Iniciar servidor (producción)
npm run dev            # Iniciar con nodemon (desarrollo)
npm test               # Ejecutar tests (cuando estén configurados)
npm run create:admin   # Crear usuario administrador
```

---

## 🐛 **Troubleshooting**

### **Problemas Comunes**

#### **Error de conexión a BD**
```bash
# Verificar variables de entorno
echo $DB_HOST

# Probar conexión manual
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

#### **Error de permisos de archivos**
```bash
# Crear directorio de uploads
mkdir -p uploads
chmod 755 uploads
```

#### **Error de JWT**
```bash
# Verificar que JWT_SECRET esté configurado
echo $JWT_SECRET

# Regenerar secret si es necesario
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📈 **Contribución**

### **Para Desarrolladores**

1. **Fork** el repositorio
2. **Crear branch** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. **Push** al branch: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request**

### **Estándares de Código**
- Usar **ES6+** modules
- **Comentarios JSDoc** en funciones principales
- **Validación Joi** para todos los inputs
- **Manejo de errores** consistente
- **Logs** informativos en operaciones críticas

---

## 🔄 **Changelog**

### **v1.0.0** (Actual)
- ✅ Sistema de autenticación JWT completo
- ✅ CRUD de personas y docentes
- ✅ Gestión de documentos e identificaciones
- ✅ API de digitalización (base)
- ✅ Sistema de roles y permisos
- ✅ Documentación Swagger

### **v1.1.0** (Próximo)
- 🔄 Implementación OCR con Ollama
- 🔄 Validación automática de documentos
- 🔄 Búsqueda semántica avanzada

---

**¡Cualquier duda, pregunten!** 🚀