import express from 'express';
import { 
    getUsers, 
    getUser, 
    createUser, 
    updateUser, 
    assignRole, 
    getPendingUsers, 
    deactivateUser 
} from '../controllers/userController.js';
import { verificarToken, permitirRoles } from '../middleware/authMiddlware.js';
import { validarCrearUsuario, validarActualizarUsuario, validarAsignarRol } from '../validators/userValidator.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas solo para administradores
router.get('/users', permitirRoles('administrador'), getUsers);
router.get('/users/pending', permitirRoles('administrador'), getPendingUsers);
router.post('/users', permitirRoles('administrador'), validarCrearUsuario, createUser);
router.put('/users/:id', permitirRoles('administrador'), validarActualizarUsuario, updateUser);
router.patch('/users/:userId/role', permitirRoles('administrador'), validarAsignarRol, assignRole);
router.delete('/users/:id', permitirRoles('administrador'), deactivateUser);

// Rutas para usuarios autenticados (ver su propio perfil)
router.get('/profile', getUser); // El usuario ve su propio perfil
router.put('/profile', validarActualizarUsuario, updateUser); // El usuario actualiza su propio perfil

export default router; 