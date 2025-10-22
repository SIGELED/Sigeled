import db from './db.js';

// Obtener domicilios por persona
// Consulta con JOIN para obtener datos completos de domicilio
export const getDomiciliosByPersona = async (id_persona) => {
    const res = await db.query(`
        SELECT 
            pd.*,
            b.id_dom_barrio,
            b.barrio,
            b.manzana AS barrio_manzana,
            b.casa AS barrio_casa,
            b.departamento AS barrio_depto,
            b.piso AS barrio_piso,

            l.id_dom_localidad,
            l.localidad,

            d.id_dom_departamento,
            d.departamento AS departamento_admin
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

export const createBarrio = async ({ barrio, manzana, casa, departamento, piso, id_dom_localidad}) => {
    const res = await db.query(
        `INSERT INTO dom_barrio (barrio, manzana, casa, departamento, piso, id_dom_localidad)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_dom_barrio, barrio, manzana, casa, departamento, piso, id_dom_localidad`,
        [barrio, manzana ?? null, casa ?? null, departamento ?? null, piso ?? null, id_dom_localidad]
    );
    return res.rows[0];
};

export const getBarriosByPersona = async(id_persona) => {
    const { rows } = await db.query(
        `SELECT b.id_dom_barrio, b.barrio, b.manzana, b.casa, b.departamento, b.piso, b.id_dom_localidad
        FROM persona_barrio pb
        JOIN dom_barrio b using (id_dom_barrio)
        WHERE pb.id_persona = $1
        ORDER BY b.barrio`, [id_persona]
    );
    return rows;
}

export const assignBarrioToPersona = async({ id_persona, id_dom_barrio }) => {
    await db.query(
        `INSERT INTO persona_barrio (id_persona, id_dom_barrio)
        VALUES ($1, $2)
        on conflict do nothing`,
        [id_persona, id_dom_barrio]
    );

    const { rows } = await db.query(
        `SELECT b.*
        FROM dom_barrio b
        WHERE b.id_dom_barrio = $1`, [id_dom_barrio]
    );
    return rows[0];
}

export const unassignBarrioFromPersona = async ({ id_persona, id_dom_barrio }) => {
    const { rowCount } = await db.query(
        `DELETE FROM persona_barrio
        WHERE id_persona = $1 AND id_dom_barrio = $2`,
        [id_persona, id_dom_barrio]
    );
    return rowCount > 0;
}