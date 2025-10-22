import {
  getAllContratos,
  getContratoById,
  getContratoByExternalId,
  createContrato,
  deleteContrato,
  getPersonaByDni,
  getProfesorDetalles,
  getMateriasByCarreraAnio,
  crearContratoProfesor
} from '../models/contratoQueries.js';

// GET /api/contratos
export async function listarContratos(req, res) {
  try {
    const contratos = await getAllContratos();
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
      return res.status(400).json({ 
        error: 'Se esperaba un objeto JSON válido en el cuerpo de la solicitud' 
      });
    }
    
  // Validar campos requeridos (fecha_fin es obligatoria según regla)
  const requiredFields = ['id_persona', 'id_profesor', 'id_materia', 'id_periodo', 'horas_semanales', 'monto_hora', 'fecha_inicio', 'fecha_fin'];
    const missingFields = requiredFields.filter(field => data[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        missingFields
      });
    }
    
    const contrato = await createContrato(data);
    res.status(201).json(contrato);
  } catch (error) {
    console.error('Error en crearContrato:', error);
    res.status(400).json({ 
      error: 'Error al crear contrato',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ 
        error: 'Se esperaba un objeto JSON válido en el cuerpo de la solicitud' 
      });
    }
    
    // Validar campos requeridos
    const requiredFields = ['id_persona', 'id_profesor', 'id_materia', 'id_periodo', 'horas_semanales', 'monto_hora', 'fecha_inicio'];
    const missingFields = requiredFields.filter(field => data[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        missingFields
      });
    }
    
    const contrato = await crearContratoProfesor(data);
    res.status(201).json(contrato);
  } catch (error) {
    console.error('Error en crearNuevoContratoProfesor:', error);
    res.status(400).json({ 
      error: 'Error al crear contrato de profesor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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