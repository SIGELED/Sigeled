// ...existing code...
import { verificarTokenJWT } from '../utils/jwt.js';

// Middleware para verificar el token JWT
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const decoded = verificarTokenJWT(token);
        req.user = decoded; // asegúrate que el token incluya id_usuario, id_persona, id_rol; si no, consulta la BD aquí
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Alias esperado por muchas rutas
export const authMiddleware = verificarToken;

// Middleware para permitir solo a usuarios con rol específico
export const permitirRoles = (...roles) => (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.some(rol => roles.includes(rol))) {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
    }
};

// Middleware para permitir solo a usuarios con rol "docente" (compatibilidad)
export const soloDocente = (req, res, next) => {
    if (req.user && (req.user.rol === 'docente' || (req.user.role_codigo && req.user.role_codigo.toString().toUpperCase() === 'DOCENTE'))) {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso solo para docentes' });
    }
};

// Middleware para permitir solo a usuarios con rol "administrador"
export const soloAdministrador = (req, res, next) => {
    const rolesUsuario = req.user?.roles || [];
    if (rolesUsuario.includes('ADMIN') || req.user?.id_rol === 1) {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso solo para administradores' });
    }
};

// Middleware para permitir solo a usuarios con rol "rrhh" o "administrador"
export const soloRRHH = (req, res, next) => {
    const rolesUsuario = req.user?.roles || [];
    if (rolesUsuario.includes('RRHH') || rolesUsuario.includes('ADMIN') || req.user?.id_rol === 2 || req.user?.id_rol === 1) {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: solo RRHH o Administrador' });
};
// ...existing code...