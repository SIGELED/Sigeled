import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isTokenExpired, isTokenExpiringSoon, getTimeUntilExpiry } from '../utils/jwtHelper';

// Elige baseURL según la plataforma/runtime:
// Si está definido en app.json (extra.apiUrl), úsalo
// Sino, usa valores por defecto según plataforma
const DEFAULT_PORT = 4000;
let API_URL = '';

// Prioridad 1: Variable de entorno desde app.json
if (Constants.expoConfig?.extra?.apiUrl) {
  API_URL = Constants.expoConfig.extra.apiUrl;
} else {
  // Prioridad 2: Valores por defecto según plataforma
  if (Platform.OS === 'web') {
    API_URL = `http://localhost:${DEFAULT_PORT}/api`;
  } else if (Platform.OS === 'android') {
    // Emulador Android usa 10.0.2.2
    API_URL = `http://10.0.2.2:${DEFAULT_PORT}/api`;
  } else {
    // iOS simulator usa localhost
    API_URL = `http://localhost:${DEFAULT_PORT}/api`;
  }
}

console.log('[API] Using baseURL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    // Si ya hay un token en headers.common, asegurarse que se incluya
    const token = api.defaults.headers.common['Authorization'];
    
    if (token) {
      // Extraer el token sin el prefijo 'Bearer '
      const cleanToken = token.replace('Bearer ', '');
      
      // Verificar si el token ha expirado
      if (isTokenExpired(cleanToken)) {
        console.error('[API] Token expirado antes de hacer request');
        
        // Limpiar token
        const storage = (await import('../utils/storage')).default;
        await storage.deleteItem('userToken');
        await storage.deleteItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        // Rechazar la petición
        return Promise.reject(new Error('Token expirado'));
      }
      
      // Advertir si el token expirará pronto
      if (isTokenExpiringSoon(cleanToken)) {
        const timeRemaining = getTimeUntilExpiry(cleanToken);
        console.warn(`[API] Token expirará en ${Math.floor(timeRemaining / 60)} minutos`);
      }
      
      // Agregar token al header
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = token;
      }
    }
    
    console.log('[API Request]', config.method?.toUpperCase(), config.url, {
      hasAuth: !!config.headers['Authorization'],
      contentType: config.headers['Content-Type']
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('[API Error]', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    
    // Si recibimos 401 (no autorizado), el token es inválido o expiró
    if (error.response?.status === 401) {
      console.warn('[API] Token inválido o expirado, limpiando sesión...');
      // Importar storage dinámicamente para evitar dependencias circulares
      const storage = (await import('../utils/storage')).default;
      
      // Limpiar token y usuario almacenados
      await storage.deleteItem('userToken');
      await storage.deleteItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Nota: El AuthContext debería detectar esto y redirigir al login
      console.warn('[API] Sesión limpiada. El usuario necesita volver a iniciar sesión.');
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('[API] Token configurado');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('[API] Token eliminado');
  }
};

// Funciones de autenticación
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const registerFull = async (userData) => {
  const response = await api.post('/auth/register-full', userData);
  return response.data;
};


// Funciones para manejar documentos
export const getLegajo = async () => {
  // espera id_persona
  throw new Error('getLegajo requires id_persona parameter');
};

export const uploadDocument = async (formData) => {
  const response = await api.post('/archivos/upload', formData);
  return response.data;
};

// Nueva función para subir archivos con progreso
export const uploadFile = async (formData, onProgress) => {
  console.log('[uploadFile] Subiendo archivo');
  console.log('[uploadFile] Headers actuales:', api.defaults.headers.common);

  const response = await api.post('/archivos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Asegurar que el token se incluya explícitamente
      ...(api.defaults.headers.common['Authorization'] && {
        'Authorization': api.defaults.headers.common['Authorization']
      })
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = progressEvent.loaded / progressEvent.total;
        onProgress(progress);
      }
    },
  });

  console.log('[uploadFile] Respuesta exitosa:', response.data);
  return response.data;
};

export const getMisEnvios = async () => {
  // espera id_persona
  throw new Error('getMisEnvios requires id_persona parameter');
};

export const getLegajoByPersona = async (id_persona) => {
  const response = await api.get(`/legajo/${id_persona}/estado`);
  return response.data;
};

export const getPersonaById = async (id_persona) => {
  const response = await api.get(`/persona/${id_persona}`);
  return response.data;
};

export const getTitulosByPersona = async (id_persona) => {
  const response = await api.get(`/persona/${id_persona}/titulos`);
  return response.data;
};

export const getDocumentosByPersona = async (id_persona) => {
  const response = await api.get(`/persona-doc/personas/${id_persona}/documentos`);
  return response.data;
};

export const getTiposDocumento = async () => {
  const response = await api.get('/persona-doc/tipos-documento');
  return response.data;
};

export const vincularDocumento = async (data) => {
  const response = await api.post('/persona-doc', data);
  return response.data;
};

export const getSignedUrl = async (id_archivo) => {
  const response = await api.get(`/archivos/${id_archivo}/signed-url`);
  return response.data;
};

// Obtener identificación (DNI, CUIL)
export const getIdentificacionByPersona = async (id_persona) => {
  const response = await api.get(`/persona/${id_persona}/identificacion`);
  return response.data;
};

// Obtener domicilios
export const getDomiciliosByPersona = async (id_persona) => {
  const response = await api.get(`/persona/${id_persona}/domicilio`);
  return response.data;
};

// Obtener contratos del usuario autenticado
export const getMisContratos = async () => {
  const response = await api.get('/contratos/mis-contratos');
  return response.data;
};

// Obtener notificaciones del usuario autenticado
export const getMisNotificaciones = async () => {
  const response = await api.get('/notificaciones/mis-notificaciones');
  return response.data;
};

// Marcar notificación como leída
export const marcarNotificacionLeida = async (id_notificacion) => {
  const response = await api.patch(`/notificaciones/${id_notificacion}/leido`);
  return response.data;
};

// === DOMICILIOS ===
export const createDomicilio = async (id_persona, domicilioData) => {
  const response = await api.post(`/persona/${id_persona}/domicilio`, domicilioData);
  return response.data;
};

export const getLocalidades = async () => {
  const response = await api.get('/domicilio/localidades');
  return response.data;
};

export const getBarriosByLocalidad = async (id_localidad) => {
  const response = await api.get(`/domicilio/localidades/${id_localidad}/barrios`);
  return response.data;
};

export const createBarrio = async (id_localidad, barrioData) => {
  const response = await api.post(`/domicilio/localidades/${id_localidad}/barrios`, barrioData);
  return response.data;
};

export const assignBarrioToPersona = async (id_persona, id_barrio) => {
  const response = await api.post(`/persona/${id_persona}/barrio`, { id_dom_barrio: id_barrio });
  return response.data;
};

// === TÍTULOS ===
export const getTiposTitulo = async () => {
  const response = await api.get('/persona-titu/tipos-titulo');
  return response.data;
};

export const createTitulo = async (tituloData) => {
  const response = await api.post('/persona-titu', tituloData);
  return response.data;
};

// === LEGAJO ===
export const recalcularLegajo = async (id_persona) => {
  const response = await api.post(`/legajo/${id_persona}/recalcular`);
  return response.data;
};

export default api;