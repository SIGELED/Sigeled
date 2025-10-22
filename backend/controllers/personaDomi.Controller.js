import * as model from '../models/personaDomiModel.js';

// Helper: roles 1=ADMIN, 2=RRHH
const isAdminOrRRHH = (req) => {
  return !!(req.user && (req.user.id_rol === 1 || req.user.id_rol === 2 || req.user.id_rol === 3));
};

/* Listar todos (solo admin/rrhh) */
export const listAllDomicilios = async (req, res, next) => {
  try {
    if (!isAdminOrRRHH(req)) {
      const e = new Error('Acceso denegado'); e.status = 403; throw e;
    }
    const rows = await model.getAllDomicilios();
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* Listar por persona: admin/rrhh pueden ver cualquiera, usuario normal solo sus domicilios */
export const listByPersona = async (req, res, next) => {
  try {
    const { id_persona } = req.params;
    if (!id_persona) { const e = new Error('id_persona requerido'); e.status = 400; throw e; }

    if (!isAdminOrRRHH(req)) {
      if (!req.user || String(req.user.id_persona) !== String(id_persona)) {
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
      if (!req.user || String(req.user.id_persona) !== String(dom.id_persona)) {
        const err = new Error('Acceso denegado'); err.status = 403; throw err;
      }
    }

    return res.json({ success: true, data: dom });
  } catch (err) { next(err); }
};

export const getDomiciliosByDni = async (req, res, next) => {
  try {
    const { dni } = req.params;
    if (!dni) { const e = new Error('DNI requerido'); e.status = 400; throw e; }

    if (!isAdminOrRRHH(req)) {
      const e = new Error('Acceso denegado'); e.status = 403; throw e;
    }

    const rows = await model.getDomiciliosByDni(dni);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /departamentos
export const listDepartamentos = async (req, res, next) => {
  try {
    const rows = await model.getDepartamentos();
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /localidades?departamentoId=#
export const listLocalidades = async (req, res, next) => {
  try {
    const { departamentoId } = req.query;
    if (!departamentoId) return res.status(400).json({ success:false, message:'departamentoId requerido' });
    const rows = await model.getLocalidadesByDepartamento(departamentoId);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /barrios?localidadId=#
export const listBarrios = async (req, res, next) => {
  try {
    const { localidadId } = req.query;
    if (!localidadId) return res.status(400).json({ success:false, message:'localidadId requerido' });
    const rows = await model.getBarriosByLocalidad(localidadId);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};



/* Crear domicilio (admin/rrhh pueden crear para cualquier id_persona; usuario sólo para sí mismo) */
export const createDomicilio = async (req, res, next) => {
  try {
    const { id_persona } = req.params;
    const { calle, altura, barrio } = req.body;

    if (!calle || !barrio) return res.status(400).json({ success:false, message:'calle y barrio requeridos' });

    // permiso: si no ADMIN/RRHH/ADMTVO, solo puede crear su propio domicilio
    const rol = Number(req.user?.id_rol);
    if (![1,2,3].includes(rol)) { // 4=EMP
      if (!req.user || String(req.user.id_persona) !== String(id_persona)) {
        return res.status(403).json({ success:false, message:'Solo puedes crear tu propio domicilio' });
      }
    }

    const created = await model.createDomicilioWithBarrio({
      id_persona,
      calle,
      altura,
      barrioData: barrio
    });

    const full = await model.getDomicilioFullById(created.id_domicilio);
    res.status(201).json({ success: true, data: full });
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
      if (!req.user || String(req.user.id_persona) !== String(dom.id_persona)) {
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
      if (!req.user || String(req.user.id_persona) !== String(dom.id_persona)) {
        const err = new Error('Acceso denegado'); err.status = 403; throw err;
      }
    }

    const result = await model.deleteDomicilio(id_domicilio);
    if (result.rowCount === 0) { const e = new Error('No se eliminó'); e.status = 400; throw e; }

    return res.status(204).send();
  } catch (err) { next(err); }
};
