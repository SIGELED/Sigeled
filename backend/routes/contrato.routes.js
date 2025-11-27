import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  obtenerContratoPorExternalId,
  crearContratoHandler,
  eliminarContrato,
  buscarPersonaPorDni,
  obtenerDetallesProfesor,
  listarMateriasPorCarreraAnio,
  crearNuevoContratoProfesor,
  listarEmpleadosContratos,
  listarMisContratos,
} from '../controllers/contrato.Controller.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddleware.js';
import { getContratoById } from '../models/contratoModel.js';
import { generateWordDocument, generatePdfDocument } from '../utils/documentGenerator.js';
import { createContratoValidators, handleValidation } from '../validators/contratoValidator.js';
import { getCarreras } from '../models/carreraModel.js';
import { getAnios } from '../models/contratoModel.js';

const contratoRouter = express.Router();

// Aplicar middleware de autenticación a todas las rutas
contratoRouter.use(verificarToken);

contratoRouter.get('/carreras', async (req, res) => {
  try {
    res.json(await getCarreras());
  } catch (error) {
    res.status(500).json({error:'Error al listar carreras'});
  }
})

contratoRouter.get('/anios', soloAdministrador, async (req, res) => {
  try {
    res.json(await getAnios());
  } catch (error) {
    res.status(500).json({error: 'Error al listar años'})
  }
});

contratoRouter.get('/empleados', soloAdministrador, listarEmpleadosContratos);

contratoRouter.get('/mis-contratos', listarMisContratos);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contrato'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado, se requiere rol de administrador
 */
contratoRouter.get('/', soloAdministrador, listarContratos);

/**
 * @swagger
 * /api/contratos/external/{external_id}:
 *   get:
 *     summary: Obtiene un contrato por su external_id (UUID público)
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: external_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: external_id (UUID) del contrato
 *     responses:
 *       200:
 *         description: Contrato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       404:
 *         description: Contrato no encontrado
 */
contratoRouter.get('/external/:external_id', soloAdministrador, obtenerContratoPorExternalId);

/**
 * @swagger
 * /api/contratos/profesor/{idPersona}/detalles:
 *   get:
 *     summary: Obtiene los detalles de un profesor
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPersona
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona (profesor)
 *     responses:
 *       200:
 *         description: Detalles del profesor
 *       404:
 *         description: Profesor no encontrado
 *       401:
 *         description: No autorizado
 */
contratoRouter.get('/profesor/:idPersona/detalles', soloAdministrador, obtenerDetallesProfesor);

/**
 * @swagger
 * tags:
 *   name: Contratos
 *   description: Gestión de contratos de profesores
 */



// In contrato.routes.js, add this before the route definition
/**
 * @swagger
 * /api/contratos/profesor/crear:
 *   post:
 *     tags: [Contratos]
 *     summary: Crear un nuevo contrato de profesor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_persona
 *               - id_profesor
 *               - id_materia
 *               - id_periodo
 *               - horas_semanales
 *               - horas_mensuales
 *               - monto_hora
 *               - fecha_inicio
 *               - fecha_fin
 *             properties:
 *               id_persona:
 *                 type: string
 *                 format: uuid
 *                 example: "00000000-0000-0000-0000-000000000000"
 *               id_profesor:
 *                 type: string
 *                 format: uuid
 *                 example: "00000000-0000-0000-0000-000000000000"
 *               id_materia:
 *                 type: string
 *                 format: uuid
 *                 example: "00000000-0000-0000-0000-000000000000"
 *               id_periodo:
 *                 type: integer
 *                 example: 1
 *               horas_semanales:
 *                 type: integer
 *                 example: 20
 *               horas_mensuales:
 *                 type: integer
 *                 example: 80
 *               monto_hora:
 *                 type: number
 *                 format: float
 *                 example: 500.00
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Contrato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       400:
 *         description: Error en la solicitud o datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
contratoRouter.post('/profesor/crear', verificarToken, soloAdministrador, createContratoValidators, handleValidation, crearNuevoContratoProfesor);


// Actualización de contratos deshabilitada: devolvemos 405 para compatibilidad





// Rutas adicionales para el flujo de contratos

/**
 * @swagger
 * /api/contratos/persona/dni/{dni}:
 *   get:
 *     summary: Busca una persona por su DNI
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *         description: DNI de la persona a buscar
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 *       401:
 *         description: No autorizado
 */
contratoRouter.get('/persona/dni/:dni', soloAdministrador, buscarPersonaPorDni);

/**
 * @swagger
 * /api/contratos/materias:
 *   get:
 *     summary: Obtiene las materias por carrera y año
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idCarrera
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *       - in: query
 *         name: idAnio
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del año
 *     responses:
 *       200:
 *         description: Lista de materias
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 */
contratoRouter.get('/materias', soloAdministrador, listarMateriasPorCarreraAnio);

// La documentación y ruta POST para crear contratos ya está definida arriba

export default contratoRouter;

/**
 * @swagger
 * /api/contratos/{id}/export:
 *   get:
 *     summary: Exportar contrato en formato Word o PDF
 *     description: Exporta un contrato en formato Word (.docx) o PDF
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: ID numérico del contrato a exportar
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [word, pdf]
 *         description: Formato de exportación (word o pdf)
 *     responses:
 *       200:
 *         description: Documento generado exitosamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Formato no válido o error en la solicitud
 *       404:
 *         description: Contrato no encontrado
 *       500:
 *         description: Error al generar el documento
 */
contratoRouter.get('/:id/export', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;

    if (!['word', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Formato no válido. Use "word" o "pdf".' });
    }

    // Get the contract data
    const contrato = await getContratoById(id);
    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    let fileContent;
    let contentType;
    let fileExtension;

    if (format === 'word') {
      fileContent = await generateWordDocument(contrato);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = 'docx';
    } else {
      fileContent = await generatePdfDocument(contrato);
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${id}.${fileExtension}`);
    res.send(fileContent);

    res.send(fileContent);

  } catch (error) {
    console.error('Error al exportar contrato:', error);
    res.status(500).json({ 
      error: 'Error al generar el documento',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       404:
 *         description: Contrato no encontrado
 *       401:
 *         description: No autorizado
 */
contratoRouter.get('/:id', soloAdministrador, obtenerContrato);

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
 *       404:
 *         description: Contrato no encontrado
 */
contratoRouter.delete('/:id', soloAdministrador, eliminarContrato);