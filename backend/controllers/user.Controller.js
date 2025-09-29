import bcrypt from 'bcrypt';
import { getAllUsers, getUserById, findUserByEmail, createUser } from '../models/userModel.js';
import { getRolesByUserId } from '../models/roleModel.js';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        console.log('Usuario que hace la petición:', req.user); // LOG temporal
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener usuario por ID
export const getUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const user = await getUserById(id_usuario);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear nuevo usuario
export const createUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await createUser({ email, password_hash });
        res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Desactivar usuario
export const deactivateUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const user = await getUserById(id_usuario);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        await db.query('UPDATE usuarios SET activo = false WHERE id_usuario = $1', [id_usuario]);
        res.json({ message: 'Usuario desactivado exitosamente' });
    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener roles de un usuario
export const getUserRoles = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const roles = await getRolesByUserId(id_usuario);
        res.json(roles);
    } catch (error) {
        console.error('Error al obtener roles del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};