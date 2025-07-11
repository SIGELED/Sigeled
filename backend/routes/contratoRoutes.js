import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato
} from '../controllers/contratoController.js';
import { generarPDFContrato } from '../controllers/pdfContratoController.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddlware.js';

const router = express.Router();

// CRUD de contratos
router.get('/', listarContratos);
router.get('/:id',obtenerContrato); // Temporal, se reemplazará por obtenerContrato
router.post('/', verificarToken, soloAdministrador, crearContrato);
router.put('/:id', verificarToken, soloAdministrador, actualizarContrato);
router.delete('/:id', verificarToken, soloAdministrador, eliminarContrato);

// Generación de PDF de contrato
router.get('/:id/pdf', verificarToken, generarPDFContrato);

export default router;