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
  getPersonaProfile:(id_persona) => api.get(`/persona/${id_persona}/perfiles`),
  deleteProfile: (id_persona, id_perfil) => api.delete(`/persona/${id_persona}/perfiles/${id_perfil}`),
}

export const personaDocService = {
  listarDocumentos: (params = {}) => api.get('/persona-doc', {params}),
  getDocById: (id_persona_doc) => api.get(`/persona-doc/${id_persona_doc}`),
  createDoc: (data) => api.post('/persona-doc', data),
}

export const estadoVerificacionService = {
  getAll: () => api.get('/persona/estados-verificacion'),
}

export const tipoDocService = {
  getAllDocTypes: () => api.get('/persona-doc/tipos-documento'),
}

export const archivoService = {
  uploadForPersona: (id_persona, file) => {
    const form = new FormData();
    form.append('archivo', file);
    return api.post(`/persona/${id_persona}/archivo`, form, {
      headers:{'Content-Type':'multipart/form-data'},
    });
  },
  getSignedUrl: (id_archivo) => api.get(`/archivos/${id_archivo}/signed-url`),
};

export const domicilioService = {
  getDomicilioByPersona: (id_persona) => api.get(`/persona/${id_persona}/domicilio`),
  createDomicilio: (id_persona, data) => api.post(`/persona/${id_persona}/domicilio`, data),
}

export const domOtrosService = {
  getDepartamentos:() => api.get(`/persona/dom/departamentos`),
  getLocalidades:(id_dom_departamento) => api.get(`/persona/dom/departamentos/${id_dom_departamento}/localidades`),
  getBarrios: (id_dom_localidad) => api.get(`/persona/dom/localidades/${id_dom_localidad}/barrios`),
  createBarrio: (id_dom_localidad, data) => api.post(`/persona/dom/localidades/${id_dom_localidad}/barrios`, data),
}

export const personaBarrioService = {
  getBarrioByPersona: (id_persona) => api.get(`/persona/${id_persona}/barrios`),
  assignBarrio: (id_persona, id_dom_barrio) => api.post(`/persona/${id_persona}/barrios`, {id_dom_barrio}),
  unassignBarrio: (id_persona, id_dom_barrio) => api.delete(`/persona/${id_persona}/barrios/${id_dom_barrio}`),
}

export const tituloService = {
  createTitulo:(data) => api.post(`/titulos/`, data),
  findTituloByPersona:(id_persona) => api.get(`/titulos/persona/${id_persona}`),
  getTiposTiulos: () => api.get(`/titulos/tipos`)
}

export default api;