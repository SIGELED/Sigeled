import express from 'express';
import { 
    getAllRoles, 
    getRoleById, 
    createRole, 
    updateRole, 
    deleteRole 
} from '../models/roleModel.js';
import { verificarToken, permitirRoles } from '../middleware/authMiddlware.js';
import { validarCrearRol, validarActualizarRol } from '../validators/roleValidator.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken);
router.use(permitirRoles('administrador'));

// Obtener todos los roles
router.get('/', async (req, res) => {
    try {
        const roles = await getAllRoles();
        res.json(roles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener rol por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const role = await getRoleById(id);
        
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        
        res.json(role);
    } catch (error) {
        console.error('Error al obtener rol:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Crear nuevo rol
router.post('/', validarCrearRol, async (req, res) => {
    try {
        const newRole = await createRole(req.body);
        res.status(201).json({
            message: 'Rol creado exitosamente',
            role: newRole
        });
    } catch (error) {
        console.error('Error al crear rol:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Actualizar rol
router.put('/:id', validarActualizarRol, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRole = await updateRole(id, req.body);
        
        if (!updatedRole) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        
        res.json({
            message: 'Rol actualizado exitosamente',
            role: updatedRole
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Eliminar rol
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRole = await deleteRole(id);
        
        if (!deletedRole) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        
        res.json({
            message: 'Rol eliminado exitosamente',
            role: deletedRole
        });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        
        if (error.message.includes('usuarios asignados')) {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router; 