import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout:() =>{
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

export const userService = {
  getUsuarios: () => api.get('/users'),
  getUsuarioById: (id) => api.get(`/users/${id}`),
  createUsuario: (data) => api.post('/users',data),
  updateUsuario: (id, data) => api.put(`/users/${id}`, data),
  toggleUsuario: (id) => api.put(`/users/${id}/toggle`)
};

export const roleService = {
  getRoles: () => api.get(`/roles`),
  createRole: (data) => api.post('/roles', data),
  deleteRole: (id) => api.delete(`/roles/${id}`),

  assignRoleToUser:(id_usuario, id_rol, asignado_por) =>
    api.post(`/roles/usuario/asignar`, {id_usuario, id_rol, asignado_por}),
  getRolesByUser: (userId) => api.get(`/roles/usuario/${userId}`)
}

export const personaService = {
  createPersona:(data) => api.post('/persona', data),
  getPersonaByID:(id_persona) => api.get(`/persona/${id_persona}`),
};

export const identificationService = {
  createIdentificacion:(id_persona, data) => api.post(`/persona/${id_persona}/identificacion`, data),
  getIdentificaciones:(id_persona) => api.get(`/persona/${id_persona}/identificacion`),
}

export const profileService = {
  getProfiles:() => api.get('/persona/perfiles'),
  assignProfile:(id_persona, id_perfil) =>
    api.post(`/persona/asignar-perfil`, {id_persona, id_perfil}),
  getPersonaProfile:(id_persona) => api.get(`/persona/${id_persona}/perfiles`)
}

export default api;