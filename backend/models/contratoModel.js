import db from "./db.js"

export async function getEmpleados({ q = '', perfil = 'Profesor', limit = 20, offset = 0 }) {
  const sql = `
    SELECT 
      p.id_persona,
      p.nombre,
      p.apellido,
      pi.dni,
      COALESCE(COUNT(c.id_contrato_profesor)
        FILTER (WHERE CURRENT_DATE BETWEEN c.fecha_inicio::date AND COALESCE(c.fecha_fin::date, 'infinity'::date)),0) AS activos
    FROM personas p
    JOIN personas_identificacion pi ON pi.id_persona = p.id_persona
    JOIN personas_perfiles pp ON pp.id_persona = p.id_persona
    JOIN perfiles pe ON pe.id_perfil = pp.id_perfil AND pe.nombre = $1
    LEFT JOIN contrato_profesor c ON c.id_persona = p.id_persona
    WHERE $2 = '' 
      OR p.nombre ILIKE '%'||$2||'%' 
      OR p.apellido ILIKE '%'||$2||'%' 
      OR pi.dni ILIKE '%'||$2||'%'
    GROUP BY p.id_persona, p.nombre, p.apellido, pi.dni
    ORDER BY p.apellido ASC, p.nombre ASC
    LIMIT $3 OFFSET $4
  `;
  const { rows } = await db.query(sql, [perfil, q, limit, offset]);
  return rows;
}

export async function getAllContratos({ persona } = {}) {
  try {
    const params = [];
    let where = '';

    if(persona){
      params.push(persona);
      where = 'WHERE cp.id_persona = $1';
    }

    const query = `
      SELECT 
        cp.*, cp.external_id,
        p.nombre AS persona_nombre,
        p.apellido AS persona_apellido,
        m.descripcion_materia,
        c.carrera_descripcion
      FROM contrato_profesor cp
      JOIN personas p ON cp.id_persona = p.id_persona
      JOIN materia  m ON cp.id_materia = m.id_materia
      LEFT JOIN carrera c ON m.id_carrera = c.id_carrera
      ${where}
      ORDER BY cp.fecha_inicio DESC
    `;
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error en getAllContratos:', error);
    throw error;
  }
}

export async function getContratoById(idContrato) {
  try {
    const query = `
      SELECT 
        cp.*, cp.external_id,
        p.nombre as persona_nombre,
        p.apellido as persona_apellido,
        m.descripcion_materia,
        c.carrera_descripcion
      FROM contrato_profesor cp
      JOIN personas p ON cp.id_persona = p.id_persona
      JOIN materia m ON cp.id_materia = m.id_materia
      LEFT JOIN carrera c ON m.id_carrera = c.id_carrera
      WHERE cp.id_contrato_profesor = $1
    `;
    const { rows } = await db.query(query, [idContrato]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getContratoById:', error);
    throw error;
  }
}

export async function getContratoByExternalId(externalId) {
  try {
    const query = `
      SELECT
        cp.*, cp.external_id,
        p.nombre as persona_nombre,
        p.apellido as persona_apellido,
        m.descripcion_materia,
        c.carrera_descripcion
      FROM contrato_profesor cp
      JOIN personas p ON cp.id_persona = p.id_persona
      JOIN materia m ON cp.id_materia = m.id_materia
      LEFT JOIN carrera c ON m.id_carrera = c.id_carrera
      WHERE cp.external_id = $1
    `;
    const { rows } = await db.query(query, [externalId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getContratoByExternalId:', error);
    throw error;
  }
}

export async function createContrato(data) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const query = `
      INSERT INTO contrato_profesor (
        id_persona, 
        id_profesor, 
        id_materia,
        id_periodo, 
        horas_semanales, 
        horas_mensuales,
        monto_hora, 
        fecha_inicio, 
        fecha_fin,
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *, external_id
    `;
    
    const values = [
      data.id_persona,
      data.id_profesor,
      data.id_materia,
      data.id_periodo,
      data.horas_semanales,
      data.horas_mensuales,
      data.monto_hora,
      data.fecha_inicio,
      data.fecha_fin || null
    ];
    
        const overlapQuery = `
          SELECT 1 FROM contrato_profesor
          WHERE id_profesor = $1
            AND daterange(fecha_inicio::date, COALESCE(fecha_fin::date, 'infinity'::date)) &&
                daterange($2::date, COALESCE($3::date, 'infinity'::date))
          LIMIT 1
        `;
        const { rows: overlapRows } = await client.query(overlapQuery, [data.id_profesor, data.fecha_inicio, data.fecha_fin || null]);
        if (overlapRows.length > 0) {
          throw new Error('Solapamiento detectado: el profesor ya tiene un contrato en ese rango de fechas');
        }
    
    const { rows } = await client.query(query, values);
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createContrato:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteContrato(idContrato) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const getQuery = 'SELECT * FROM contrato_profesor WHERE id_contrato_profesor = $1';
    const { rows } = await client.query(getQuery, [idContrato]);
    
    if (rows.length === 0) {
      throw new Error('Contrato no encontrado');
    }

    const deleteQuery = 'DELETE FROM contrato_profesor WHERE id_contrato_profesor = $1';
    await client.query(deleteQuery, [idContrato]);
    
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en deleteContrato:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getPersonaByDni(dni) {
  try {
    const query = `
      SELECT p.*
      FROM personas p
      JOIN personas_identificacion pi ON p.id_persona = pi.id_persona
      WHERE pi.dni = $1
    `;
    const { rows } = await db.query(query, [dni]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getPersonaByDni:', error);
    throw error;
  }
}

export async function getProfesorDetalles(idPersona) {
  try {
    const query = `
      SELECT 
        p.*,
        cp.cargo_descripcion,
        json_agg(
          json_build_object(
            'id_materia', m.id_materia,
            'descripcion_materia', m.descripcion_materia,
            'carrera', c.carrera_descripcion,
            'anio', a.descripcion
          )
        ) as materias
      FROM profesor prof
      JOIN personas p ON prof.id_persona = p.id_persona
      LEFT JOIN cargo_profesor cp ON prof.id_cargo_materia = cp.id_cargo_profesor
      LEFT JOIN materia m ON prof.id_cargo_materia = m.id_materia
      LEFT JOIN carrera c ON m.id_carrera = c.id_carrera
      LEFT JOIN anio a ON m.id_anio = a.id_anio
      WHERE prof.id_persona = $1
      GROUP BY p.id_persona, cp.id_cargo_profesor
    `;
    const { rows } = await db.query(query, [idPersona]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getProfesorDetalles:', error);
    throw error;
  }
}

export async function getMateriasByCarreraAnio(idCarrera, idAnio) {
  try {
    const query = `
      SELECT 
        m.*,
        c.carrera_descripcion
      FROM materia m
      LEFT JOIN carrera c ON m.id_carrera = c.id_carrera
      WHERE m.id_carrera = $1 AND m.id_anio = $2
    `;
    const { rows } = await db.query(query, [idCarrera, idAnio]);
    return rows;
  } catch (error) {
    console.error('Error en getMateriasByCarreraAnio:', error);
    throw error;
  }
}

export const crearContratoProfesor = createContrato;
