import { verificarTokenJWT } from '../utils/jwt.js';
import * as userModel from '../models/userModel.js';

const normalizePayload = (payload) => {
  const id_usuario = payload.id || payload.sub || payload.userId || payload.id_usuario || null;
  const id_persona = payload.id_persona || payload.personaId || payload.id_persona_usuario || payload.persona || null;
  let roles = [];
  if (Array.isArray(payload.roles)) roles = payload.roles;
  else if (Array.isArray(payload.perfiles)) {
    roles = payload.perfiles.map(p => (typeof p === 'string' ? p : (p?.codigo || p?.nombre))).filter(Boolean);
  } else if (payload.role) {
    roles = Array.isArray(payload.role) ? payload.role : [payload.role];
  }
  const id_rol = payload.id_rol ?? payload.id_perfil ?? payload.idPerfil ?? null;
  return { raw: payload, id_usuario, id_persona, roles, id_rol, perfiles: payload.perfiles ?? null };
};

export const verificarToken = async (req, res, next) => {
  try {
    console.log('[auth] Authorization header:', req.headers.authorization?.substring(0, 50) + '...');
    const header = req.headers.authorization || req.headers['authorization'];
    if (!header) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : header.trim();
    if (!token) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

    let payload;
    try {
      payload = verificarTokenJWT(token);
    } catch (err) {
      console.error('[auth] Token inválido:', err.message);
      return res.status(401).json({ success: false, message: 'Usuario no autenticado', detail: err.message });
    }

    req.user = normalizePayload(payload);

    // Si falta id_persona en el payload, enriquecer desde BD
    if ((!req.user.id_persona || req.user.id_persona === null) && req.user.id_usuario) {
      try {
        const u = await userModel.getUserById(req.user.id_usuario);
        if (u && u.id_persona) {
          req.user.id_persona = u.id_persona;
          console.log('[auth] id_persona enriquecido desde DB:', req.user.id_persona);
        } else {
          console.warn('[auth] usuario no tiene id_persona asociado:', req.user.id_usuario);
        }
      } catch (e) {
        console.warn('[auth] error enriqueciendo id_persona:', e.message);
      }
    }

    console.log('[auth] req.user:', { id_usuario: req.user.id_usuario, id_persona: req.user.id_persona, roles: req.user.roles });
    return next();
  } catch (err) {
    console.error('[auth] error inesperado:', err);
    return res.status(500).json({ success: false, message: 'Error interno de autenticación' });
  }
};

export default verificarToken;
export const authMiddleware = verificarToken;

export const permitirRoles = (...allowedRoles) => (req, res, next) => {
  const roles = req.user?.roles || [];
  const ok = roles.some(r => allowedRoles.includes(r));
  if (ok) return next();
  return res.status(403).json({ success: false, message: 'Acceso denegado: permisos insuficientes' });
};

export const soloAdministrador = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (roles.includes('ADMIN')) return next();
  return res.status(403).json({ success: false, message: 'Acceso solo para administradores' });
};

export const soloRRHH = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (roles.includes('RRHH') || roles.includes('ADMIN')) return next();
  return res.status(403).json({ success: false, message: 'Acceso denegado: solo RRHH o Admin' });
};

export const soloDocente = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (roles.includes('DOCENTE') || roles.includes('PROFESOR')) return next();
  return res.status(403).json({ success: false, message: 'Acceso solo para docentes' });
};