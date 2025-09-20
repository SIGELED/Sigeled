import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato
} from '../controllers/contrato.Controller.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddleware.js';

const contratoRouter = express.Router();

/**
 * @swagger
 * /api/contratos:
 *   get:
 *     summary: Listar todos los contratos
 *     tags:
 *       - Contratos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contratos
 */
contratoRouter.get('/', listarContratos);

/**
 * @swagger
 * /api/contratos/{id}:
 *   get:
 *     summary: Obtener contrato por ID
 *     tags:
 *       - Contratos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contrato encontrado
 *       404:
 *         description: Contrato no encontrado
 */
contratoRouter.get('/:id', obtenerContrato);

/**
 * @swagger
 * /api/contratos:
 *   post:
 *     summary: Crear nuevo contrato (solo administradores)
 *     tags:
 *       - Contratos
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
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *               tipo_contrato:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contrato creado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
contratoRouter.post('/', verificarToken, soloAdministrador, crearContrato);

/**
 * @swagger
 * /api/contratos/{id}:
 *   put:
 *     summary: Actualizar contrato (solo administradores)
 *     tags:
 *       - Contratos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
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
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *               tipo_contrato:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contrato actualizado
 *       404:
 *         description: Contrato no encontrado
 *       500:
 *         description: Error interno
 */
contratoRouter.put('/:id', verificarToken, soloAdministrador, actualizarContrato);

/**
 * @swagger
 * /api/contratos/{id}:
 *   delete:
 *     summary: Eliminar contrato (solo administradores)
 *     tags:
 *       - Contratos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contrato eliminado
 *       404:
 *         description: Contrato no encontrado
 *       500:
 *         description: Error interno
 */
contratoRouter.delete('/:id', verificarToken, soloAdministrador, eliminarContrato);

export default contratoRouter;