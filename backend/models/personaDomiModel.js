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
    return { rowCount: 0, rows: [] };
  }
  vals.push(id_domicilio);
  const q = `UPDATE persona_domicilio SET ${sets.join(', ')} WHERE id_domicilio = $${idx} RETURNING *`;
  const r = await db.query(q, vals);
  return r;
};

export const deleteDomicilio = async (id_domicilio) => {
  const q = `DELETE FROM persona_domicilio WHERE id_domicilio = $1 RETURNING *`;
  const r = await db.query(q, [id_domicilio]);
  return r;
};