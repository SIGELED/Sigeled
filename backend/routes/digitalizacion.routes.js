import express from 'express';
import { 
    getEstadisticasDigitalizacion, 
    buscarEnDocumentos,
    getEstadoSistemaDigitalizacion 
} from '../controllers/digitalizacion.Controller.js';
import { verificarToken } from '../middleware/authMiddleware.js'; // ← middleware (singular), no middlewares

const digiDocuRouter = express.Router();

digiDocuRouter.use(verificarToken);

/**
 * @swagger
 * /api/digitalizacion/estado:
 *   get:
 *     summary: Verificar estado del sistema de digitalización
 *     tags:
 *       - Digitalización
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado del sistema de digitalización
 */
digiDocuRouter.get('/estado', getEstadoSistemaDigitalizacion);

/**
 * @swagger
 * /api/digitalizacion/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de digitalización
 *     tags:
 *       - Digitalización
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de digitalización
 */
digiDocuRouter.get('/estadisticas', getEstadisticasDigitalizacion);

/**
 * @swagger
 * /api/digitalizacion/buscar:
 *   get:
 *     summary: Buscar en contenido de documentos
 *     tags:
 *       - Digitalización
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: texto
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Texto a buscar
 *       - name: id_persona
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de persona para filtrar
 *       - name: tipo_documento
 *         in: query
 *         schema:
 *           type: string
 *         description: Tipo de documento para filtrar
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
digiDocuRouter.get('/buscar', buscarEnDocumentos);

export default digiDocuRouter;