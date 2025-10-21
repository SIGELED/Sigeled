import db from './db.js';

// Obtener domicilios por persona
// Consulta con JOIN para obtener datos completos de domicilio
export const getDomiciliosByPersona = async (id_persona) => {
    const res = await db.query(`
        SELECT 
            pd.*,
            b.barrio,
            l.localidad,
            d.departamento
        FROM persona_domicilio pd
        LEFT JOIN dom_barrio b ON pd.id_dom_barrio = b.id_dom_barrio
        LEFT JOIN dom_localidad l ON b.id_dom_localidad = l.id_dom_localidad
        LEFT JOIN dom_departamento d ON l.id_dom_departamento = d.id_dom_departamento
        WHERE pd.id_persona = $1
        ORDER BY pd.id_domicilio DESC
    `, [id_persona]);
    return res.rows;
};

// Crear domicilio
// Usar los IDs de las tablas relacionadas
export const createDomicilio = async ({ id_persona, calle, altura, id_dom_barrio }) => {
    const res = await db.query(
        `INSERT INTO persona_domicilio (id_persona, calle, altura, id_dom_barrio)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id_persona, calle, altura, id_dom_barrio ?? null]
    );
    return res.rows[0];
};

export const getDepartamentos = async () => {
    const res = await db.query(
        'SELECT id_dom_departamento, departamento FROM dom_departamento ORDER BY departamento'
    );
    return res.rows;
}

export const getLocalidadesByDepartamento = async (id_dom_departamento) => {
    const res = await db.query(
        `SELECT id_dom_localidad, localidad, id_dom_departamento
        FROM dom_localidad
        WHERE id_dom_departamento = $1
        ORDER BY localidad`,
        [id_dom_departamento]
    );
    return res.rows;
};

export const getBarriosByLocalidad = async (id_dom_localidad) => {
    const res = await db.query(
        `SELECT id_dom_barrio, barrio, manzana, casa, departamento, piso, id_dom_localidad
        FROM dom_barrio
        WHERE id_dom_localidad = $1
        ORDER BY barrio`,
        [id_dom_localidad]
    );
    return res.rows;
}