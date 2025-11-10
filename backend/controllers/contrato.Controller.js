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
  getEmpleados
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

export async function listarEmpleadosContratos(req, res) {
  try {
    const { q = '', perfil = 'Profesor', page = 1, limit = 20 } = req.query;
    const off = (Number(page)-1) * Number(limit);
    const data = await getEmpleados({q, perfil, limit: Number(limit), offset: off});
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar empleados' });
  }
}

// GET /api/contratos
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

// GET /api/contratos/:id
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

// POST /api/contratos
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

// PUT /api/contratos/:id
export async function actualizarContrato(req, res) {
  // Actualización intencionalmente deshabilitada: los contratos no son editables.
  res.status(405).json({ error: 'Actualización de contratos deshabilitada: los contratos no pueden modificarse una vez creados' });
}

// DELETE /api/contratos/:id
export async function eliminarContrato(req, res) {
  try {
    const { id } = req.params;
    const contrato = await deleteContrato(id);
    
    if (!contrato) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
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
          meta: { id_contrato: contrato.id_contrato_profesor }
        });
      }

      await notifyAdminsRRHH({
        tipo: 'CONTRATO_ELIMINADO',
        mensaje: `${persona?.nombre || ''} ${persona?.apellido || ''} - ${etiqueta} eliminado`,
        link: `/dashboard/contratos`,
        meta: { id_contrato: contrato.id_contrato_profesor, id_persona: contrato.id_persona }
      });
    } catch (error) {
      console.warn('eliminarContrato notify error:', error.message);
    }
  } catch (error) {
    console.error('Error en eliminarContrato:', error);
    res.status(400).json({ 
      error: 'Error al eliminar contrato',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET /api/contratos/persona/dni/:dni
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

// GET /api/contratos/profesor/:idPersona/detalles
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

// GET /api/contratos/materias
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

// POST /api/contratos/profesor/crear
export async function crearNuevoContratoProfesor(req, res) {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'JSON inválido' });

    const baseRequired = ['id_persona','id_profesor','id_periodo','horas_semanales','monto_hora','fecha_inicio'];
    const missing = baseRequired.filter(f => data[f] === undefined);

    const materias = parseMaterias(data);
    if (materias.length === 0) missing.push('id_materias (o id_materia)');

    if (missing.length) return res.status(400).json({ error: 'Faltan campos requeridos', missingFields: missing });

    const contrato = await crearContratoProfesor({ ...data, id_materias: materias });
    res.status(201).json(contrato);

    try {
      const persona = await getPersonaById(contrato.id_persona);
      const userRow = await getUsuarioIdPorPersonaId(contrato.id_persona);
      const etiquetaMaterias = materias.length === 1 ? '1 materia': `${materias.length} materias`;

      if(userRow?.id_usuario){
        await notifyUser(userRow.id_usuario, {
          tipo: 'CONTRATO_ASIGNADO',
          mensaje: `Se te asignó un contrato para ${etiquetaMaterias} (${contrato.horas_semanales} h/sem)`,
          link: `/dashboard/contratos/${contrato.id_contrato_profesor}`,
          meta: {
            id_contrato: contrato.id_contrato_profesor,
            fecha_inicio: contrato.fecha_inicio,
            fecha_fin: contrato.fecha_fin
          }
        });
      }

      await notifyAdminsRRHH({
        tipo: 'CONTRATO_CREADO',
        mensaje: `${persona?.nombre || ''} ${persona?.apellido || ''} - contrato creado (${etiquetaMaterias})`,
        link: `/dashboard/contratos/${contrato.id_contrato_profesor}`,
        meta: { id_contrato: contrato.id_contrato_profesor, id_persona: contrato.id_persona }
      });
    } catch (error) {
      console.warn('crearNuevoContratoProfesor notify error:', error.message);
    }

  } catch (error) {
    console.error('Error en crearNuevoContratoProfesor:', error);
    const msg = String(error.message || '');
    if (msg.includes('Solapamiento')) {
      return res.status(409).json({ error: msg }); // conflicto de fechas
    }
    if (msg.includes('no tiene registro de profesor')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(500).json({ error: 'Error al crear contrato de profesor', details: msg });
  }
}

// GET /api/contratos/external/:external_id
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