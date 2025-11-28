# SIGELED Mobile - App Móvil con Expo

Aplicación móvil para gestión de legajos del personal educativo.

## 📋 Requisitos Previos

- Node.js 18+
- Backend SIGELED corriendo en tu red local
- **Para probar en dispositivo físico**: Expo Go app instalada
- **Para emulador Android**: Android Studio con AVD
- **Para iOS**: macOS con Xcode

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar conexión al backend

**Edita `app.json` y configura la IP de tu PC:**

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://TU_IP_LOCAL:4000/api"
    }
  }
}
```

**Cómo encontrar tu IP local:**
- **Windows**: Ejecuta `ipconfig` en CMD y busca "Dirección IPv4"
- **Mac/Linux**: Ejecuta `ifconfig` o `ip addr`

**Ejemplos:**
- Emulador Android: `http://10.0.2.2:4000/api`
- Dispositivo físico: `http://192.168.1.100:4000/api` (tu IP local)
- iOS Simulator: `http://localhost:4000/api`

### 3. Iniciar la aplicación

```bash
npx expo start
```

- Escanea el QR con **Expo Go** desde tu celular
- O presiona `a` para Android emulator / `i` para iOS simulator

### 4. Asegúrate que el backend esté corriendo

```bash
cd ../backend
npm run dev
```

Verifica que esté en `http://localhost:4000`

## ✅ Funcionalidades Implementadas

### Autenticación y Seguridad
- ✅ Login y registro de usuarios
- ✅ Persistencia de sesión con SecureStore (encriptado)
- ✅ Validación de JWT antes de cada request
- ✅ Detección automática de token expirado
- ✅ Logout automático al expirar (1 hora)
- ✅ Verificación periódica de sesión (cada minuto)
- ✅ Protección de rutas con `navigation.reset()`

### Mi Legajo
- ✅ Visualización de datos personales completos
  - Nombre, email, teléfono
  - DNI y CUIL
  - Domicilio(s)
- ✅ Lista de documentos subidos (DNI, domicilio, CV, etc.)
- ✅ Lista de títulos académicos
- ✅ **Cache offline**: Ver legajo sin conexión
- ✅ **Pull-to-refresh**: Desliza para actualizar
- ✅ Banner indicador de datos offline/cacheados

### Subir Documentos
- ✅ Selector de tipo de documento (DNI, CUIL, DOM, TIT, CV, CON_SER)
- ✅ Selección de archivos con `expo-document-picker`
- ✅ Validación de tamaño (10MB máximo)
- ✅ Barra de progreso durante la subida
- ✅ Preview de imágenes antes de subir
- ✅ Integración con Supabase Storage

### Visualizar Documentos
- ✅ Ver archivos PDF e imágenes
- ✅ URLs firmadas temporales de Supabase
- ✅ Apertura con visor del sistema (`Linking`)

### Tema y UX
- ✅ Tema SIGELED (#030C14, #19F124, #101922)
- ✅ Navegación con 2 pestañas (Mi Legajo, Subir Documento)
- ✅ Indicadores de carga y estados vacíos
- ✅ Manejo de errores con mensajes claros


# Sigeled Mobile

## 📂 Estructura del Proyecto

```
sigeled-mobile/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   └── DocumentList.jsx # Lista de documentos/títulos
│   ├── context/             # Context API
│   │   └── AuthContext.jsx  # Manejo de autenticación
│   ├── hooks/               # Custom hooks
│   │   └── useLegajoCache.js # Cache offline del legajo
│   ├── navigation/          # Configuración de navegación
│   │   ├── AppNavigator.js  # Navegador principal
│   │   ├── AuthNavigator.js # Stack de autenticación
│   │   └── MainTabNavigator.js # Pestañas principales
│   ├── screens/             # Pantallas
│   │   ├── Auth/
│   │   │   ├── LoginScreen.jsx
│   │   │   └── RegistroUsuario.jsx
│   │   ├── MiLegajo/
│   │   │   └── MiLegajoScreen.jsx
│   │   └── SubirDocumento/
│   │       └── SubirDocumentoScreen.jsx
│   ├── services/            # Servicios API
│   │   └── api.js           # Cliente axios + endpoints
│   ├── theme/               # Estilos globales
│   │   └── colors.js        # Colores SIGELED
│   └── utils/               # Utilidades
│       ├── storage.js       # Wrapper SecureStore
│       └── jwtHelper.js     # Decodificación y validación JWT
├── app.json                 # Config Expo (incluye apiUrl)
└── package.json             # Dependencias
```

## 🛠️ Tecnologías Utilizadas

- **Expo SDK 54** - Framework React Native
- **React Navigation 6** - Navegación
- **Axios** - Peticiones HTTP con interceptores
- **Expo SecureStore** - Almacenamiento encriptado de tokens
- **AsyncStorage** - Cache de datos offline
- **expo-document-picker** - Selección de archivos
- **Ionicons** - Iconos
- **JWT** - Autenticación con tokens

## 🔧 Solución de Problemas

### La app no conecta al backend

1. **Verifica la IP en `app.json`**: Debe ser tu IP local (no `localhost`)
2. **Mismo WiFi**: Backend y celular deben estar en la misma red
3. **Firewall**: Permite conexiones al puerto 4000
4. **Reinicia Expo**: `npx expo start -c` (limpia cache)

### Error 401 al usar la app

- El token JWT expiró (duración: 1 hora)
- Cierra sesión y vuelve a iniciar
- Verifica que el backend esté corriendo

### Archivos no se ven

- Verifica configuración de Supabase en el backend
- El bucket debe estar configurado correctamente
- Revisa logs del backend para ver errores

### Limpiar cache y reinstalar

```bash
npx expo start -c
# o
rm -rf node_modules package-lock.json
npm install
```

## 🔐 Variables de Entorno

La configuración de la API se hace en `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:4000/api"
    }
  }
}
```

## 📱 Probado en

- ✅ Android 12+ (emulador y físico)
- ✅ Expo Go app
- ⚠️ iOS (requiere macOS para probar)

## 👨‍💻 Desarrollo

Ver el [README principal](../README.md) para instrucciones completas de desarrollo del proyecto completo.