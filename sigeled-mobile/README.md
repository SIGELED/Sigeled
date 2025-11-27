# SIGELED - Mobile (Expo)

Este directorio contiene la app móvil creada con Expo. Aquí tienes pasos claros para que otro desarrollador ponga en marcha la parte mobile en su máquina.

Requisitos previos
- Node.js (>=16/18 recomendado)
- npm o yarn
- Expo CLI (opcional): `npm install -g expo-cli` (no es obligatorio si usas `npx expo`)
- Android Studio (AVD) o un dispositivo físico / iOS simulator si trabajas en macOS
- Backend corriendo localmente (ver nota abajo)

Resumen rápido
- Branch: `feat/mobile-expo` (la rama con los cambios del mobile)

1) Obtener la rama y dependencias

```bash
# desde la raíz del repo
git fetch origin
git checkout feat/mobile-expo

# instalar dependencias del mobile
cd sigeled-mobile
npm install
```

2) Dependencias nativas que recomienda instalar (Expo instala muchas automáticamente):

```bash
npx expo install expo-secure-store expo-document-picker react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs axios
```

3) Variables de entorno / `baseURL`
- La app detecta automáticamente la URL del backend según la plataforma:
	- Web: `http://localhost:4000/api`
	- Android emulator (AVD): `http://10.0.2.2:4000/api`
	- iOS simulator: `http://localhost:4000/api`

Si usas un dispositivo físico debes definir la variable `REACT_NATIVE_API_URL` apuntando a la IP de tu PC. Ejemplo (bash):

```bash
REACT_NATIVE_API_URL='http://192.168.x.x:4000/api' npx expo start -c
```

En PowerShell (Windows):

```powershell
$env:REACT_NATIVE_API_URL = 'http://192.168.x.x:4000/api'
npx expo start -c
```

4) Ejecutar el backend (en otra terminal)
- Desde `e:/Proyectos/Sigeled/backend` (asegurate de tener el `.env` con las credenciales locales):

```bash
cd ../backend
npm install
npm run dev
# Verifica: curl http://localhost:4000/ping
```

5) Arrancar la app (Expo)

```bash
# en sigeled-mobile
npx expo start -c
# Luego abre en el emulador Android, en un dispositivo físico o en web (u)
```

6) Probar login
- Usa el login en la app con credenciales de un usuario existente (por ejemplo el admin que ya probaste).
- En la pantalla de Login hay un botón `Debug: mostrar auth almacenado` que muestra si el token/user se guardaron correctamente.

7) Notas importantes
- No subas archivos sensibles (.env) al repo. El `.gitignore` de la raíz ya excluye `.env` y `node_modules`.
- En Android emulator usa `10.0.2.2` para apuntar al localhost del host.
- Si no ves logs en web, abre la consola del navegador (F12 → Console). En iOS/Android abre la consola de Metro o usa `adb logcat`.
- Para limpiar cachés: `npx expo start -c` o borra `node_modules` y `package-lock.json` y vuelve a `npm install`.
- En Windows verás warnings LF→CRLF; no impiden funcionamiento. Para normalizar podemos añadir `.gitattributes` más adelante.

8) Subida de archivos / endpoints
- El flujo de subida (signed URLs / Supabase) está parcialmente implementado; revisar `src/screens/SubirDocumento` y `src/services/api.js`. Si el backend está en otro host, setear `REACT_NATIVE_API_URL` como indicado.

9) Contribuir / flujo de trabajo
- Crea una rama `feat/mobile-<descripción>` a partir de `feat/mobile-expo` para tus cambios.
- Abre PR contra `feat/mobile-expo` o `main` según coordinación del equipo.

Si necesitás, genero un `README.md` en la raíz con pasos para levantar backend + mobile juntos.

Contacto rápido
- Si algo falla pega aquí la salida de `npx expo start -c` y del backend (`npm run dev`) y yo te ayudo a depurarlo.

## Implementado (qué ya está en esta rama)

Esta lista describe lo ya desarrollado en `feat/mobile-expo` para que el siguiente desarrollador sepa por dónde continuar:

