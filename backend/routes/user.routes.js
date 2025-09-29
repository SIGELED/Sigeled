import express from 'express';
import { 
    getUsers, 
    getUser, 
    createUserController, 
    deactivateUser,
    getUserRoles
} from '../controllers/user.Controller.js';
import { verificarToken, permitirRoles } from '../middleware/authMiddleware.js';
import { validarCrearUsuario } from '../validators/userValidator.js';

const userRouter = express.Router();

// Todas las rutas requieren autenticación
userRouter.use(verificarToken);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (solo administradores)
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error del servidor
 */
userRouter.get('/', permitirRoles('administrador'), getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario (solo administradores)
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error del servidor
 */
userRouter.post('/', permitirRoles('administrador', 'Administrador'), validarCrearUsuario, createUserController);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
userRouter.get('/profile', getUser);

/**
 * @swagger
 * /api/users/{id_usuario}/roles:
 *   get:
 *     summary: Obtener roles de un usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de roles del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
userRouter.get('/:id_usuario/roles', getUserRoles);

/**
 * @swagger
 * /api/users/{id_usuario}:
 *   delete:
 *     summary: Desactivar usuario (solo administradores)
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a desactivar
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error del servidor
 */
userRouter.delete('/:id_usuario', permitirRoles('administrador'), deactivateUser);

export default userRouter;