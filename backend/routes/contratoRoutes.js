import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato
} from '../controllers/contratoController.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddlware.js';

const router = express.Router();

// CRUD de contratos
router.get('/', listarContratos);
router.get('/:id',obtenerContrato); // Temporal, se reemplazará por obtenerContrato
router.post('/', verificarToken, soloAdministrador, crearContrato);
router.put('/:id', verificarToken, soloAdministrador, actualizarContrato);
router.delete('/:id', verificarToken, soloAdministrador, eliminarContrato);

export default router;