import db from './db.js';

// Obtener domicilios por persona
// Consulta con JOIN para obtener datos completos de domicilio
export const getDomiciliosByPersona = async (id_persona) => {
    const res = await db.query(`
        SELECT pd.*, b.barrio, l.localidad, d.departamento, d.codigo_postal
        FROM persona_domicilio pd
        LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
        LEFT JOIN dom_localidad l ON pd.id_dom_localidad = l.id_dom_localidad
        LEFT JOIN departamento_dom d ON l.id_dom_departamento = d.id_dom_departamento
        WHERE pd.id_persona = $1
    `, [id_persona]);
    return res.rows;
};

// Crear domicilio
// Usar los IDs de las tablas relacionadas
export const createDomicilio = async ({ id_persona, calle, altura, id_dom_barrio, id_dom_localidad }) => {
    const res = await db.query(
        `INSERT INTO persona_domicilio (id_persona, calle, altura, id_dom_barrio, id_dom_localidad)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id_persona, calle, altura, id_dom_barrio, id_dom_localidad]
    );
    return res.rows[0];
};
