import {
  getAllContratos,
  getContratoById,
  getContratoByExternalId,
  createContrato,
  deleteContrato,
  getPersonaByDni,
  getProfesorDetalles,
  getMateriasByCarreraAnio,
  crearContratoProfesor,
  getEmpleados,
  getPeriodos,
  getTarifasByPersona,
  createContratoGeneral
} from '../models/contratoModel.js';
import { notifyAdminsRRHH, notifyUser } from '../utils/notify.js';
import { getUsuarioIdPorPersonaId } from '../models/userModel.js';
import { getPersonaById } from '../models/personaModel.js';

function parseMaterias(body) {
  const arr = Array.isArray(body.id_materias)
    ? body.id_materias
    : (body.id_materia ? [body.id_materia] : []);
  const isUUID = (s) =>
    typeof s === 'string' &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s);
  return arr.filter(isUUID);
}

export async function listarTarifasPorPersona(req, res) {
  try {
    const { idPersona } = req.params;
    const filas = await getTarifasByPersona(idPersona);

    res.json({
      perfiles: filas.map((f) => ({
        id_perfil: f.id_perfil,
        nombre: f.perfil_nombre,
        codigo: f.perfil_codigo,
        tarifas: f.tarifas || [],
      })),
    });
  } catch (error) {
    console.error('Error en listarTarifasPorPersona:', error);
    res.status(500).json({
      error: 'Error al obtener tarifas para la persona',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}


export async function listarEmpleadosContratos(req, res) {
  try {
    const { q = '', perfil, page = 1, limit = 20 } = req.query;
    const off = (Number(page) - 1) * Number(limit);

    const perfiles =
      perfil && typeof perfil === 'string'
        ? perfil.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Profesor', 'Coordinador', 'Administrativo', 'Recursos Humanos', 'Investigador'];

    const data = await getEmpleados({
      q,
      perfil: perfiles,
      limit: Number(limit),
      offset: off,
    });
    res.json(data);
  } catch (error) {
    console.error('Error en listarEmpleadosContratos:', error);
    res.status(500).json({ error: 'Error al listar empleados' });
  }
}


export async function listarContratos(req, res) {
  try {
    const { persona } = req.query;
    const contratos = await getAllContratos({ persona });
    res.json(contratos);
  } catch (error) {
    console.error('Error en listarContratos:', error);
    res.status(500).json({ 
      error: 'Error al obtener contratos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function obtenerContrato(req, res) {
  try {
    const { id } = req.params;
    const contrato = await getContratoById(id);
    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    res.json(contrato);
  } catch (error) {
    console.error('Error en obtenerContrato:', error);
    res.status(500).json({ 
      error: 'Error al obtener contrato',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function crearContratoHandler(req, res) {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'JSON inválido' });
    }

    const baseRequired = ['id_persona','id_profesor','id_periodo','horas_semanales','monto_hora','fecha_inicio','fecha_fin'];
    const missing = baseRequired.filter(f => data[f] === undefined);
    const materias = parseMaterias(data);
    if (materias.length === 0) missing.push('id_materias (o id_materia)');

    if (missing.length) {
      return res.status(400).json({ error: 'Faltan campos requeridos', missingFields: missing });
    }

    const contrato = await createContrato({ ...data, id_materias: materias });
    res.status(201).json(contrato);

    try {
      const persona = await getPersonaById(contrato.id_persona);
      const userRow = await getUsuarioIdPorPersonaId(contrato.id_persona);
      const etiquetaMaterias = materias.length === 1 ? '1 materia' : `${materias.length} materias`;

      if (userRow?.id_usuario) {
        await notifyUser(userRow.id_usuario, {
          tipo: 'CONTRATO_ASIGNADO',
          mensaje: `Se te asignó un contrato para ${etiquetaMaterias} (${contrato.horas_semanales} h/sem)`,
          link: `/dashboard/contratos/${contrato.id_contrato_profesor}`,
          meta: { id_contrato: contrato.id_contrato_profesor, fecha_inicio: contrato.fecha_inicio, fecha_fin: contrato.fecha_fin }
        });
      }
      await notifyAdminsRRHH({
        tipo: 'CONTRATO_CREADO',
        mensaje: `${persona?.nombre || ''} ${persona?.apellido || ''} - contrato creado (${etiquetaMaterias})`,
        link: `/dashboard/contratos/${contrato.id_contrato_profesor}`,
        meta: { id_contrato: contrato.id_contrato_profesor, id_persona: contrato.id_persona }
      });
    } catch (e) { console.warn('crearContrato notify error:', e.message); }

  } catch (error) {
    console.error('Error en crearContrato:', error);
    res.status(400).json({ error: 'Error al crear contrato', details: process.env.NODE_ENV==='development' ? error.message : undefined });
  }
}

export async function actualizarContrato(req, res) {
  res.status(405).json({ error: 'Actualización de contratos deshabilitada: los contratos no pueden modificarse una vez creados' });
}

export async function eliminarContrato(req, res) {
  try {
    const { id } = req.params;
    const contrato = await deleteContrato(id);

    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const idContratoMeta =
      contrato.id_contrato ?? contrato.id_contrato_profesor ?? Number(id);

    res.json({ message: 'Contrato eliminado exitosamente', contrato });

    try {
      const persona = await getPersonaById(contrato.id_persona);
      const userRow = await getUsuarioIdPorPersonaId(contrato.id_persona);
      const etiqueta = 'contrato';

      if (userRow?.id_usuario) {
        await notifyUser(userRow.id_usuario, {
          tipo: 'CONTRATO_ELIMINADO',
          mensaje: `Se eliminó tu ${etiqueta}`,
          link: `/dashboard/contratos`,
          meta: { id_contrato: idContratoMeta },
        });
      }

      await notifyAdminsRRHH({
        tipo: 'CONTRATO_ELIMINADO',
        mensaje: `${persona?.nombre || ''} ${persona?.apellido || ''} - ${etiqueta} eliminado`,
        link: `/dashboard/contratos`,
        meta: {
          id_contrato: idContratoMeta,
          id_persona: contrato.id_persona,
        },
      });
    } catch (error) {
      console.warn('eliminarContrato notify error:', error.message);
    }
  } catch (error) {
    console.error('Error en eliminarContrato:', error);
    res.status(400).json({
      error: 'Error al eliminar contrato',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}


export async function buscarPersonaPorDni(req, res) {
  try {
    const { dni } = req.params;
    const persona = await getPersonaByDni(dni);
    
    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    
    res.json(persona);
  } catch (error) {
    console.error('Error en buscarPersonaPorDni:', error);
    res.status(500).json({ 
      error: 'Error al buscar persona',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function obtenerDetallesProfesor(req, res) {
  try {
    const { idPersona } = req.params;
    const detalles = await getProfesorDetalles(idPersona);
    
    if (!detalles) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }
    
    res.json(detalles);
  } catch (error) {
    console.error('Error en obtenerDetallesProfesor:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalles del profesor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function listarMateriasPorCarreraAnio(req, res) {
  try {
    const { idCarrera, idAnio } = req.query;
    
    if (!idCarrera || !idAnio) {
      return res.status(400).json({ 
        error: 'Se requieren los parámetros idCarrera e idAnio' 
      });
    }
    
    const materias = await getMateriasByCarreraAnio(idCarrera, idAnio);
    res.json(materias);
  } catch (error) {
    console.error('Error en listarMateriasPorCarreraAnio:', error);
    res.status(500).json({ 
      error: 'Error al obtener materias',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function crearNuevoContratoProfesor(req, res) {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'JSON inválido' });
    }

    const missing = [];
    const tieneItems = Array.isArray(data.items) && data.items.length > 0;

    if (!data.id_persona) missing.push('id_persona');
    if (!data.id_profesor) missing.push('id_profesor');
    if (data.id_periodo === undefined || data.id_periodo === null || data.id_periodo === '') {
      missing.push('id_periodo');
    }
    if (!data.fecha_inicio) missing.push('fecha_inicio');
    if (!data.fecha_fin) missing.push('fecha_fin');

    let materias = [];

    if (!tieneItems) {
      missing.push('items');
    } else {
      const malos = [];

      (data.items || []).forEach((it, idx) => {
        if (!it || typeof it !== 'object') {
          malos.push(`items[${idx}]`);
          return;
        }
        if (!it.id_materia) malos.push(`items[${idx}].id_materia`);
        if (!it.cargo) malos.push(`items[${idx}].cargo`);
        if (it.horas_semanales === undefined || it.horas_semanales === null) {
          malos.push(`items[${idx}].horas_semanales`);
        }
      });

      if (malos.length) {
        missing.push(...malos);
      }

      materias = (data.items || [])
        .map((it) => it.id_materia)
        .filter(Boolean);
    }

    if (!materias.length) {
      missing.push('id_materias (derivadas de items.id_materia)');
    }

    if (missing.length) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        missingFields: missing,
      });
    }

    const totalHorasSem = (data.items || []).reduce(
      (acc, it) => acc + (Number(it.horas_semanales) || 0),
      0
    );
    const horasMensuales = totalHorasSem * 4;

    data.horas_semanales = totalHorasSem;
    data.horas_mensuales = horasMensuales;
    data.id_materias = materias;

    const contrato = await crearContratoProfesor(data);

    try {
      const persona = await getPersonaById(contrato.id_persona);
      const userRow = await getUsuarioIdPorPersonaId(contrato.id_persona);
      const etiquetaMaterias =
        materias.length === 1 ? '1 materia' : `${materias.length} materias`;

      if (userRow?.id_usuario) {
        await notifyUser(userRow.id_usuario, {
          tipo: 'CONTRATO_ASIGNADO',
          mensaje: `Se te asignó un contrato para ${etiquetaMaterias} (${contrato.horas_semanales} h/sem)`,
          link: `/dashboard/contratos/${contrato.id_contrato_profesor}`,
          meta: {
            id_contrato: contrato.id_contrato_profesor,
            fecha_inicio: contrato.fecha_inicio,
            fecha_fin: contrato.fecha_fin,
          },
        });
      }

      await notifyAdminsRRHH({
        tipo: 'CONTRATO_CREADO',
        mensaje: `${persona?.nombre || ''} ${persona?.apellido || ''} - contrato creado (${etiquetaMaterias})`,
        link: `/dashboard/contratos/${contrato.id_contrato_profesor}`,
        meta: {
          id_contrato: contrato.id_contrato_profesor,
          id_persona: contrato.id_persona,
        },
      });
    } catch (error) {
      console.warn('crearNuevoContratoProfesor notify error:', error.message);
    }

    return res.status(201).json(contrato);
  } catch (error) {
    console.error('Error en crearNuevoContratoProfesor:', error);
    const msg = String(error.message || '');
    if (msg.includes('Solapamiento')) {
      return res.status(409).json({ error: msg });
    }
    if (msg.includes('no tiene registro de profesor')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(500).json({
      error: 'Error al crear contrato de profesor',
      details: msg,
    });
  }
}

export async function obtenerContratoPorExternalId(req, res) {
  try {
    const { external_id } = req.params;
    const contrato = await getContratoByExternalId(external_id);
    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    res.json(contrato);
  } catch (error) {
    console.error('Error en obtenerContratoPorExternalId:', error);
    res.status(500).json({ 
      error: 'Error al obtener contrato por external_id',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function listarMisContratos(req, res) {
  try {
    const id_persona = req.user?.id_persona;

    if(!id_persona) {
      return res.status(401).json({ error: 'No se pudo identificar el usuario desde el token' });
    }

    const contratos = await getAllContratos({persona: id_persona});
    res.json(contratos);
  } catch (error) {
    console.error('Error en listarMisContratos:', error);
    res.status(500).json({
      error: 'Error al obtener mis contratos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function listarPeriodos(req, res) {
  try {
    const periodos = await getPeriodos();
    res.json(periodos);
  } catch (error) {
    console.error("Error en listarPeriodos:", error);
    res.status(500).json({ error: 'Error al obtener períodos' });
  }
}

export async function crearContratoGeneralHandler(req, res) {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'JSON inválido' });
    }

    const missing = [];
    if (!data.id_persona) missing.push('id_persona');
    if (data.id_periodo === undefined || data.id_periodo === null || data.id_periodo === '') {
      missing.push('id_periodo');
    }
    if (!data.fecha_inicio) missing.push('fecha_inicio');
    if (!data.fecha_fin) missing.push('fecha_fin');
    if (!Array.isArray(data.items) || !data.items.length) {
      missing.push('items');
    }

    if (missing.length) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        missingFields: missing,
      });
    }

    data.id_periodo = Number(data.id_periodo);

    const contrato = await createContratoGeneral(data);

    try {
      const persona = await getPersonaById(contrato.id_persona);
      const userRow = await getUsuarioIdPorPersonaId(contrato.id_persona);
      const etiqueta = `${contrato.horas_semanales || 0} h/sem, $${contrato.total_importe_mensual || 0} /mes`;

      if (userRow?.id_usuario) {
        await notifyUser(userRow.id_usuario, {
          tipo: 'CONTRATO_ASIGNADO',
          mensaje: `Se te asignó un nuevo contrato (${etiqueta})`,
          link: `/dashboard/contratos/${contrato.id_contrato}`,
          meta: {
            id_contrato: contrato.id_contrato,
            fecha_inicio: contrato.fecha_inicio,
            fecha_fin: contrato.fecha_fin,
          },
        });
      }

      await notifyAdminsRRHH({
        tipo: 'CONTRATO_CREADO',
        mensaje: `${persona?.nombre || ''} ${persona?.apellido || ''} - contrato general creado`,
        link: `/dashboard/contratos/${contrato.id_contrato}`,
        meta: {
          id_contrato: contrato.id_contrato,
          id_persona: contrato.id_persona,
        },
      });
    } catch (e) {
      console.warn('crearContratoGeneral notify error:', e.message);
    }

    return res.status(201).json(contrato);
  } catch (error) {
    console.error('Error en crearContratoGeneralHandler:', error);
    const msg = String(error.message || '');
    if (msg.includes('Solapamiento')) {
      return res.status(409).json({ error: msg });
    }
    return res.status(500).json({
      error: 'Error al crear contrato general',
      details: msg,
    });
  }
}
