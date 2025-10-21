import pool from '../config/db.js';

// Obtener todos los contratos con información relacionada
export async function getAllContratos() {
  try {
    const query = `
      SELECT 
        cp.*,
        p.nombre as persona_nombre,
        p.apellido as persona_apellido,
        m.descripcion_materia,
        c.carrera_descripcion
      FROM contrato_profesor cp
      JOIN personas p ON cp.id_persona = p.id_persona
      JOIN profesor prof ON cp.id_profesor = prof.id_profesor
      JOIN materia m ON cp.id_materia = m.id_materia
      LEFT JOIN carrera c ON m.id_carrera = c.id_carrera
      ORDER BY cp.fecha_inicio DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error en getAllContratos:', error);
    throw error;
  }
}

// Obtener un contrato por ID
export async function getContratoById(idContrato) {
  try {
    const query = `
      SELECT 
        cp.*,
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
    const { rows } = await pool.query(query, [idContrato]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getContratoById:', error);
    throw error;
  }
}




export async function createContrato(data) {
  const client = await pool.connect();
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
      RETURNING *
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
    
        // Verificar solapamiento: el mismo profesor no puede tener contratos que se solapen
        const overlapQuery = `
          SELECT 1 FROM contrato_profesor
          WHERE id_profesor = $1
            AND daterange(fecha_inicio, COALESCE(fecha_fin, 'infinity'::date)) &&
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


// Actualizar un contrato existente
export async function updateContrato(idContrato, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Verificar que el contrato existe
    const checkQuery = 'SELECT 1 FROM contrato_profesor WHERE id_contrato_profesor = $1';
    const { rowCount } = await client.query(checkQuery, [idContrato]);
    
    if (rowCount === 0) {
      throw new Error('Contrato no encontrado');
    }
    // Obtener contrato actual para calcular valores efectivos (en caso de updates parciales)
    const currentRes = await client.query('SELECT id_profesor, fecha_inicio, fecha_fin FROM contrato_profesor WHERE id_contrato_profesor = $1', [idContrato]);
    const current = currentRes.rows[0];

    // Determinar valores que se usarán para la comprobación de solapamiento
    const effectiveProfesor = data.id_profesor !== undefined ? data.id_profesor : current.id_profesor;
    const effectiveStart = data.fecha_inicio !== undefined ? data.fecha_inicio : current.fecha_inicio;
    const effectiveEnd = data.fecha_fin !== undefined ? data.fecha_fin : current.fecha_fin;

    // Verificar solapamiento (excluyendo el propio contrato)
    const overlapQueryUpdate = `
      SELECT 1 FROM contrato_profesor
      WHERE id_profesor = $1
        AND id_contrato_profesor <> $4
        AND daterange(fecha_inicio, COALESCE(fecha_fin, 'infinity'::date)) &&
            daterange($2::date, COALESCE($3::date, 'infinity'::date))
      LIMIT 1
    `;
    const { rows: overlapUpdate } = await client.query(overlapQueryUpdate, [effectiveProfesor, effectiveStart, effectiveEnd, idContrato]);
    if (overlapUpdate.length > 0) {
      throw new Error('Solapamiento detectado: el profesor ya tiene un contrato en ese rango de fechas');
    }
    // White-list de campos permitidos a actualizar
        const allowedFields = new Set([
          'id_persona', 'id_profesor', 'id_materia', 'id_periodo',
          'horas_semanales', 'horas_mensuales', 'monto_hora', 'fecha_inicio', 'fecha_fin', 'estado'
        ]);
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        // Validar rangos de fecha si vienen ambos
        if (data.fecha_inicio !== undefined && data.fecha_fin !== undefined) {
          const start = new Date(data.fecha_inicio);
          const end = new Date(data.fecha_fin);
          if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            throw new Error('Fechas inválidas: fecha_inicio debe ser anterior a fecha_fin');
          }
        }
        
        // Construir SET usando white-list
        for (const [key, value] of Object.entries(data)) {
          if (value === undefined) continue;
          if (!allowedFields.has(key)) continue; // Ignorar campos no permitidos
          updateFields.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
    
    if (updateFields.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }
    
    values.push(idContrato);
    const query = `
      UPDATE contrato_profesor 
      SET ${updateFields.join(', ')}
      WHERE id_contrato_profesor = $${paramIndex}
      RETURNING *
    `;
    
    const { rows } = await client.query(query, values);
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en updateContrato:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Eliminar un contrato
export async function deleteContrato(idContrato) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Obtener el contrato antes de eliminarlo
    const getQuery = 'SELECT * FROM contrato_profesor WHERE id_contrato_profesor = $1';
    const { rows } = await client.query(getQuery, [idContrato]);
    
    if (rows.length === 0) {
      throw new Error('Contrato no encontrado');
    }
    
    // Eliminar el contrato
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

// Buscar persona por DNI
export async function getPersonaByDni(dni) {
  try {
    const query = `
      SELECT p.*
      FROM personas p
      JOIN personas_identificacion pi ON p.id_persona = pi.id_persona
      WHERE pi.dni = $1
    `;
    const { rows } = await pool.query(query, [dni]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getPersonaByDni:', error);
    throw error;
  }
}

// Obtener detalles del profesor
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
    const { rows } = await pool.query(query, [idPersona]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getProfesorDetalles:', error);
    throw error;
  }
}

// Obtener materias por carrera y año
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
    const { rows } = await pool.query(query, [idCarrera, idAnio]);
    return rows;
  } catch (error) {
    console.error('Error en getMateriasByCarreraAnio:', error);
    throw error;
  }
}

// Alias para compatibilidad
export const crearContratoProfesor = createContrato;
