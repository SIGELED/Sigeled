import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
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

// Funciones para manejar documentos
export const getLegajo = async () => {
  // espera id_persona
  throw new Error('getLegajo requires id_persona parameter');
};

export const uploadDocument = async (formData) => {
  const response = await api.post('/archivos/upload', formData);
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

export const getMisEnviosByPersona = async (id_persona) => {
  const response = await api.get(`/persona-doc/personas/${id_persona}/documentos`);
  return response.data;
};

export default api;