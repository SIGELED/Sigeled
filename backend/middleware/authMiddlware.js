import jwt from 'jsonwebtoken';
import { verificarTokenJWT } from '../utils/jwt.js';

// Middleware para verificar el token JWT
export const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
        const decoded = verificarTokenJWT(token.replace('Bearer ', ''));
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware para permitir solo a usuarios con rol "docente"
export const soloDocente = (req, res, next) => {
    if (req.user && req.user.rol === 'docente') {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso solo para docentes' });
    }
};