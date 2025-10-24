import * as model from '../models/personaDomiModel.js';

// Helper: comprobar roles privilegiados (acepta id_rol numérico o roles/perfiles como array)
const isAdminOrRRHH = (req) => {
  const user = req.user;
  if (!user) return false;
  const rolNum = Number(user.id_rol || user.id_perfil || user.idPerfil || 0);
  if ([1, 2, 3].includes(rolNum)) return true;
  const roleNames = Array.isArray(user.roles) ? user.roles : (Array.isArray(user.perfiles) ? user.perfiles.map(p => p?.codigo || p?.nombre) : []);
  return roleNames.some(r => ['ADMIN', 'RRHH', 'ADMINISTRATIVO'].includes(String(r)));
};

/* Listar todos (solo admin/rrhh) */
export const listAllDomicilios = async (req, res, next) => {
  try {
    if (!isAdminOrRRHH(req)) return res.status(403).json({ success: false, message: 'Acceso denegado' });
    const rows = await model.getAllDomicilios();
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* Listar por persona: admin/rrhh pueden ver cualquiera, usuario normal solo sus domicilios */
export const listByPersona = async (req, res, next) => {
  try {
    const { id_persona } = req.params;
    if (!id_persona) return res.status(400).json({ success: false, message: 'id_persona requerido' });

    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

    const userPersonaId = String(user.id_persona || user.id || user.id_persona_sistema || '');
    if (!isAdminOrRRHH(req) && userPersonaId !== String(id_persona)) {
      return res.status(403).json({ success: false, message: 'Solo puedes ver tus propios domicilios' });
    }

    const rows = await model.getDomiciliosByPersona(id_persona);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* Obtener domicilio por id (admin/rrhh todos, empleado sólo si le pertenece) */
export const getDomicilio = async (req, res, next) => {
  try {
    const { id_domicilio } = req.params;
    if (!id_domicilio) return res.status(400).json({ success: false, message: 'id_domicilio requerido' });

    const dom = await model.getDomicilioById(id_domicilio);
    if (!dom) return res.status(404).json({ success: false, message: 'Domicilio no encontrado' });

    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

    const userPersonaId = String(user.id_persona || user.id || '');
    if (!isAdminOrRRHH(req) && userPersonaId !== String(dom.id_persona)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    return res.json({ success: true, data: dom });
  } catch (err) { next(err); }
};

export const getDomiciliosByDni = async (req, res, next) => {
  try {
    const { dni } = req.params;
    if (!dni) return res.status(400).json({ success: false, message: 'DNI requerido' });

    if (!isAdminOrRRHH(req)) return res.status(403).json({ success: false, message: 'Acceso denegado' });

    const rows = await model.getDomiciliosByDni(dni);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /departamentos
export const listDepartamentos = async (req, res, next) => {
  try {
    const rows = await model.getDepartamentos();
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /localidades?departamentoId=#
export const listLocalidades = async (req, res, next) => {
  try {
    const { departamentoId } = req.query;
    if (!departamentoId) return res.status(400).json({ success:false, message:'departamentoId requerido' });
    const rows = await model.getLocalidadesByDepartamento(departamentoId);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /barrios?localidadId=#
export const listBarrios = async (req, res, next) => {
  try {
    const { localidadId } = req.query;
    if (!localidadId) return res.status(400).json({ success:false, message:'localidadId requerido' });
    const rows = await model.getBarriosByLocalidad(localidadId);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};


/* Crear domicilio (admin/rrhh pueden crear para cualquier id_persona; usuario sólo para sí mismo) */
export const createDomicilio = async (req, res, next) => {
  try {
    const { id_persona } = req.params;
    const { calle, altura, barrio } = req.body;

    if (!calle || !barrio) return res.status(400).json({ success:false, message:'calle y barrio requeridos' });

    const user = req.user;
    if (!user) return res.status(401).json({ success:false, message:'Usuario no autenticado' });

    const userPersonaId = String(user.id_persona || user.id || '');
    if (!isAdminOrRRHH(req) && userPersonaId !== String(id_persona)) {
      return res.status(403).json({ success:false, message:'Solo puedes crear tu propio domicilio' });
    }

    const created = await model.createDomicilioWithBarrio({
      id_persona,
      calle,
      altura,
      barrioData: barrio
    });

    const full = await model.getDomicilioFullById(created.id_domicilio);
    return res.status(201).json({ success: true, data: full });
  } catch (err) { next(err); }
};

/* Actualizar domicilio (admin/rrhh cualquiera, empleado sólo si le pertenece) */
export const updateDomicilio = async (req, res, next) => {
  try {
    const { id_domicilio } = req.params;
    const data = req.body;
    if (!id_domicilio) return res.status(400).json({ success:false, message:'id_domicilio requerido' });

    const dom = await model.getDomicilioById(id_domicilio);
    if (!dom) return res.status(404).json({ success:false, message:'Domicilio no encontrado' });

    const user = req.user;
    if (!user) return res.status(401).json({ success:false, message:'Usuario no autenticado' });

    const userPersonaId = String(user.id_persona || user.id || '');
    if (!isAdminOrRRHH(req) && userPersonaId !== String(dom.id_persona)) {
      return res.status(403).json({ success:false, message:'Acceso denegado' });
    }

    const updated = await model.updateDomicilio(id_domicilio, data);
    if (!updated) return res.status(400).json({ success:false, message:'No se actualizó' });

    return res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

/* Eliminar domicilio (admin/rrhh cualquiera, empleado sólo si le pertenece) */
export const deleteDomicilio = async (req, res, next) => {
  try {
    const { id_persona, id_domicilio } = req.params;
    if (!id_persona || !id_domicilio) return res.status(400).json({ success:false, message:'id_persona e id_domicilio requeridos' });

    const dom = await model.getDomicilioById(id_domicilio);
    if (!dom) return res.status(404).json({ success:false, message:'Domicilio no encontrado' });

    if (String(dom.id_persona) !== String(id_persona)) return res.status(400).json({ success:false, message:'Domicilio no pertenece a la persona indicada' });

    const user = req.user;
    if (!user) return res.status(401).json({ success:false, message:'Usuario no autenticado' });

    const userPersonaId = String(user.id_persona || user.id || '');
    if (!isAdminOrRRHH(req) && userPersonaId !== String(id_persona)) {
      return res.status(403).json({ success:false, message:'No autorizado para eliminar este domicilio' });
    }

    const deleted = await model.deleteDomicilio(id_domicilio);
    return res.status(200).json({ success: true, data: deleted });
  } catch (err) { next(err); }
};