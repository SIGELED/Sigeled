import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato
} from '../controllers/contratoController.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddlware.js';

const contratoRouter = express.Router();

// CRUD de contratos
contratoRouter.get('/', listarContratos);
contratoRouter.get('/:id',obtenerContrato); // Temporal, se reemplazará por obtenerContrato
contratoRouter.post('/', verificarToken, soloAdministrador, crearContrato);
contratoRouter.put('/:id', verificarToken, soloAdministrador, actualizarContrato);
contratoRouter.delete('/:id', verificarToken, soloAdministrador, eliminarContrato);

export default contratoRouter;