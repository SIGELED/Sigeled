import express from 'express';
import multer from 'multer';
import { verificarToken } from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/archivos.controller.js';

const archivosRouter = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

archivosRouter.use(verificarToken);

/**
 * @swagger
 * /api/archivos:
 *   get:
 *     summary: Listar todos los archivos (admin/rrhh ven todos, usuarios solo los suyos)
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de archivos
 */
archivosRouter.get('/', ctrl.listarArchivos);

/**
 * @swagger
 * /api/archivos/{id_archivo}:
 *   get:
 *     summary: Obtener archivo por ID
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_archivo
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Archivo encontrado
 *       403:
 *         description: No autorizado para ver este archivo
 *       404:
 *         description: Archivo no encontrado
 */
archivosRouter.get('/:id_archivo', ctrl.obtenerArchivo);

/**
 * @swagger
 * /api/archivos/upload:
 *   post:
 *     summary: Subir archivo (alternativa a /api/persona/{id_persona}/archivo)
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido correctamente
 *       400:
 *         description: Archivo inválido, duplicado o muy grande
 */
archivosRouter.post('/upload', upload.single('file'), ctrl.subirArchivo);

/**
 * @swagger
 * /api/archivos/{id_archivo}:
 *   delete:
 *     summary: Eliminar archivo (solo propietario o admin/rrhh)
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_archivo
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Archivo eliminado correctamente
 *       400:
 *         description: Archivo tiene referencias
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Archivo no encontrado
 */
archivosRouter.delete('/:id_archivo', ctrl.eliminarArchivo);

export default archivosRouter;