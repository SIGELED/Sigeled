import express from 'express';
import { PermisoController } from '../controllers/permiso.Controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { verificarPermiso } from '../middleware/permisosMiddleware.js';

const permisoRoutes = express.Router();

// Obtener mis permisos (todos los usuarios autenticados)
permisoRoutes.get('/mis-permisos', 
    authMiddleware, 
    PermisoController.getMisPermisos
);

// Verificar un permiso específico
permisoRoutes.get('/verificar/:codigo_permiso', 
    authMiddleware, 
    PermisoController.verificarPermisoEspecifico
);

// Listar todos los permisos del sistema (solo administradores)
permisoRoutes.get('/todos', 
    authMiddleware, 
    verificarPermiso('SISTEMA_VER_PERMISOS'), 
    PermisoController.getAllPermisos
);

export default permisoRoutes;