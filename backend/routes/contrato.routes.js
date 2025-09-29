import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato,
  buscarPersonaPorDni,
  obtenerDetallesProfesor,
  listarMateriasPorCarreraAnio,
  crearNuevoContratoProfesor,
} from '../controllers/contrato.Controller.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddleware.js';

const contratoRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contratos
 *   description: Gestión de contratos de profesores
 */

/**
 * @swagger
 * /api/contratos:
 *   get:
 *     summary: Obtiene todos los contratos
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contratos obtenida correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado, se requiere rol de administrador
 */
contratoRouter.get('/', verificarToken, soloAdministrador, listarContratos);

/**
 * @swagger
 * /api/contratos/{id}:
 *   get:
 *     summary: Obtiene un contrato por ID
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contrato a buscar
 *     responses:
 *       200:
 *         description: Contrato encontrado
 *       404:
 *         description: Contrato no encontrado
 *       401:
 *         description: No autorizado
 */
contratoRouter.get('/:id', verificarToken, soloAdministrador, obtenerContrato);


/**
 * @swagger
 * components:
 *   schemas:
 *     Contrato:
 *       type: object
 *       required:
 *         - fecha_inicio
 *         - id_profesor
 *         - id_materia
 *         - horas_semanales
 *         - monto_hora
 *       properties:
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         fecha_fin:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *           nullable: true
 *         id_profesor:
 *           type: integer
 *           example: 1
 *         id_materia:
 *           type: integer
 *           example: 1
 *         horas_semanales:
 *           type: number
 *           format: float
 *           example: 20
 *         monto_hora:
 *           type: number
 *           format: float
 *           example: 500
 *         observaciones:
 *           type: string
 *           nullable: true
 *           example: "Contrato temporal"
 */

/**
 * @swagger
 * /api/contratos:
 *   post:
 *     summary: Crea un nuevo contrato
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contrato'
 *     responses:
 *       201:
 *         description: Contrato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       400:
 *         description: Datos de entrada no válidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al crear contrato"
 *                 details:
 *                   type: string
 *                   example: "Mensaje detallado del error"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado, se requiere rol de administrador
 */
contratoRouter.post('/', verificarToken, soloAdministrador, crearContrato);


/**
 * @swagger
 * /api/contratos/{id}:
 *   put:
 *     summary: Actualiza un contrato existente
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contrato a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contrato'
 *     responses:
 *       200:
 *         description: Contrato actualizado exitosamente
 *       400:
 *         description: Datos de entrada no válidos
 *       401:
 *         description: No autorizado
 */
contratoRouter.put('/:id', verificarToken, soloAdministrador, actualizarContrato);

/**
 * @swagger
 * /api/contratos/{id}:
 *   delete:
 *     summary: Elimina un contrato existente
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contrato a eliminar
 *     responses:
 *       200:
 *         description: Contrato eliminado exitosamente
 *       401:
 *         description: No autorizado
 */
contratoRouter.delete('/:id', verificarToken, soloAdministrador, eliminarContrato);

// Nuevas rutas para el flujo de contratos (actualizadas)
contratoRouter.get('/persona/dni/:dni', verificarToken, buscarPersonaPorDni); // Buscar por DNI
contratoRouter.get('/profesor/:idPersona/detalles', verificarToken, obtenerDetallesProfesor); // Detalles profesor
contratoRouter.get('/materias', verificarToken, listarMateriasPorCarreraAnio); // Filtrar materias
contratoRouter.post('/profesor/crear', verificarToken, soloAdministrador, crearNuevoContratoProfesor); // Crear contrato profesor

export default contratoRouter;