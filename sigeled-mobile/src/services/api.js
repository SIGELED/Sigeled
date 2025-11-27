import axios from 'axios';
import { Platform } from 'react-native';

// Elige baseURL según la plataforma/runtime:
// - Web: usa localhost (por ejemplo cuando ejecutas `expo start --web`)
// - Android emulator (AVD): 10.0.2.2
// - iOS simulator: localhost
// - Dispositivo físico: definir REACT_NATIVE_API_URL en entorno o usar la IP de tu máquina
const DEFAULT_PORT = 4000;
let API_URL = '';

if (Platform.OS === 'web') {
  API_URL = `http://localhost:${DEFAULT_PORT}/api`;
} else if (Platform.OS === 'android') {
  // Emulador Android estándar (AVD) usa 10.0.2.2 para mapear a localhost del host
  API_URL = `http://10.0.2.2:${DEFAULT_PORT}/api`;
} else {
  // iOS simulator y otros casos usan localhost; para dispositivo físico, setea env var
  API_URL = `http://localhost:${DEFAULT_PORT}/api`;
}

// Si el desarrollador definió una variable de entorno `REACT_NATIVE_API_URL`, respetarla
if (typeof process !== 'undefined' && process.env && process.env.REACT_NATIVE_API_URL) {
  API_URL = process.env.REACT_NATIVE_API_URL;
}

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

export const getMisEnviosByPersona = async (id_persona) => {
  const response = await api.get(`/persona-doc/personas/${id_persona}/documentos`);
  return response.data;
};

export default api;