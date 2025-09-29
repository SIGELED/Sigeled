import jwt from 'jsonwebtoken';
import { verificarTokenJWT } from '../utils/jwt.js';

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Header authorization recibido:', authHeader); // LOG temporal
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    console.log('Token extraído:', token); // LOG temporal

    try {
        const decoded = verificarTokenJWT(token);
        console.log('Token decodificado:', decoded); // LOG temporal
        req.user = decoded; // Ahora incluye { id_usuario, email, rol }
        next();
    } catch (error) {
        console.log('Error al verificar token:', error.message); // LOG temporal
        return res.status(401).json({ message: 'Token inválido' });
    }
};

export const permitirRoles = (...roles) => (req, res, next) => {
    console.log('Roles permitidos:', roles);
    console.log('Rol del usuario:', req.user?.rol);
    
    if (req.user && roles.some(rol => rol.toLowerCase() === req.user.rol.toLowerCase())) {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
    }
};

// Middleware para permitir solo a usuarios con rol "docente" (compatibilidad)
export const soloDocente = (req, res, next) => {
    if (req.user && req.user.rol === 'docente') {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso solo para docentes' });
    }
};

// Middleware para permitir solo a usuarios con rol "administrador"
export const soloAdministrador = (req, res, next) => {
    if (req.user && req.user.rol === 'administrador') {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso solo para administradores' });
    }
};

// Middleware para permitir solo a usuarios con rol "rrhh" o "administrador"
export const soloRRHH = (req, res, next) => {
    if (req.user && (req.user.rol === 'rrhh' || req.user.rol === 'administrador')) {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: solo RRHH o Administrador' });
};