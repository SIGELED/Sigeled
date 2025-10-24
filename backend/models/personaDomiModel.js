import db from './db.js';

export const getAllDomicilios = async () => {
  const q = `
    SELECT pd.*,
           b.barrio, b.manzana, b.casa as barrio_casa, b.departamento as barrio_departamento, b.piso as barrio_piso,
           l.localidad, l.codigo_postal,
           dep.departamento as departamento_nombre
    FROM persona_domicilio pd
    LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
    LEFT JOIN dom_localidad l ON b.id_dom_localidad = l.id_dom_localidad
    LEFT JOIN dom_departamento dep ON l.id_dom_departamento = dep.id_dom_departamento
    ORDER BY pd.id_domicilio DESC
  `;
  return (await db.query(q)).rows;
};

export const getDomiciliosByPersona = async (id_persona) => {
  const q = `
    SELECT pd.*,
           b.barrio, b.manzana, b.casa as barrio_casa, b.departamento as barrio_departamento, b.piso as barrio_piso,
           l.localidad, l.codigo_postal,
           dep.departamento as departamento_nombre
    FROM persona_domicilio pd
    LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
    LEFT JOIN dom_localidad l ON b.id_dom_localidad = l.id_dom_localidad
    LEFT JOIN dom_departamento dep ON l.id_dom_departamento = dep.id_dom_departamento
    WHERE pd.id_persona = $1
    ORDER BY pd.id_domicilio DESC
  `;
  return (await db.query(q, [id_persona])).rows;
};

export const getDomicilioById = async (id_domicilio) => {
  const q = `
    SELECT pd.*,
           b.barrio, b.manzana, b.casa as barrio_casa, b.departamento as barrio_departamento, b.piso as barrio_piso,
           l.localidad, l.codigo_postal,
           dep.departamento as departamento_nombre
    FROM persona_domicilio pd
    LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
    LEFT JOIN dom_localidad l ON b.id_dom_localidad = l.id_dom_localidad
    LEFT JOIN dom_departamento dep ON l.id_dom_departamento = dep.id_dom_departamento
    WHERE pd.id_domicilio = $1
    LIMIT 1
  `;
  const r = await db.query(q, [id_domicilio]);
  return r.rows[0] || null;
};

export const getDomiciliosByDni = async (dni) => {
  const q = `
    SELECT pd.*,
           b.barrio, b.manzana, b.casa as barrio_casa, b.piso as barrio_piso,
           l.localidad, l.codigo_postal,
           dep.departamento as departamento_nombre,
           p.id_persona, p.nombre, p.apellido, pi.dni
    FROM personas_identificacion pi
    JOIN personas p ON pi.id_persona = p.id_persona
    JOIN persona_domicilio pd ON p.id_persona = pd.id_persona
    LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
    LEFT JOIN dom_localidad l ON b.id_dom_localidad = l.id_dom_localidad
    LEFT JOIN dom_departamento dep ON l.id_dom_departamento = dep.id_dom_departamento
    WHERE pi.dni = $1
  `;
  const r = await db.query(q, [dni]);
  return r.rows;
};

// Obtener departamentos
export const getDepartamentos = async () => {
  const q = `SELECT id_dom_departamento, departamento FROM dom_departamento ORDER BY departamento`;
  const r = await db.query(q);
  return r.rows;
};

// Obtener localidades por departamento
export const getLocalidadesByDepartamento = async (id_dom_departamento) => {
  const q = `SELECT id_dom_localidad, localidad, codigo_postal FROM dom_localidad WHERE id_dom_departamento = $1 ORDER BY localidad`;
  const r = await db.query(q, [id_dom_departamento]);
  return r.rows;
};

// Obtener barrios por localidad
export const getBarriosByLocalidad = async (id_dom_localidad) => {
  const q = `SELECT id_dom_barrio, barrio, manzana, casa, piso FROM dom_barrio WHERE id_dom_localidad = $1 ORDER BY barrio`;
  const r = await db.query(q, [id_dom_localidad]);
  return r.rows;
};

