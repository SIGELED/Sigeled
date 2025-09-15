// Middleware de autorización para edición/eliminación/verificación de datos de persona
import jwt from 'jsonwebtoken';

export function autorizarEdicion(req, res, next) {
  const usuario = req.usuario; // Se asume que el usuario ya está en req.usuario por el middleware de autenticación
  const id_persona = req.params.id_persona;
  // Solo el propio usuario puede editar/eliminar sus datos
  if (usuario.rol === 'RRHH' || usuario.rol === 'ADMINISTRATIVO') {
    return next(); // RRHH y Administrativo pueden verificar
  }
  if (usuario.id_usuario && usuario.id_usuario.toString() === id_persona.toString()) {
    return next();
  }
  return res.status(403).json({ error: 'No tienes permisos para modificar este legajo.' });
}

export function autorizarVerificacion(req, res, next) {
  const usuario = req.usuario;
  if (usuario.rol === 'RRHH' || usuario.rol === 'ADMINISTRATIVO') {
    return next();
  }
  return res.status(403).json({ error: 'Solo RRHH o Administrativo pueden verificar datos.' });
}

// Middleware para manejar errores de validación
function manejarErroresValidacion(req, res, next) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}
