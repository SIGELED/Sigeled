import express from 'express';
import {
    registrarDatosPersona,
    listarPersonas,
    obtenerPersona
} from '../controllers/persona.Controller.js';
import { verificarToken } from '../middleware/authMiddlware.js';

const personaRouter = express.Router();

// Todas las rutas requieren autenticación
personaRouter.use(verificarToken);

// Crear persona y vincular con usuario
personaRouter.post('/', registrarDatosPersona);

// Obtener todas las personas
personaRouter.get('/', listarPersonas);

// Obtener persona por ID
personaRouter.get('/:id_persona', obtenerPersona);

export default personaRouter;