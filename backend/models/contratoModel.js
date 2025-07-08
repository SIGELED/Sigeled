import pool from './db.js';

export async function getAllContratos() {
  const query = `
    SELECT c.numero_contrato, c.estado, c.periodo, c.fecha_expedicion, c.fecha_vencimiento,
           e.nombre AS empleado_nombre
    FROM contratos c
    JOIN empleados e ON c.empleado_id = e.id_empleado
    ORDER BY c.fecha_expedicion DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}