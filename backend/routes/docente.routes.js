import express from 'express';
import { upload, uploadCV } from '../controllers/docente.Controller.js';
import { verificarToken, soloDocente } from '../middleware/authMiddlware.js';
import { validarArchivoCV } from '../validators/docenteValidator.js';

const docenteRouter = express.Router();

// Ruta para subir el CV (solo para docentes autenticados)
docenteRouter.post('/upload-cv', verificarToken, soloDocente, upload.single('cv'), validarArchivoCV, uploadCV);

export default docenteRouter;