import express from 'express';
import {
    listarPersonasDocumentos,
    obtenerPersonaDocumento,
    crearPersonaDocumento,
    listarTiposDocumento,
    verificarPersonaDocumento,
    deleteDocumento
} from '../controllers/personaDoc.Controller.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { soloRRHH } from '../middleware/authMiddleware.js';

const personaDocRouter = express.Router();
personaDocRouter.use(verificarToken);

personaDocRouter.get('/tipos-documento', listarTiposDocumento);

personaDocRouter.patch('/:id_persona_doc/estado', soloRRHH, verificarPersonaDocumento);

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
 *           type: integer
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
 *                 type: integer
 *               tipo_documento:
 *                 type: string
 *               numero_documento:
 *                 type: string
 *     responses:
 *       201:
 *         description: Documento creado
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
personaDocRouter.post('/', crearPersonaDocumento);

/**
 * @swagger
 * /api/persona-doc/personas/{id_persona}/documentos/{id_persona_doc}:
 *   delete:
 *     summary: Eliminar documento personal
 *     tags:
 *       - PersonaDoc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID de la persona propietaria del documento
 *       - name: id_persona_doc
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del documento a eliminar
 *     responses:
 *       200:
 *         description: Documento eliminado correctamente
 *       400:
 *         description: Parámetros inválidos o documento no pertenece a la persona
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Documento no encontrado
 */
personaDocRouter.delete('/personas/:id_persona/documentos/:id_persona_doc', deleteDocumento);

export default personaDocRouter;