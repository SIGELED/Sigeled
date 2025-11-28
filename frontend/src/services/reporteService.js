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

export const reporteService = {
  // Informe escalafonario
  getInformeEscalafonario: (id_persona) => 
    api.get(`/reportes/informe-escalafonario/${id_persona}`),
  
  descargarInformeEscalafonarioPDF: async (id_persona, nombreArchivo) => {
    const response = await api.get(`/reportes/informe-escalafonario/${id_persona}/pdf`, {
      responseType: 'blob'
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo || `informe_escalafonario_${id_persona}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response;
  },

  // Estadísticas
  getEstadisticasGenerales: () => 
    api.get('/reportes/estadisticas/generales'),
  
  getEstadisticasContratos: (anio) => 
    api.get('/reportes/estadisticas/contratos', { params: { anio } }),
  
  getEstadisticasTitulos: () => 
    api.get('/reportes/estadisticas/titulos'),
  
  getEstadisticasDocumentos: () => 
    api.get('/reportes/estadisticas/documentos'),

  // Rankings y listados
  getRankingAntiguedad: (limit = 20) => 
    api.get('/reportes/ranking/antiguedad', { params: { limit } }),
  
  getListadoDocentes: (filtros = {}) => 
    api.get('/reportes/docentes/listado', { params: filtros }),
  
  getContratosProximosVencer: (dias = 30) => 
    api.get('/reportes/contratos/proximos-vencer', { params: { dias } }),

  // Documentos digitalizados
  getDocumentosDigitalizados: (filtros = {}) => 
    api.get('/reportes/documentos/digitalizados', { params: filtros }),

  // Resumen completo
  getResumenCompleto: () => 
    api.get('/reportes/resumen-completo')
};

export default reporteService;
