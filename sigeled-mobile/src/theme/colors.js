// Paleta de colores de SIGELED - Sincronizada con el frontend web
export const colors = {
  // Fondos
  background: {
    primary: '#030C14',      // Fondo principal
    secondary: '#101922',    // Fondo secundario (sidebar, cards)
    tertiary: '#0C1A27',     // Fondo alternativo
    input: '#0E1F30',        // Fondo de inputs
    hover: '#1a2735',        // Estado hover
    card: '#21303f',         // Cards hover
  },
  
  // Color principal (verde neón)
  primary: {
    main: '#19F124',         // Verde neón principal
    light: '#3af743',        // Verde más claro (hover)
    dark: '#15cc1f',         // Verde más oscuro
    opacity: 'rgba(25, 241, 36, 0.6)', // Verde con opacidad
  },
  
  // Textos
  text: {
    primary: '#FFFFFF',      // Blanco
    secondary: 'rgba(255, 255, 255, 0.8)', // Blanco 80%
    tertiary: 'rgba(255, 255, 255, 0.5)',  // Blanco 50%
    placeholder: 'rgba(255, 255, 255, 0.5)', // Placeholder
    disabled: 'rgba(255, 255, 255, 0.3)',   // Deshabilitado
  },
  
  // Estados
  status: {
    success: '#19F124',      // Éxito (mismo que primary)
    error: '#f48383',        // Error
    errorText: '#0a0000',    // Texto de error
    warning: '#ffa726',      // Advertencia
    info: '#29b6f6',         // Información
  },
  
  // Bordes y divisores
  border: {
    primary: '#19F124',      // Borde principal
    secondary: 'rgba(255, 255, 255, 0.1)', // Divisores
    input: 'rgba(255, 255, 255, 0.2)',     // Borde de inputs
  },
  
  // Scrollbar
  scrollbar: {
    track: '#2f4a60',
    thumb: '#030C14',
  },
};

export default colors;
