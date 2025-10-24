import express from 'express';
import {
    listarPersonasDocumentos,
    obtenerPersonaDocumento,
    crearPersonaDocumento,
    listarTiposDocumento,
    deleteDocumento
} from '../controllers/personaDoc.Controller.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const personaDocRouter = express.Router();

// Todas las rutas requieren autenticación
personaDocRouter.use(verificarToken);

personaDocRouter.get('/tipos-documento', listarTiposDocumento);

/**
 * @swagger
 * /api/persona-doc:
 *   get:
 *     summary: Obtener todos los documentos de personas
 *     tags:
 *       - PersonaDoc
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos de personas
 */
personaDocRouter.get('/', listarPersonasDocumentos);

/**
 * @swagger
 * /api/persona-doc/{id_persona_doc}:
 *   get:
 *     summary: Obtener documento de persona por ID
 *     tags:
 *       - PersonaDoc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona_doc
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Documento encontrado
 *       404:
 *         description: Documento no encontrado
 */
personaDocRouter.get('/:id_persona_doc', obtenerPersonaDocumento);

/**
 * @swagger
 * /api/persona-doc:
 *   post:
 *     summary: Crear documento de persona
 *     tags:
 *       - PersonaDoc
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_persona:
 *                 type: string
 *                 format: uuid
 *               id_tipo_doc:
 *                 type: integer
 *               id_archivo:
 *                 type: string
 *                 format: uuid
 *               vigente:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Documento creado
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
personaDocRouter.post('/', crearPersonaDocumento);

personaDocRouter.delete('/personas/:id_persona/documentos/:id_persona_doc', deleteDocumento);

export default personaDocRouter;