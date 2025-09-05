import express from 'express';
import {
    listarPersonasDocumentos,
    obtenerPersonaDocumento,
    crearPersonaDocumento
} from '../controllers/personaDoc.Controller.js';
import { verificarToken } from '../middleware/authMiddlware.js';

const personaDocRouter = express.Router();

// Todas las rutas requieren autenticación
personaDocRouter.use(verificarToken);

// Obtener todos los documentos de personas
personaDocRouter.get('/', listarPersonasDocumentos);

// Obtener documento de persona por ID
personaDocRouter.get('/:id_persona_doc', obtenerPersonaDocumento);

// Crear documento de persona
personaDocRouter.post('/', crearPersonaDocumento);

export default personaDocRouter;