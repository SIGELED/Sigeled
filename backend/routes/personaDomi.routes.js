import express from 'express';
import * as ctrl from '../controllers/personaDomi.Controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permitirRoles } from '../middleware/permisosMiddleware.js'; // si prefieres usar nombres

const router = express.Router();

// Rutas:
// Listar todos (solo admin/rrhh)
router.get('/domicilios',
  authMiddleware,
  permitirRoles('administrador', 'rrhh'), // permite solo por nombre de rol
  ctrl.listAllDomicilios
);

// Listar domicilios de persona
router.get('/personas/:id_persona/domicilios',
  authMiddleware,
  ctrl.listByPersona
);

// Obtener domicilio por id
router.get('/domicilios/:id_domicilio',
  authMiddleware,
  ctrl.getDomicilio
);

// Crear domicilio para persona
router.post('/personas/:id_persona/domicilios',
  authMiddleware,
  ctrl.createDomicilio
);

// Actualizar domicilio
router.put('/domicilios/:id_domicilio',
  authMiddleware,
  ctrl.updateDomicilio
);

// Eliminar domicilio
router.delete('/domicilios/:id_domicilio',
  authMiddleware,
  ctrl.deleteDomicilio
);

export default router;