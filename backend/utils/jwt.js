import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_ACCESS_SECRET || 'miRORO_FIRORO';

export const generarTokenJWT = (payload) => {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verificarTokenJWT = (token) => {
    return jwt.verify(token, SECRET);
};

// Mantén la función original por compatibilidad
export const crearToken = (usuario) => {
    return jwt.sign(
        { id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
        SECRET,
        { expiresIn: '1d' }
    );
};