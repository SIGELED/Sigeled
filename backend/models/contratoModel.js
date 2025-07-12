import pool from './db.js';

export async function getAllContratos() {
  const query = `
    SELECT c.numero_contrato, c.estado, c.periodo, c.fecha_expedicion, c.fecha_vencimiento,
           e.*
    FROM contratos c
    JOIN empleados e ON c.empleado_id = e.id_empleado
    ORDER BY c.fecha_expedicion DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

export async function getContratoById(numero_contrato) {
  const contratoQuery = `
    SELECT c.*, e.*
    FROM contratos c
    JOIN empleados e ON c.empleado_id = e.id_empleado
    WHERE c.numero_contrato = $1
  `;
  const { rows } = await pool.query(contratoQuery, [numero_contrato]);
  if (!rows[0]) return null;
  const contrato = rows[0];

  // Obtener cátedras asociadas
  const catedrasQuery = `
    SELECT cc.catedra_id, cat.nombre, cat.horas_semanales, cat.materia_id
    FROM contrato_catedras cc
    JOIN catedras cat ON cc.catedra_id = cat.id_catedra
    WHERE cc.contrato_id = $1
  `;
  const { rows: catedras } = await pool.query(catedrasQuery, [numero_contrato]);
  contrato.catedras = catedras;

  // Obtener firmas asociadas
  const firmasQuery = `
    SELECT f.*, u.nombre as usuario_nombre
    FROM firmas f
    JOIN usuarios u ON f.usuario_id = u.id
    WHERE f.contrato_id = $1
  `;
  const { rows: firmas } = await pool.query(firmasQuery, [numero_contrato]);
  contrato.firmas = firmas;

  return contrato;
}

export async function createContrato({ numero_contrato, empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, catedras }) {
  // Validar unicidad
  const existe = await pool.query('SELECT 1 FROM contratos WHERE numero_contrato = $1', [numero_contrato]);
  if (existe.rows.length > 0) {
    throw new Error('El número de contrato ya existe');
  }
  // Insertar contrato
  const insertContrato = `
    INSERT INTO contratos (numero_contrato, empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const { rows } = await pool.query(insertContrato, [numero_contrato, empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo]);
  // Insertar cátedras asociadas
  for (const catedra_id of catedras) {
    await pool.query('INSERT INTO contrato_catedras (contrato_id, catedra_id) VALUES ($1, $2)', [numero_contrato, catedra_id]);
  }
  return rows[0];
}

export async function updateContrato(numero_contrato, { empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, catedras }) {
  // Actualizar contrato
  const updateQuery = `
    UPDATE contratos SET empleado_id=$1, fecha_expedicion=$2, fecha_vencimiento=$3, estado=$4, periodo=$5
    WHERE numero_contrato=$6 RETURNING *
  `;
  const { rows } = await pool.query(updateQuery, [empleado_id, fecha_expedicion, fecha_vencimiento, estado, periodo, numero_contrato]);
  // Actualizar cátedras asociadas (eliminar todas y volver a insertar)
  await pool.query('DELETE FROM contrato_catedras WHERE contrato_id = $1', [numero_contrato]);
  for (const catedra_id of catedras) {
    await pool.query('INSERT INTO contrato_catedras (contrato_id, catedra_id) VALUES ($1, $2)', [numero_contrato, catedra_id]);
  }
  return rows[0];
}

export async function deleteContrato(numero_contrato) {
  // Eliminar firmas asociadas
  await pool.query('DELETE FROM firmas WHERE contrato_id = $1', [numero_contrato]);
  // Eliminar cátedras asociadas
  await pool.query('DELETE FROM contrato_catedras WHERE contrato_id = $1', [numero_contrato]);
  // Eliminar contrato
  const { rows } = await pool.query('DELETE FROM contratos WHERE numero_contrato = $1 RETURNING *', [numero_contrato]);
  return rows[0];
}