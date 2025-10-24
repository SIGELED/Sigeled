// ...existing code...
import express from 'express';
import * as ctrl from '../controllers/personaDomi.Controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { verificarRolMinimo } from '../middleware/permisosMiddleware.js';

const PersonaDomiRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Domicilios
 *     description: Endpoints para gestión de domicilios
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Departamento:
 *       type: object
 *       properties:
 *         id_dom_departamento:
 *           type: integer
 *         departamento:
 *           type: string
 *
 *     Localidad:
 *       type: object
 *       properties:
 *         id_dom_localidad:
 *           type: integer
 *         localidad:
 *           type: string
 *         id_dom_departamento:
 *           type: integer
 *         codigo_postal:
 *           type: integer
 *
 *     Barrio:
 *       type: object
 *       properties:
 *         id_dom_barrio:
 *           type: integer
 *         barrio:
 *           type: string
 *         manzana:
 *           type: string
 *         casa:
 *           type: string
 *         departamento:
 *           type: string
 *         piso:
 *           type: string
 *         id_dom_localidad:
 *           type: integer
 *
 *     DomicilioInput:
 *       type: object
 *       properties:
 *         calle:
 *           type: string
 *         altura:
 *           type: integer
 *         barrio:
 *           oneOf:
 *             - $ref: '#/components/schemas/Barrio'
 *             - type: object
 *               properties:
 *                 id_dom_barrio:
 *                   type: integer
 *       required:
 *         - calle
 *
 *     Domicilio:
 *       allOf:
 *         - $ref: '#/components/schemas/DomicilioInput'
 *         - type: object
 *           properties:
 *             id_domicilio:
 *               type: integer
 *             id_persona:
 *               type: string
 *             barrio_nombre:
 *               type: string
 *             localidad:
 *               type: string
 *             codigo_postal:
 *               type: integer
 */

/**
 * @swagger
 * /domicilios:
 *   get:
 *     summary: Listar todos los domicilios (LECTURA)
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de domicilios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Domicilio'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado
 */
PersonaDomiRouter.get('/domicilios', authMiddleware, verificarRolMinimo(3),  ctrl.listAllDomicilios);

/**
 * @swagger
 * /domicilios/dni/{dni}:
 *   get:
 *     summary: Buscar domicilios por DNI
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: dni
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento
 *     responses:
 *       200:
 *         description: Domicilios encontrados
 *       400:
 *         description: DNI requerido
 *       403:
 *         description: Acceso denegado
 */
PersonaDomiRouter.get('/domicilios/dni/:dni', authMiddleware, verificarRolMinimo(3), ctrl.getDomiciliosByDni);

/**
 * @swagger
 * /personas/{id_persona}/domicilios:
 *   get:
 *     summary: Listar domicilios de una persona
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la persona
 *     responses:
 *       200:
 *         description: Domicilios de la persona
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado (si no es propietario)
 */
PersonaDomiRouter.get('/personas/:id_persona/domicilios', authMiddleware, ctrl.listByPersona );

/**
 * @swagger
 * /domicilios/{id_domicilio}:
 *   get:
 *     summary: Obtener un domicilio por id
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_domicilio
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Domicilio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domicilio'
 *       404:
 *         description: No encontrado
 */
PersonaDomiRouter.get('/domicilios/:id_domicilio', authMiddleware, ctrl.getDomicilio );

/**
 * @swagger
 * /departamentos:
 *   get:
 *     summary: Listar departamentos (para poblar select)
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de departamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Departamento'
 */
PersonaDomiRouter.get('/departamentos', authMiddleware, ctrl.listDepartamentos);

/**
 * @swagger
 * /localidades:
 *   get:
 *     summary: Listar localidades por departamento
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: departamentoId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: id_dom_departamento
 *     responses:
 *       200:
 *         description: Localidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Localidad'
 *       400:
 *         description: departamentoId requerido
 */
PersonaDomiRouter.get('/localidades', authMiddleware, ctrl.listLocalidades); // ?departamentoId=

/**
 * @swagger
 * /barrios:
 *   get:
 *     summary: Listar barrios por localidad
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: localidadId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: id_dom_localidad
 *     responses:
 *       200:
 *         description: Barrios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Barrio'
 *       400:
 *         description: localidadId requerido
 */
PersonaDomiRouter.get('/barrios', authMiddleware, ctrl.listBarrios); // ?localidadId=

/**
 * @swagger
 * /personas/{id_persona}/domicilios:
 *   post:
 *     summary: Crear domicilio para una persona
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_persona
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la persona a la que se vincula el domicilio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DomicilioInput'
 *     responses:
 *       201:
 *         description: Domicilio creado
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Acceso denegado
 */
PersonaDomiRouter.post('/personas/:id_persona/domicilios', authMiddleware, ctrl.createDomicilio );

/**
 * @swagger
 * /domicilios/{id_domicilio}:
 *   put:
 *     summary: Actualizar domicilio
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_domicilio
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DomicilioInput'
 *     responses:
 *       200:
 *         description: Domicilio actualizado
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: No encontrado
 */
PersonaDomiRouter.put('/domicilios/:id_domicilio', authMiddleware, ctrl.updateDomicilio );

/**
 * @swagger
 * /domicilios/{id_domicilio}:
 *   delete:
 *     summary: Eliminar domicilio
 *     tags: [Domicilios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_domicilio
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminado correctamente
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: No encontrado
 */
PersonaDomiRouter.delete('/personas/:id_persona/domicilios/:id_domicilio', authMiddleware, ctrl.deleteDomicilio );
export default PersonaDomiRouter;