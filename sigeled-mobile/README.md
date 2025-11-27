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