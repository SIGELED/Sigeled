import { getRolesByUserId, assignRoleToUser } from '../models/roleModel.js';

// Obtener roles de un usuario
export const getUserRoles = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const roles = await getRolesByUserId(id_usuario);
        res.json(roles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Asignar rol a usuario
export const addRoleToUser = async (req, res) => {
    const { id_usuario, id_rol, asignado_por } = req.body;
    try {
        const result = await assignRoleToUser(id_usuario, id_rol, asignado_por);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error al asignar rol:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};