import * as model from '../models/personaDomiModel.js';

/* Helpers */
const isAdminOrRRHH = (req) => {
  if (!req.user || !req.user.id_rol) return false;
  return req.user.id_rol === 1 || req.user.id_rol === 2; // 1=ADMIN,2=RRHH
};

/* Listar todos (solo admin/rrhh) */
export const listAllDomicilios = async (req, res, next) => {
  try {
    if (!isAdminOrRRHH(req)) {
      const err = new Error('Acceso denegado');
      err.status = 403; throw err;
    }
    const rows = await model.getAllDomicilios();
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* Listar por persona: admin/rrhh pueden ver cualquiera, usuario normal solo sus domicilios */
export const listByPersona = async (req, res, next) => {
  try {
    const { id_persona } = req.params;
    if (!id_persona) { const e = new Error('id_persona requerido'); e.status = 400; throw e; }

    if (!isAdminOrRRHH(req)) {
      // empleado sólo puede ver si es su persona
      if (!req.user || req.user.id_persona !== id_persona) {
        const err = new Error('Solo puedes ver tus propios domicilios'); err.status = 403; throw err;
      }
    }

    const rows = await model.getDomiciliosByPersona(id_persona);
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* Obtener domicilio por id (admin/rrhh todos, empleado sólo si le pertenece) */
export const getDomicilio = async (req, res, next) => {
  try {
    const { id_domicilio } = req.params;
    const dom = await model.getDomicilioById(id_domicilio);
    if (!dom) { const e = new Error('Domicilio no encontrado'); e.status = 404; throw e; }

    if (!isAdminOrRRHH(req)) {
      if (!req.user || req.user.id_persona !== dom.id_persona) {
        const err = new Error('Acceso denegado'); err.status = 403; throw err;
      }
    }

    return res.json({ success: true, data: dom });
  } catch (err) { next(err); }
};

/* Crear domicilio (admin/rrhh pueden crear para cualquier id_persona; usuario sólo para sí mismo) */
export const createDomicilio = async (req, res, next) => {
  try {
    const { id_persona } = req.params;
    const { calle, altura, id_dom_barrio } = req.body;

    if (!calle) { const e = new Error('calle es requerida'); e.status = 400; throw e; }
    if (!id_dom_barrio) { const e = new Error('id_dom_barrio es requerido'); e.status = 400; throw e; }

    if (!isAdminOrRRHH(req)) {
      if (!req.user || req.user.id_persona !== id_persona) {
        const err = new Error('Solo puedes crear tu propio domicilio'); err.status = 403; throw err;
      }
    }

    const created = await model.createDomicilio({ id_persona, calle, altura, id_dom_barrio });
    const full = await model.getDomicilioById(created.id_domicilio);
    return res.status(201).json({ success: true, data: full });
  } catch (err) { next(err); }
};

/* Actualizar domicilio (admin/rrhh cualquiera, empleado sólo si le pertenece) */
export const updateDomicilio = async (req, res, next) => {
  try {
    const { id_domicilio } = req.params;
    const data = req.body;

    const dom = await model.getDomicilioById(id_domicilio);
    if (!dom) { const e = new Error('Domicilio no encontrado'); e.status = 404; throw e; }

    if (!isAdminOrRRHH(req)) {
      if (!req.user || req.user.id_persona !== dom.id_persona) {
        const err = new Error('Acceso denegado'); err.status = 403; throw err;
      }
    }

    const result = await model.updateDomicilio(id_domicilio, data);
    if (result.rowCount === 0) { const e = new Error('No se actualizó'); e.status = 400; throw e; }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/* Eliminar domicilio (admin/rrhh cualquiera, empleado sólo si le pertenece) */
export const deleteDomicilio = async (req, res, next) => {
  try {
    const { id_domicilio } = req.params;
    const dom = await model.getDomicilioById(id_domicilio);
    if (!dom) { const e = new Error('Domicilio no encontrado'); e.status = 404; throw e; }

    if (!isAdminOrRRHH(req)) {
      if (!req.user || req.user.id_persona !== dom.id_persona) {
        const err = new Error('Acceso denegado'); err.status = 403; throw err;
      }
    }

    const result = await model.deleteDomicilio(id_domicilio);
    if (result.rowCount === 0) { const e = new Error('No se eliminó'); e.status = 400; throw e; }

    return res.status(204).send();
  } catch (err) { next(err); }
};