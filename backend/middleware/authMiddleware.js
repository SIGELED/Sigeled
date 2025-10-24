
import { verificarTokenJWT } from '../utils/jwt.js';
import { getContratoById } from '../models/contratoQueries.js';
import { getPersonaIdByUsuario } from '../models/personaModel.js';

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

export const soloAdministrador = (req, res, next) => {
    if (req.user && req.user.rol && req.user.rol.toLowerCase() === 'administrador') {
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

// Permitir al propietario del contrato o al administrador
export const permitirPropietarioOAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'ID de contrato requerido' });

        const contrato = await getContratoById(id);
        if (!contrato) return res.status(404).json({ message: 'Contrato no encontrado' });

        if (req.user && req.user.rol && req.user.rol.toLowerCase() === 'administrador') {
            return next();
        }

        const id_usuario = req.user && req.user.id_usuario;
        if (!id_usuario) return res.status(401).json({ message: 'Usuario no autenticado' });

        const id_persona = await getPersonaIdByUsuario(id_usuario);
        if (!id_persona) return res.status(403).json({ message: 'No autorizado: sin persona vinculada' });

        if (String(id_persona) === String(contrato.id_persona)) {
            return next();
        }

        return res.status(403).json({ message: 'Acceso denegado: no es propietario ni administrador' });
    } catch (error) {
        console.error('Error en permitirPropietarioOAdmin:', error);
        return res.status(500).json({ message: 'Error en verificación de propiedad' });
    }
};