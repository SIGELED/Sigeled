import { archivoValidator } from '../middleware/archivoValidator.js';
import { subirArchivo } from '../controllers/persona.Controller.js';
import { domicilioValidator } from '../validators/domicilioValidator.js';
import { tituloValidator } from '../validators/tituloValidator.js';
import { identificacionValidator } from '../validators/identificacionValidator.js';
import { validationResult } from 'express-validator';
import express from 'express';
import {
    registrarDatosPersona,
    listarPersonas,
    obtenerPersona,
    obtenerIdentificacion,
    crearIdentificacion,
    obtenerDomicilios,
    crearDomicilio,
    obtenerTitulos,
    crearTitulo
} from '../controllers/persona.Controller.js';
import { verificarToken } from '../middleware/authMiddlware.js';

const personaRouter = express.Router();

// Todas las rutas requieren autenticación
personaRouter.use(verificarToken);

// Ruta para subir archivos comprobatorios
personaRouter.post('/:id_persona/archivo', archivoValidator.single('archivo'), subirArchivo);

// Crear persona y vincular con usuario
personaRouter.post('/', registrarDatosPersona);

// Obtener todas las personas
personaRouter.get('/', listarPersonas);

// Obtener persona por ID
personaRouter.get('/:id_persona', obtenerPersona);

// Endpoint para listar estados de verificación
personaRouter.get('/estados-verificacion', listarEstadosVerificacion);

// Identificación
personaRouter.get('/:id_persona/identificacion', obtenerIdentificacion);
personaRouter.post('/:id_persona/identificacion', crearIdentificacion);
personaRouter.post('/:id_persona/identificacion', identificacionValidator, manejarErroresValidacion, crearIdentificacion);

// Domicilio
personaRouter.get('/:id_persona/domicilio', obtenerDomicilios);
personaRouter.post('/:id_persona/domicilio', crearDomicilio);
personaRouter.post('/:id_persona/domicilio', domicilioValidator, manejarErroresValidacion, crearDomicilio);

// Títulos
personaRouter.get('/:id_persona/titulos', obtenerTitulos);
personaRouter.post('/:id_persona/titulos', crearTitulo);
personaRouter.post('/:id_persona/titulos', tituloValidator, manejarErroresValidacion, crearTitulo);


// Middleware para manejar errores de validación
function manejarErroresValidacion(req, res, next) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}


export default personaRouter;