// Buscar o crear barrio (race-safe). Requiere id_dom_localidad en barrioData si no se pasa id_dom_barrio.
export const findOrCreateBarrio = async (client, { barrio, manzana = null, casa = null, departamento = null, piso = null, id_dom_localidad }) => {
  const normalizedBarrio = (typeof barrio === 'string') ? barrio.trim() : barrio;

  if (!id_dom_localidad) {
    throw new Error('id_dom_localidad requerido para crear/buscar barrio');
  }

  const sel = `SELECT id_dom_barrio FROM dom_barrio WHERE LOWER(barrio) = LOWER($1) AND id_dom_localidad = $2 LIMIT 1`;
  const ins = `INSERT INTO dom_barrio (barrio, manzana, casa, departamento, piso, id_dom_localidad)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_dom_barrio`;

  // use provided client (transaction) if passed
  const runner = client || db;
  const r = await runner.query(sel, [normalizedBarrio, id_dom_localidad]);
  if (r.rows[0]) return r.rows[0].id_dom_barrio;

  try {
    const ir = await runner.query(ins, [normalizedBarrio, manzana, casa, departamento, piso, id_dom_localidad]);
    return ir.rows[0].id_dom_barrio;
  } catch (err) {
    if (err && err.code === '23505') { // unique constraint / race
      const r2 = await runner.query(sel, [normalizedBarrio, id_dom_localidad]);
      if (r2.rows[0]) return r2.rows[0].id_dom_barrio;
    }
    throw err;
  }
};

// Crear domicilio (en transaction) con barrioData opcional
export const createDomicilioWithBarrio = async ({ id_persona, calle, altura = null, barrioData }) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // barrioData: { id_dom_localidad, barrio, manzana, casa, departamento, piso } OR { id_dom_barrio }
    const id_dom_barrio = barrioData?.id_dom_barrio
      ? barrioData.id_dom_barrio
      : await findOrCreateBarrio(client, barrioData);

    const q = `INSERT INTO persona_domicilio (calle, altura, id_dom_barrio, id_persona)
               VALUES ($1,$2,$3,$4) RETURNING *`;
    const r = await client.query(q, [calle, altura, id_dom_barrio, id_persona]);

    await client.query('COMMIT');
    return r.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const createDomicilio = async ({ id_persona, calle, altura = null, id_dom_barrio }) => {
  const q = `INSERT INTO persona_domicilio (calle, altura, id_dom_barrio, id_persona)
             VALUES ($1, $2, $3, $4) RETURNING *`;
  const r = await db.query(q, [calle, altura, id_dom_barrio, id_persona]);
  return r.rows[0];
};

export const updateDomicilio = async (id_domicilio, data) => {
  const allowed = ['calle', 'altura', 'id_dom_barrio'];
  const sets = [];
  const vals = [];
  let idx = 1;
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      sets.push(`${k} = $${idx}`);
      vals.push(data[k]);
      idx++;
    }
  }
  if (sets.length === 0) {
    return null;
  }
  vals.push(id_domicilio);
  const q = `UPDATE persona_domicilio SET ${sets.join(', ')} WHERE id_domicilio = $${idx} RETURNING *`;
  const r = await db.query(q, vals);
  return r.rows[0] || null;
};

export const deleteDomicilio = async (id_domicilio) => {
  const q = `DELETE FROM persona_domicilio WHERE id_domicilio = $1 RETURNING *`;
  const r = await db.query(q, [id_domicilio]);
  return r.rows[0] || null;
};

// Obtener domicilio completo (join)
export const getDomicilioFullById = async (id_domicilio) => {
  const q = `
    SELECT pd.*,
           b.barrio, b.manzana, b.casa, b.piso,
           l.localidad, l.codigo_postal,
           dep.departamento
    FROM persona_domicilio pd
    LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
    LEFT JOIN dom_localidad l ON b.id_dom_localidad = l.id_dom_localidad
    LEFT JOIN dom_departamento dep ON l.id_dom_departamento = dep.id_dom_departamento
    WHERE pd.id_domicilio = $1
  `;
  const r = await db.query(q, [id_domicilio]);
  return r.rows[0] || null;
};