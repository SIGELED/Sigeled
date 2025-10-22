import db from './db.js';

export class PermisoModel {
    // Verificar si un usuario tiene un permiso específico
    static async verificarPermiso(id_usuario, codigo_permiso) {
        const query = `
            SELECT 
                p.codigo, 
                p.nombre,
                r.nombre as rol_nombre
            FROM usuarios u
            JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            JOIN permisos p ON r.id_rol = p.id_rol
            WHERE u.id_usuario = $1 AND p.codigo = $2 AND p.activo = true
        `;
        return await db.query(query, [id_usuario, codigo_permiso]);
    }

    // Obtener todos los permisos de un usuario
    static async getPermisosUsuario(id_usuario) {
        const query = `
            SELECT 
                p.codigo, 
                p.nombre,
                p.descripcion,
                r.nombre as rol_nombre,
                r.id_rol
            FROM usuarios u
            JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            JOIN permisos p ON r.id_rol = p.id_rol
            WHERE u.id_usuario = $1 AND p.activo = true
            ORDER BY p.codigo
        `;
        return await db.query(query, [id_usuario]);
    }

    // Obtener permisos por rol
    static async getPermisosByRole(id_rol) {
        const query = `
            SELECT codigo, nombre, descripcion
            FROM permisos
            WHERE id_rol = $1 AND activo = true
            ORDER BY codigo
        `;
        return await db.query(query, [id_rol]);
    }

    // Crear nuevo permiso
    static async create(permisoData) {
        const { codigo, nombre, descripcion, id_rol } = permisoData;
        const query = `
            INSERT INTO permisos (codigo, nombre, descripcion, id_rol)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        return await db.query(query, [codigo, nombre, descripcion, id_rol]);
    }

    // Obtener todos los permisos del sistema
    static async getAllPermisos() {
        const query = `
            SELECT 
                p.id_permiso,
                p.codigo,
                p.nombre,
                p.descripcion,
                r.nombre as rol_nombre,
                r.id_rol,
                p.activo,
                p.creado_en
            FROM permisos p
            JOIN roles r ON p.id_rol = r.id_rol
            ORDER BY r.id_rol, p.codigo
        `;
        return await db.query(query);
    }

    // Obtener usuarios con sus roles y permisos
    static async getUsuariosConRoles() {
        const query = `
            SELECT 
                u.id_usuario,
                u.email,
                u.id_persona,
                u.activo,
                r.id_rol,
                r.nombre as rol_nombre,
                p.nombre as persona_nombre,
                p.apellido as persona_apellido,
                pi.dni,
                pc.telefono
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN roles r ON ur.id_rol = r.id_rol
            LEFT JOIN personas p ON u.id_persona = p.id_persona
            LEFT JOIN personas_identificacion pi ON p.id_persona = pi.id_persona
            LEFT JOIN personas_contacto pc ON p.id_persona = pc.id_persona
            WHERE u.activo = true
            ORDER BY u.id_usuario
        `;
        return await db.query(query);
    }

    // Verificar si existe un permiso
    static async existePermiso(codigo, id_rol) {
        const query = `
            SELECT id_permiso 
            FROM permisos 
            WHERE codigo = $1 AND id_rol = $2
        `;
        return await db.query(query, [codigo, id_rol]);
    }

    // Eliminar permiso (soft delete)
    static async delete(id_permiso) {
        const query = 'UPDATE permisos SET activo = false WHERE id_permiso = $1 RETURNING *';
        return await db.query(query, [id_permiso]);
    }

    // Restaurar permiso
    static async restore(id_permiso) {
        const query = 'UPDATE permisos SET activo = true WHERE id_permiso = $1 RETURNING *';
        return await db.query(query, [id_permiso]);
    }
}