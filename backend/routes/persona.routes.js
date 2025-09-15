import { archivoValidator } from '../middleware/archivoValidator.js';
import { subirArchivo, asignarTipoEmpleado, listarEstadosVerificacion } from '../controllers/persona.Controller.js';
import { domicilioValidator } from '../validators/domicilioValidator.js';
import { tituloValidator } from '../validators/tituloValidator.js';
import { identificacionValidator } from '../validators/identificacionValidator.js';
import { validationResult } from 'express-validator';
import { manejarErroresValidacion } from '../middleware/personaMiddleware.js';  
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
import { verificarToken, soloRRHH } from '../middleware/authMiddlware.js';
import { buscarPersonasAvanzado } from '../controllers/persona.Controller.js';


const personaRouter = express.Router();

// Todas las rutas requieren autenticación
personaRouter.use(verificarToken);

/**
 * @swagger
 * /api/persona/{id_persona}/archivo:
 *   post:
 *     summary: Subir archivo comprobatorio para una persona
 *     tags:
 *       - Persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido correctamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
personaRouter.post('/:id_persona/archivo', archivoValidator.single('archivo'), subirArchivo);

/**
 * @swagger
 * /api/persona:
 *   post:
 *     summary: Registrar datos personales y vincular con usuario
 *     tags:
 *       - Persona
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               sexo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Persona registrada
 *       400:
 *         description: Datos faltantes
 *       500:
 *         description: Error interno
 */
personaRouter.post('/', registrarDatosPersona);

/**
 * @swagger
 * /api/persona:
 *   get:
 *     summary: Listar todas las personas
 *     tags:
 *       - Persona
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personas
 */
personaRouter.get('/', listarPersonas);

/**
 * @swagger
 * /api/persona/{id_persona}:
 *   get:
 *     summary: Obtener persona por ID
 *     tags:
 *       - Persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la persona
 *       404:
 *         description: Persona no encontrada
 */
personaRouter.get('/:id_persona', obtenerPersona);

/**
 * @swagger
 * /api/persona/estados-verificacion:
 *   get:
 *     summary: Listar estados de verificación
 *     tags:
 *       - Persona
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados de verificación
 */
personaRouter.get('/estados-verificacion', soloRRHH, listarEstadosVerificacion);

/**
 * @swagger
 * /api/persona/asignar-tipo:
 *   put:
 *     summary: Asignar tipo de empleado a una persona (solo RRHH/Admin)
 *     tags:
 *       - Persona
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
 *               id_tipo_empleado:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tipo de empleado asignado correctamente
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno
 */
personaRouter.put('/asignar-tipo', soloRRHH, asignarTipoEmpleado);

/**
 * @swagger
 * /api/persona/{id_persona/identificacion}:
 *   get:
 *     summary: Obtener identificaciones de una persona
 *     tags:
 *       - Identificacion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de identificaciones
 */
personaRouter.get('/:id_persona/identificacion', obtenerIdentificacion);

/**
 * @swagger
 * /api/persona/{id_persona}/identificacion:
 *   post:
 *     summary: Crear identificación para una persona
 *     tags:
 *       - Identificacion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_doc:
 *                 type: string
 *               numero:
 *                 type: string
 *     responses:
 *       201:
 *         description: Identificación creada
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
personaRouter.post('/:id_persona/identificacion', identificacionValidator, manejarErroresValidacion, crearIdentificacion);

/**
 * @swagger
 * /api/persona/{id_persona}/domicilio:
 *   get:
 *     summary: Obtener domicilios de una persona
 *     tags:
 *       - Domicilio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de domicilios
 */
personaRouter.get('/:id_persona/domicilio', obtenerDomicilios);

/**
 * @swagger
 * /api/persona/{id_persona}/domicilio:
 *   post:
 *     summary: Crear domicilio para una persona
 *     tags:
 *       - Domicilio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direccion:
 *                 type: string
 *               localidad:
 *                 type: string
 *               provincia:
 *                 type: string
 *     responses:
 *       201:
 *         description: Domicilio creado
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
personaRouter.post('/:id_persona/domicilio', domicilioValidator, manejarErroresValidacion, crearDomicilio);

/**
 * @swagger
 * /api/persona/{id_persona}/titulos:
 *   get:
 *     summary: Obtener títulos de una persona
 *     tags:
 *       - Titulo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de títulos
 */
personaRouter.get('/:id_persona/titulos', obtenerTitulos);

/**
 * @swagger
 * /api/persona/{id_persona}/titulos:
 *   post:
 *     summary: Crear título para una persona
 *     tags:
 *       - Titulo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_titulo:
 *                 type: string
 *               institucion:
 *                 type: string
 *               fecha_obtencion:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Título creado
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
personaRouter.post('/:id_persona/titulos', tituloValidator, manejarErroresValidacion, crearTitulo);

/**
 * @swagger
 * /api/persona/buscar:
 *   get:
 *     summary: Buscador avanzado de personal (solo RRHH/Admin)
 *     tags:
 *       - Persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nombre
 *         in: query
 *         schema:
 *           type: string
 *       - name: apellido
 *         in: query
 *         schema:
 *           type: string
 *       - name: dni
 *         in: query
 *         schema:
 *           type: string
 *       - name: tipo_empleado
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados del buscador avanzado
 */
personaRouter.get('/buscar', soloRRHH, buscarPersonasAvanzado);


export default personaRouter;