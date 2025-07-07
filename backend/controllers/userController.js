import bcrypt from 'bcrypt';
import { getAllUsers, getUserById, findUserByEmail } from '../models/userModel.js';
import { getAllRoles, getRoleById, getRoleByName } from '../models/roleModel.js';
import db from '../models/db.js';

// Obtener todos los usuarios (solo administradores)
export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener usuario por ID (solo administradores o el propio usuario)
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Solo administradores pueden ver otros usuarios, o el propio usuario
        if (req.user.rol !== 'administrador' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear nuevo usuario (solo administradores)
export const createUser = async (req, res) => {
    try {
        const { nombre, email, contraseña, rol, dni, cuil, domicilio, titulo } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Verificar si el rol existe
        const role = await getRoleById(rol);
        if (!role) {
            return res.status(400).json({ message: 'Rol no válido' });
        }

        // Hash de la contraseña
        const contraseñaHash = bcrypt.hashSync(contraseña, 10);

        // Crear usuario
        const newUser = await db.query(
            `INSERT INTO usuarios (nombre, email, contraseña, rol, dni, cuil, domicilio, titulo) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [nombre, email, contraseñaHash, rol, dni, cuil, domicilio, titulo]
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Actualizar usuario (solo administradores o el propio usuario)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, dni, cuil, domicilio, titulo } = req.body;

        // Verificar si el usuario existe
        const existingUser = await getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Solo administradores pueden editar otros usuarios, o el propio usuario
        if (req.user.rol !== 'administrador' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        // Actualizar usuario
        const updatedUser = await db.query(
            `UPDATE usuarios SET nombre = $1, email = $2, dni = $3, cuil = $4, domicilio = $5, titulo = $6 
             WHERE id = $7 RETURNING *`,
            [nombre, email, dni, cuil, domicilio, titulo, id]
        );

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Asignar/cambiar rol de usuario (solo administradores)
export const assignRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;

        // Verificar si el usuario existe
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el rol existe
        const role = await getRoleById(roleId);
        if (!role) {
            return res.status(400).json({ message: 'Rol no válido' });
        }

        // No permitir cambiar el rol del administrador principal
        if (user.rol === 'administrador' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'No se puede cambiar el rol del administrador principal' });
        }

        // Actualizar rol
        await db.query(
            'UPDATE usuarios SET rol = $1 WHERE id = $2',
            [roleId, userId]
        );

        res.json({
            message: 'Rol asignado exitosamente',
            userId,
            newRole: role.nombre
        });
    } catch (error) {
        console.error('Error al asignar rol:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener usuarios pendientes (solo administradores)
export const getPendingUsers = async (req, res) => {
    try {
        const pendingRole = await getRoleByName('pendiente');
        if (!pendingRole) {
            return res.status(500).json({ message: 'Rol pendiente no encontrado' });
        }

        const pendingUsers = await db.query(
            `SELECT u.*, r.nombre AS nombre_rol
             FROM usuarios u
             JOIN roles r ON u.rol = r.id
             WHERE u.rol = $1`,
            [pendingRole.id]
        );

        res.json(pendingUsers.rows);
    } catch (error) {
        console.error('Error al obtener usuarios pendientes:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Desactivar usuario (solo administradores)
export const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario existe
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // No permitir desactivar al administrador principal
        if (user.rol === 'administrador') {
            return res.status(403).json({ message: 'No se puede desactivar al administrador principal' });
        }

        // Desactivar usuario (soft delete)
        await db.query(
            'UPDATE usuarios SET activo = false WHERE id = $1',
            [id]
        );

        res.json({ message: 'Usuario desactivado exitosamente' });
    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}; 