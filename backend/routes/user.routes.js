import express from 'express';
import { 
    getUsers, 
    getUser, 
    createUserController, 
    toggleUser,
    getUserRoles
} from '../controllers/user.Controller.js';
import { verificarToken, permitirRoles } from '../middleware/authMiddleware.js';
import { validarCrearUsuario, validarActualizarUsuario } from '../validators/userValidator.js';

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
 */
userRouter.get('/', permitirRoles('ADMIN'), getUsers);

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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
userRouter.post('/', permitirRoles('ADMIN'), validarCrearUsuario, createUserController);

/**
 * @swagger
 * /api/users/{id_usuario}:
 *   delete:
 *     summary: Cambiar estado de usuario (solo administradores)
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
userRouter.put('/:id_usuario/toggle', permitirRoles('ADMIN'), toggleUser);


/**
 * @swagger
 * /api/users/{id_usuario}:
 *   get:
 *     summary: Obtener usuario por id
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
userRouter.get('/:id_usuario', permitirRoles('ADMIN'), getUser)

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de roles del usuario
 *       500:
 *         description: Error del servidor
 */
userRouter.get('/:id_usuario/roles', getUserRoles);

export default userRouter;