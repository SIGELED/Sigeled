import express from 'express';
import { 
    getUsers, 
    getUser, 
    createUserController, 
    deactivateUser,
    getUserRoles
} from '../controllers/user.Controller.js';
import { verificarToken, permitirRoles } from '../middleware/authMiddlware.js';
import { validarCrearUsuario, validarActualizarUsuario } from '../validators/userValidator.js';

const userRouter = express.Router();

// Todas las rutas requieren autenticación
userRouter.use(verificarToken);

// Rutas solo para administradores
userRouter.get('/', permitirRoles('administrador'), getUsers);
userRouter.post('/', permitirRoles('administrador'), validarCrearUsuario, createUserController);
userRouter.delete('/:id_usuario', permitirRoles('administrador'), deactivateUser);

// Rutas para usuarios autenticados (ver su propio perfil)
userRouter.get('/profile', getUser); // El usuario ve su propio perfil

// Obtener roles de un usuario
userRouter.get('/:id_usuario/roles', getUserRoles);

export default userRouter;