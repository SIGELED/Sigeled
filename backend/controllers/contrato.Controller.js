import {
  getAllContratos,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato,
  getPersonaByDni,
  getProfesorDetalles,
  getMateriasByCarreraAnio,
  crearContratoProfesor,
} from '../models/contratoModel.js';

// GET /api/contratos
export async function listarContratos(req, res) {
  try {
    const contratos = await getAllContratos();
    res.json(contratos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener contratos' });
  }
}

// GET /api/contratos/:id
export async function obtenerContrato(req, res) {
  try {
    const { id } = req.params;
    const contrato = await getContratoById(id);
    if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener contrato' });
  }
}

export async function crearContrato(req, res) {
  try {
    const data = req.body;
    console.log('Datos recibidos:', data); // Add this for debugging
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ 
        error: 'Se esperaba un objeto JSON válido en el cuerpo de la solicitud' 
      });
    }
    
    const contrato = await createContrato(data);
    res.status(201).json(contrato);
  } catch (error) {
    console.error('Error al crear contrato:', error);
    res.status(400).json({ 
      error: 'Error al crear contrato',
      details: error.message 
    });
  }
}

// PUT /api/contratos/:id
export async function actualizarContrato(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const contrato = await updateContrato(id, data);
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al actualizar contrato' });
  }
}

// DELETE /api/contratos/:id
export async function eliminarContrato(req, res) {
  try {
    const { id } = req.params;
    const contrato = await deleteContrato(id);
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al eliminar contrato' });
  }
}

// Handler para buscar persona por DNI (renombrado para evitar conflicto)
export async function buscarPersonaPorDni(req, res) {
  try {
    const { dni } = req.params;
    const persona = await getPersonaByDni(dni);
    res.json(persona);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: error.message });
  }
}

// Handler para detalles de profesor (renombrado)
export async function obtenerDetallesProfesor(req, res) {
  try {
    const { idPersona } = req.params;
    const detalles = await getProfesorDetalles(idPersona);
    res.json(detalles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
}

// Handler para materias por carrera y año
export async function listarMateriasPorCarreraAnio(req, res) {
  try {
    const { idCarrera, idAnio } = req.query;
    const materias = await getMateriasByCarreraAnio(idCarrera, idAnio);
    res.json(materias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
}

// Handler para crear contrato profesor
export async function crearNuevoContratoProfesor(req, res) {
  try {
    const data = req.body;
    const contrato = await crearContratoProfesor(data);
    res.status(201).json(contrato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al crear contrato profesor' });
  }
}