import { PermisoModel } from '../models/permisoModel.js';

export const verificarPermiso = (codigo_permiso_requerido) => {
    return async (req, res, next) => {
        try {
            
            if (!req.user || !req.user.id_usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado',
                    codigo_error: 'NOT_AUTHENTICATED'
                });
            }

            const user_id = req.user.id_usuario; 
            
            console.log(` Verificando permiso '${codigo_permiso_requerido}' para usuario ${user_id} (${req.user.role_name})`);
            
            const result = await PermisoModel.verificarPermiso(user_id, codigo_permiso_requerido);
            
            if (result.rows.length === 0) {
                console.log(` Permiso '${codigo_permiso_requerido}' DENEGADO para usuario ${user_id}`);
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para realizar esta acción',
                    permiso_requerido: codigo_permiso_requerido,
                    tu_rol: req.user.role_name,
                    codigo_error: 'PERMISO_DENEGADO'
                });
            }
            
            console.log(` Permiso '${codigo_permiso_requerido}' CONCEDIDO para usuario ${user_id}`);
            
            req.permiso_verificado = result.rows[0];
            next();
            
        } catch (error) {
            console.error('Error verificando permiso:', error);
            res.status(500).json({
                success: false,
                message: 'Error verificando permisos',
                error: error.message
            });
        }
    };
};

export const verificarRolMinimo = (rol_minimo_id) => {
    return (req, res, next) => {
        try {
            
            if (!req.user || !req.user.id_rol) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const user_role = req.user.id_rol; 
            
            if (user_role > rol_minimo_id) {
                const roles_map = { 1: 'ADMIN', 2: 'RRHH', 3: 'ADMTVO', 4: 'EMP' };
                
                return res.status(403).json({
                    success: false,
                    message: 'Rol insuficiente para esta acción',
                    tu_rol: roles_map[user_role],
                    rol_minimo_requerido: roles_map[rol_minimo_id],
                    codigo_error: 'ROL_INSUFICIENTE'
                });
            }
            
            next();
        } catch (error) {
            console.error('Error verificando rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error verificando rol',
                error: error.message
            });
        }
    };
};

export const obtenerPermisosUsuario = async (user_id) => {
    try {
        if (!user_id) {
            throw new Error('ID de usuario requerido');
        }

        const result = await PermisoModel.getPermisosUsuario(user_id);
        
        return {
            permisos: result.rows.map(row => row.codigo),
            detalle_permisos: result.rows,
            rol: result.rows[0]?.rol_nombre,
            id_rol: result.rows[0]?.id_rol, 
            total_permisos: result.rows.length
        };
    } catch (error) {
        console.error('Error obteniendo permisos:', error);
        return { 
            permisos: [], 
            detalle_permisos: [], 
            rol: null, 
            id_rol: null, 
            total_permisos: 0
        };
    }
};

export const verificarCualquierPermiso = (...codigos_permisos) => {
    return async (req, res, next) => {
        try {
            
            if (!req.user || !req.user.id_usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const user_id = req.user.id_usuario; 
            let tieneAlgunPermiso = false;

            for (const codigo of codigos_permisos) {
                const result = await PermisoModel.verificarPermiso(user_id, codigo);
                if (result.rows.length > 0) {
                    tieneAlgunPermiso = true;
                    req.permiso_verificado = result.rows[0];
                    break;
                }
            }

            if (!tieneAlgunPermiso) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes ninguno de los permisos requeridos',
                    permisos_requeridos: codigos_permisos,
                    codigo_error: 'NINGUN_PERMISO'
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando múltiples permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error verificando permisos',
                error: error.message
            });
        }
    };
};

export const verificarTodosLosPermisos = (...codigos_permisos) => {
    return async (req, res, next) => {
        try {
            
            if (!req.user || !req.user.id_usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const user_id = req.user.id_usuario;
            const permisosFaltantes = [];

            for (const codigo of codigos_permisos) {
                const result = await PermisoModel.verificarPermiso(user_id, codigo);
                if (result.rows.length === 0) {
                    permisosFaltantes.push(codigo);
                }
            }

            if (permisosFaltantes.length > 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Te faltan permisos requeridos',
                    permisos_faltantes: permisosFaltantes,
                    codigo_error: 'PERMISOS_FALTANTES'
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando todos los permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error verificando permisos',
                error: error.message
            });
        }
    };
};

export const verificarPropietario = (req, res, next) => {
    try {
        const { id_persona } = req.params;
        
        
        if (req.user && req.user.id_rol === 4) {
            if (!req.user.id_persona || id_persona !== req.user.id_persona) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes acceder a tus propios datos',
                    codigo_error: 'ACCESO_PROPIO_SOLAMENTE'
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Error verificando propietario:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando propiedad de datos',
            error: error.message
        });
    }
};