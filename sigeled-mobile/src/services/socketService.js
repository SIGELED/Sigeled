import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_PORT = 4000;

// Determinar la URL base del socket (sin el /api)
let SOCKET_URL = '';

if (Constants.expoConfig?.extra?.apiUrl) {
  // Extraer la URL base quitando /api del final
  const apiUrl = Constants.expoConfig.extra.apiUrl;
  SOCKET_URL = apiUrl.replace('/api', '');
} else {
  // Valores por defecto según plataforma
  if (Platform.OS === 'web') {
    SOCKET_URL = `http://localhost:${DEFAULT_PORT}`;
  } else if (Platform.OS === 'android') {
    SOCKET_URL = `http://10.0.2.2:${DEFAULT_PORT}`;
  } else {
    SOCKET_URL = `http://localhost:${DEFAULT_PORT}`;
  }
}

console.log('[SocketService] Using Socket URL:', SOCKET_URL);

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Conectar al servidor WebSocket con autenticación
   * @param {string} token - Token JWT para autenticación
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('[SocketService] Ya hay una conexión activa');
      return;
    }

    console.log('[SocketService] Conectando al servidor...');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Preferir websocket, fallback a polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.setupEventListeners();
  }

  /**
   * Configurar listeners de eventos del socket
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[SocketService] ✓ Conectado al servidor', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[SocketService] ✗ Desconectado del servidor:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Error de conexión:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('[SocketService] Error del socket:', error);
    });

    // Listener para nuevas notificaciones
    this.socket.on('nueva_notificacion', (notificacion) => {
      console.log('[SocketService] Nueva notificación recibida:', notificacion);
      this.emit('nueva_notificacion', notificacion);
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      console.log('[SocketService] Desconectando...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Registrar un listener para un evento
   * @param {string} event - Nombre del evento
   * @param {function} callback - Función callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Eliminar un listener de un evento
   * @param {string} event - Nombre del evento
   * @param {function} callback - Función callback a eliminar
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emitir un evento a los listeners locales
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos del evento
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SocketService] Error en listener de ${event}:`, error);
        }
      });
    }
  }

  /**
   * Enviar un evento al servidor
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos a enviar
   */
  send(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[SocketService] No se puede enviar, socket no conectado');
    }
  }

  /**
   * Obtener el estado de conexión
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Exportar una instancia única (singleton)
const socketService = new SocketService();
export default socketService;
