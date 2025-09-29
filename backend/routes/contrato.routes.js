import express from 'express';
import {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  eliminarContrato,
  // Nuevos handlers (actualizados)
  buscarPersonaPorDni,
  obtenerDetallesProfesor,
  listarMateriasPorCarreraAnio,
  crearNuevoContratoProfesor,
} from '../controllers/contrato.Controller.js';
import { verificarToken, soloAdministrador } from '../middleware/authMiddleware.js';

const contratoRouter = express.Router();

// Mantén rutas existentes
contratoRouter.get('/', verificarToken, soloAdministrador, listarContratos);
contratoRouter.get('/:id', verificarToken, soloAdministrador, obtenerContrato);
contratoRouter.post('/', verificarToken, soloAdministrador, crearContrato);
contratoRouter.put('/:id', verificarToken, soloAdministrador, actualizarContrato);
contratoRouter.delete('/:id', verificarToken, soloAdministrador, eliminarContrato);

// Nuevas rutas para el flujo de contratos (actualizadas)
contratoRouter.get('/persona/dni/:dni', verificarToken, buscarPersonaPorDni); // Buscar por DNI
contratoRouter.get('/profesor/:idPersona/detalles', verificarToken, obtenerDetallesProfesor); // Detalles profesor
contratoRouter.get('/materias', verificarToken, listarMateriasPorCarreraAnio); // Filtrar materias
contratoRouter.post('/profesor/crear', verificarToken, soloAdministrador, crearNuevoContratoProfesor); // Crear contrato profesor

export default contratoRouter;