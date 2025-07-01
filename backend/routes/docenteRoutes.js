import express from 'express';
import { upload, uploadCV } from '../controllers/docenteController.js';
import { verificarToken, soloDocente } from '../middleware/authMiddlware.js';
import { validarArchivoCV } from '../validators/docenteValidator.js';

const router = express.Router();

// Ruta para subir el CV (solo para docentes autenticados)
router.post('/upload-cv', verificarToken, soloDocente, upload.single('cv'), validarArchivoCV, uploadCV);

export default router;