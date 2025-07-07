import db from './db.js';

// Obtener todos los roles
export const getAllRoles = async () => {
    const res = await db.query('SELECT * FROM roles ORDER BY id');
    return res.rows;
};

// Obtener rol por ID
export const getRoleById = async (id) => {
    const res = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
    return res.rows[0];
};

// Obtener rol por nombre
export const getRoleByName = async (nombre) => {
    const res = await db.query('SELECT * FROM roles WHERE nombre = $1', [nombre]);
    return res.rows[0];
};

// Crear nuevo rol (solo para administradores)
export const createRole = async (roleData) => {
    const { nombre, descripcion, permisos } = roleData;
    const res = await db.query(
        'INSERT INTO roles (nombre, descripcion, permisos) VALUES ($1, $2, $3) RETURNING *',
        [nombre, descripcion, permisos]
    );
    return res.rows[0];
};

// Actualizar rol
export const updateRole = async (id, roleData) => {
    const { nombre, descripcion, permisos } = roleData;
    const res = await db.query(
        'UPDATE roles SET nombre = $1, descripcion = $2, permisos = $3 WHERE id = $4 RETURNING *',
        [nombre, descripcion, permisos, id]
    );
    return res.rows[0];
};

// Eliminar rol (solo si no está siendo usado)
export const deleteRole = async (id) => {
    // Verificar si hay usuarios usando este rol
    const usersWithRole = await db.query('SELECT COUNT(*) FROM usuarios WHERE rol = $1', [id]);
    if (parseInt(usersWithRole.rows[0].count) > 0) {
        throw new Error('No se puede eliminar el rol porque hay usuarios asignados');
    }
    
    const res = await db.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
};

// Obtener rol "pendiente" (para nuevos usuarios)
export const getPendingRole = async () => {
    const res = await db.query("SELECT * FROM roles WHERE nombre = 'pendiente' LIMIT 1");
    return res.rows[0];
}; 