- Proyecto Expo inicializado en `sigeled-mobile`.
- Configuración de navegación con `@react-navigation` (stack + bottom-tabs).
- Cliente HTTP con `axios` en `src/services/api.js` y helper `setAuthToken`.
- Manejo de `baseURL` adaptativo por plataforma (web / android emulator / iOS) y soporte de `REACT_NATIVE_API_URL`.
- `AuthContext` en `src/context/AuthContext.jsx` con `login` y `logout`.
- Persistencia segura de token y user: `expo-secure-store` en nativo y `localStorage` en web (wrapper en `src/utils/storage.js`).
- Pantalla de `Login` (`src/screens/Auth/LoginScreen.jsx`) que usa `/api/auth/login`, muestra estado y debug para SecureStore.
- Pantallas básicas: `Mi Legajo`, `Mis Envíos` y `Subir Documento` (esqueleto) actualizadas para usar los helpers de `api` y `user.id_persona`.
- Helpers específicos: `getLegajoByPersona`, `getMisEnviosByPersona`, y `uploadDocument` (placeholder) en `src/services/api.js`.
- Wrapper de almacenamiento `src/utils/storage.js` para unificar `SecureStore` y `localStorage`.
- Pequeñas mejoras de UX/debug: mensajes visibles en login, botón debug para inspeccionar storage, y guardado/restore del estado auth.
- `.gitignore` agregado en la raíz para excluir `node_modules`, `.env` y artefactos de Expo.
- `sigeled-mobile/README.md` (este archivo) con instrucciones de arranque y notas de desarrollo.

Partes pendientes / recomendadas para el siguiente desarrollador:

- Completar flujo de subida de archivos (signed URLs con Supabase o upload multipart al backend) y mostrar progreso/errores.
- Implementar apertura/visualización de documentos en móvil (Linking / WebView / descarga temporal).
- Mejorar protección de rutas y flujo post-login (`navigation.reset()` o control más robusto de rutas protegidas).
- Añadir cache del último legajo en `storage` para experiencia offline mínima.
- Añadir refresh token o manejo de expiración del JWT si es necesario.
- Escribir README de la raíz con pasos integrados para backend + mobile (opcional, puedo hacerlo).

---

Si querés que genere tickets o tareas concretas para cualquiera de los pendientes, puedo desglosarlas y empezar por la prioridad que elijas.


# Sigeled Mobile

## Descripción
Sigeled Mobile es una aplicación móvil desarrollada con Expo que permite a los usuarios gestionar su legajo, subir documentos y consultar el estado de sus envíos. La aplicación incluye un sistema de autenticación y una navegación fluida entre las diferentes secciones.

## Estructura del Proyecto
El proyecto está organizado en varias carpetas y archivos, cada uno con una función específica:

- **App.js**: Punto de entrada de la aplicación, configura el entorno de Expo y establece el sistema de navegación.
- **app.json**: Configuración de la aplicación Expo, incluyendo nombre, icono y otras propiedades necesarias para la compilación.
- **package.json**: Configuración del proyecto para npm, lista de dependencias y scripts.
- **babel.config.js**: Configuración de Babel para utilizar características modernas de JavaScript.

## Navegación
La aplicación utiliza React Navigation para gestionar la navegación entre pantallas:

- **src/navigation/AppNavigator.js**: Configura la navegación principal de la aplicación.
- **src/navigation/AuthNavigator.js**: Maneja la navegación relacionada con la autenticación (inicio de sesión y registro).
- **src/navigation/MainTabNavigator.js**: Configura la navegación de pestañas principales.

## Pantallas
La aplicación incluye las siguientes pantallas:

- **src/screens/Auth/LoginScreen.jsx**: Formulario de inicio de sesión.
- **src/screens/Auth/RegisterScreen.jsx**: Formulario de registro de usuarios.
- **src/screens/MiLegajo/MiLegajoScreen.jsx**: Muestra los datos personales y documentos del usuario.
- **src/screens/SubirDocumento/SubirDocumentoScreen.jsx**: Formulario para subir documentos.
- **src/screens/MisEnvios/MisEnviosScreen.jsx**: Muestra el estado de los envíos del usuario.

## Componentes
La aplicación incluye varios componentes reutilizables:

- **Header.jsx**: Cabecera de las pantallas.
- **DocumentList.jsx**: Lista de documentos.
- **DocumentItem.jsx**: Elemento individual en la lista de documentos.
- **UploadButton.jsx**: Botón para subir documentos.
- **LoadingIndicator.jsx**: Indicador de carga.

## Contexto y Hooks
- **src/context/AuthContext.jsx**: Maneja el estado de autenticación.
- **src/hooks/useAuth.js**: Hook personalizado para facilitar el manejo de la autenticación.

## Servicios
- **src/services/api.js**: Funciones para realizar solicitudes HTTP.

## Validaciones
- **src/utils/validators.js**: Funciones de validación para formularios.

## Estilos
- **src/styles/theme.js**: Define los estilos y temas utilizados en la aplicación.

## Fuentes
- **assets/fonts/README.md**: Información sobre las fuentes utilizadas en la aplicación.

## Instalación
Para instalar las dependencias del proyecto, ejecuta:

```
npm install
```

## Ejecución
Para iniciar la aplicación en modo de desarrollo, utiliza:

```
npm start
```

Esto abrirá una nueva ventana en tu navegador donde podrás escanear el código QR con la aplicación Expo Go en tu dispositivo móvil.