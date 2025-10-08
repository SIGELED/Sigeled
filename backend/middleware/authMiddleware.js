import jwt from 'jsonwebtoken';
import { verificarTokenJWT } from '../utils/jwt.js';
import db from '../models/db.js';

// Middleware principal con información completa del usuario
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log('Header authorization recibido:', authHeader);
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                message: 'Token no proporcionado' 
            });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('Token extraído:', token);

        // Verificar y decodificar token
        const decoded = verificarTokenJWT(token);
        console.log('Token decodificado:', decoded);

        // Query con tu esquema real
        const userQuery = `
            SELECT 
                u.id_usuario,
                u.email,
                u.id_persona,
                u.activo,
                r.id_rol,
                r.nombre as role_name,
                p.nombre as persona_nombre,
                p.apellido as persona_apellido,
                pi.dni
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN roles r ON ur.id_rol = r.id_rol
            LEFT JOIN personas p ON u.id_persona = p.id_persona
            LEFT JOIN personas_identificacion pi ON p.id_persona = pi.id_persona
            WHERE u.id_usuario = $1 AND u.activo = true
        `;
        
        const result = await db.query(userQuery, [decoded.id_usuario || decoded.id_user]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }
        
        const user = result.rows[0];
        
        // Información completa en req.user (mantener compatibilidad)
        req.user = {
            // Nuevos campos con tu esquema
            id_usuario: user.id_usuario,
            id_rol: user.id_rol,
            
            // Compatibilidad con código existente
            id_user: user.id_usuario,
            id_role: user.id_rol,
            
            // Información común
            email: user.email,
            role_name: user.role_name,
            rol: user.role_name?.toLowerCase(),
            id_persona: user.id_persona,
            
            // Información adicional de la persona
            nombre_completo: user.persona_nombre && user.persona_apellido 
                ? `${user.persona_nombre} ${user.persona_apellido}` 
                : null,
            dni: user.dni
        };

        console.log('Usuario autenticado:', req.user);
        next();

    } catch (error) {
        console.log('Error al verificar token:', error.message);
        return res.status(401).json({ 
            success: false,
            message: 'Token inválido',
            error: error.message 
        });
    }
};

// Mantener compatibilidad
export const verificarToken = async (req, res, next) => {
    return authMiddleware(req, res, next);
};

// Actualizado para usar id_rol (smallint)
export const verificarRolMinimo = (rol_minimo_id) => {
    return (req, res, next) => {
        if (!req.user || !req.user.id_rol) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // En tu sistema: 1=ADMIN, 2=RRHH, 3=ADMTVO, 4=EMP
        if (req.user.id_rol > rol_minimo_id) {
            const roles_map = { 1: 'ADMIN', 2: 'RRHH', 3: 'ADMTVO', 4: 'EMP' };
            
            return res.status(403).json({
                success: false,
                message: 'Rol insuficiente para esta acción',
                tu_rol: roles_map[req.user.id_rol],
                rol_minimo_requerido: roles_map[rol_minimo_id],
                codigo_error: 'ROL_INSUFICIENTE'
            });
        }
        
        next();
    };
};

// Resto de middlewares actualizados...
export const permitirRoles = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const tieneRolPorNombre = roles.some(rol => 
        rol.toLowerCase() === req.user.rol?.toLowerCase()
    );

    const roleMap = {
        'administrador': 1,
        'rrhh': 2,
        'administrativo': 3,
        'empleado': 4
    };

    const tieneRolPorId = roles.some(rol => {
        const rolId = roleMap[rol.toLowerCase()];
        return rolId && req.user.id_rol <= rolId;
    });

    if (tieneRolPorNombre || tieneRolPorId) {
        next();
    } else {
        return res.status(403).json({ 
            message: 'Acceso denegado: permisos insuficientes',
            rol_usuario: req.user.rol,
            roles_permitidos: roles
        });
    }
};