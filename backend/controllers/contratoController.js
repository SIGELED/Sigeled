import {
  getAllContratos,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato
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
    const contrato = await getContratoById(req.params.id);
    if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener contrato' });
  }
}

// POST /api/contratos
export async function crearContrato(req, res) {
  try {
    const { numero_contrato, empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, catedras } = req.body;
    // Validaciones
    if (!numero_contrato || !empleado_id || !fecha_expedicion || !fecha_vencimiento || !estado || !periodo || !Array.isArray(catedras)) {
      return res.status(400).json({ error: 'Faltan campos requeridos o cátedras' });
    }
    if (estado !== 'vigente' && estado !== 'finalizado') {
      return res.status(400).json({ error: 'El estado debe ser "vigente" o "finalizado"' });
    }
    if (new Date(fecha_vencimiento) <= new Date(fecha_expedicion)) {
      return res.status(400).json({ error: 'La fecha de vencimiento debe ser posterior a la de expedición' });
    }
    const contrato = await createContrato({ numero_contrato, empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, catedras });
    res.status(201).json(contrato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear contrato' });
  }
}

// PUT /api/contratos/:id
export async function actualizarContrato(req, res) {
  try {
    const { empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, catedras } = req.body;
    if (!empleado_id || !fecha_expedicion || !fecha_vencimiento || !estado || !periodo || !Array.isArray(catedras)) {
      return res.status(400).json({ error: 'Faltan campos requeridos o cátedras' });
    }
    if (estado !== 'vigente' && estado !== 'finalizado') {
      return res.status(400).json({ error: 'El estado debe ser "vigente" o "finalizado"' });
    }
    if (new Date(fecha_vencimiento) <= new Date(fecha_expedicion)) {
      return res.status(400).json({ error: 'La fecha de vencimiento debe ser posterior a la de expedición' });
    }
    const contrato = await updateContrato(req.params.id, { empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, catedras });
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al actualizar contrato' });
  }
}

// DELETE /api/contratos/:id
export async function eliminarContrato(req, res) {
  try {
    const contrato = await deleteContrato(req.params.id);
    if (!contrato) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json({ message: 'Contrato eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al eliminar contrato' });
  }
}