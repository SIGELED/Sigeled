import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL
});

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
  unassignRoleFromUser: (id_usuario, id_rol) => api.delete(`/roles/usuario/${id_usuario}/${id_rol}`),
  getRolesByUser: (userId) => api.get(`/roles/usuario/${userId}`)
}

export const personaService = {
  createPersona:(data) => api.post('/persona', data),
  getPersonaByID:(id_persona) => api.get(`/persona/${id_persona}`),
  buscadorAvanzadoUsuarios: (search, perfil) => {
    const params = {};
    if(search) params.search = search;
    if(perfil) params.perfil = perfil;
    return api.get('/persona/buscar', { params });
  }
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
  listarDocumentos: (id_persona) => api.get(`/persona-doc/personas/${id_persona}/documentos`),
  getDocById: (id_persona_doc) => api.get(`/persona-doc/${id_persona_doc}`),
  createDoc: (data) => api.post('/persona-doc', data),
  cambiarEstado:(id_persona_doc, { id_estado_verificacion, observacion }) =>
    api.patch(`/persona-doc/${id_persona_doc}/estado`, {
      id_estado_verificacion,
      observacion: observacion ?? null,
    }),
  deleteDoc: (id_persona, id_persona_doc) =>
    api.delete(`/persona-doc/personas/${id_persona}/documentos/${id_persona_doc}`)
};

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
    return api.post(`/persona/${id_persona}/archivo`, form);
  },
  getSignedUrl: (id_archivo) => api.get(`/archivos/${id_archivo}/signed-url`),
};

export const domicilioService = {
  getDomicilioByPersona: (id_persona) => api.get(`/persona/${id_persona}/domicilio`),
  createDomicilio: (id_persona, data) => api.post(`/persona/${id_persona}/domicilio`, data),
  deleteDomicilio: (id_persona, id_domicilio) => api.delete(`/persona/personas/${id_persona}/domicilios/${id_domicilio}`)
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
  getTiposTitulos: () => api.get(`/titulos/tipos`),
  cambiarEstado: (id_titulo, data) =>
    api.patch(`/titulos/${id_titulo}/estado`, data),
  deleteTitulo:(id_persona, id_titulo) => api.delete(`/titulos/personas/${id_persona}/titulos/${id_titulo}`)
};

export const contratoService = {
  getContratos: (persona) => api.get('/contratos', { params: persona ? { persona } : {} }),
  getMisContratos: () => api.get('/contratos/mis-contratos'),
  getEmpleados: (q = '', page = 1, limit = 50) => api.get('/contratos/empleados', { params: { q, page, limit } }),
  getById: (id) => api.get(`/contratos/${id}`),
  create : (data) => api.post('/contratos/profesor/crear', data),
  remove: (id) => api.delete(`/contratos/${id}`),

  buscarPersonaPorDni: (dni) => api.get(`/contratos/persona/dni/${dni}`),
  getProfesorDetalles: (idPersona) => api.get(`/contratos/profesor/${idPersona}/detalles`),
  getMateriasByCarreraAnio: (idCarrera, idAnio) => api.get(`/contratos/materias`, {params: { idCarrera, idAnio }}),
  getAnios: () => api.get('/contratos/anios'),

  exportarContrato : async (id, format = 'pdf') => {
    const res = await api.get(`/contratos/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: format === 'word'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf'
    });
    const url = URL.createObjectURL(blob);
    return { url, filename: `contrato-${id}.${format === 'word' ? 'docx' : 'pdf'}` };
  },

  getCarreras:() => api.get('/contratos/carreras')
};

export const legajoService = {
  getEstado:   (id_persona) => api.get(`/legajo/${id_persona}/estado`),
  recalcular:  (id_persona) => api.post(`/legajo/persona/${id_persona}/recalcular`),
  setEstado:   (id_persona, codigo) => api.post(`/legajo/${id_persona}/estado`, { codigo }),
  setPlazo:    (id_persona, payload) => api.post(`/legajo/${id_persona}/plazo`, payload),
};

export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin-stats'),
  getDocumentosPendientes: (limit = 5) => api.get('/dashboard/documentos-pendientes', {params: {limit}})
}

export default api;