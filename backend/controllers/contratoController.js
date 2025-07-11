import {
  getAllContratos,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato,
} from "../models/contratoModel.js";
import pool from "../models/db.js";

// GET /api/contratos
export async function listarContratos(req, res) {
  try {
    const contratos = await getAllContratos();
    res.json(contratos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener contratos" });
  }
}

// GET /api/contratos/:id
export async function obtenerContrato(req, res) {
  try {
    const contrato = await getContratoById(req.params.id);
    if (!contrato)
      return res.status(404).json({ error: "Contrato no encontrado" });
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener contrato" });
  }
}

// POST /api/contratos
export async function crearContrato(req, res) {
  try {
    const {
      numero_contrato,
      empleado_id,
      fecha_expedicion,
      fecha_vencimiento,
      estado,
      periodo,
      catedras,
    } = req.body;
    // Validaciones básicas
    if (
      !numero_contrato ||
      !empleado_id ||
      !fecha_expedicion ||
      !fecha_vencimiento ||
      !estado ||
      !periodo ||
      !Array.isArray(catedras)
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos o cátedras" });
    }
    // Validación: debe haber al menos una cátedra
    if (catedras.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe asignar al menos una cátedra al contrato." });
    }
    // Validación: estado
    if (estado !== "en_espera") {
      return res
        .status(400)
        .json({
          error: 'Solo se puede crear un contrato en estado en_espera',
        });
    }
    // Validación: fecha de vencimiento posterior a expedición
    if (new Date(fecha_vencimiento) <= new Date(fecha_expedicion)) {
      return res.status(400).json({
        error: "La fecha de vencimiento debe ser posterior a la de expedición.",
      });
    }

    const contrato = await createContrato({
      numero_contrato,
      empleado_id,
      fecha_expedicion,
      fecha_vencimiento,
      estado,
      periodo,
      catedras,
    });
    res.status(201).json(contrato);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error al crear contrato" });
  }
}

// PUT /api/contratos/:id
export async function actualizarContrato(req, res) {
  try {
    const {
      empleado_id,
      fecha_expedicion,
      fecha_vencimiento,
      estado,
      periodo,
      catedras,
    } = req.body;
    const numero_contrato = req.params.id;
    if (
      !empleado_id ||
      !fecha_expedicion ||
      !fecha_vencimiento ||
      !estado ||
      !periodo ||
      !Array.isArray(catedras)
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos o cátedras" });
    }
    // Validación: debe haber al menos una cátedra
    if (catedras.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe asignar al menos una cátedra al contrato." });
    }
    // Validación: estado
    if (estado !== "vigente" && estado !== "finalizado") {
      return res
        .status(400)
        .json({ error: 'El estado debe ser "vigente" o "finalizado"' });
    }
    // Validación: fecha de vencimiento posterior a expedición
    if (new Date(fecha_vencimiento) <= new Date(fecha_expedicion)) {
      return res.status(400).json({
        error: "La fecha de vencimiento debe ser posterior a la de expedición.",
      });
    }
    // Validación: no permitir contrato vigente duplicado para el mismo empleado y periodo (excluyendo este contrato)
    if (estado === "vigente") {
      // Solo permitir pasar a 'vigente' si tiene todas las firmas requeridas y no existe otro vigente para el mismo empleado y periodo
      const existeVigente = await pool.query(
        "SELECT 1 FROM contratos WHERE empleado_id = $1 AND periodo = $2 AND estado = $3 AND numero_contrato != $4",
        [empleado_id, periodo, "vigente", numero_contrato]
      );
      if (existeVigente.rows.length > 0) {
        return res.status(400).json({
          error:
            "Ya existe un contrato vigente para este empleado en este período.",
        });
      }
      // Validación: solo permitir estado "vigente" si tiene todas las firmas requeridas
      const firmasReq = 2; // Cambia esto según tu lógica de negocio
      const { rows: firmas } = await pool.query(
        "SELECT COUNT(*) FROM firmas WHERE contrato_id = $1",
        [numero_contrato]
      );
      if (parseInt(firmas[0].count) < firmasReq) {
        return res.status(400).json({
          error: `No se puede poner como vigente hasta que estén todas las firmas requeridas (${firmasReq}).`,
        });
      }
    }
    const contrato = await updateContrato(numero_contrato, {
      empleado_id,
      fecha_expedicion,
      fecha_vencimiento,
      estado,
      periodo,
      catedras,
    });
    res.json(contrato);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ error: error.message || "Error al actualizar contrato" });
  }
}

// DELETE /api/contratos/:id
export async function eliminarContrato(req, res) {
  try {
    const numero_contrato = req.params.id;
    // Validación: no eliminar si tiene firmas asociadas
    const { rows: firmas } = await pool.query(
      "SELECT 1 FROM firmas WHERE contrato_id = $1",
      [numero_contrato]
    );
    if (firmas.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar un contrato que ya tiene firmas.",
      });
    }
    const contrato = await deleteContrato(numero_contrato);
    if (!contrato)
      return res.status(404).json({ error: "Contrato no encontrado" });
    res.json({ message: "Contrato eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ error: error.message || "Error al eliminar contrato" });
  }
}
