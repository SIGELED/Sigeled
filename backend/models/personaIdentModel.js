import db from './db.js';

// Obtener identificaciones por persona
export const getIdentificacionByPersona = async (id_persona) => {
    const res = await db.query('SELECT * FROM personas_identificacion WHERE id_persona = $1', [id_persona]);
    return res.rows;
};

// Crear identificación (DNI/CUIL)
export const createIdentificacion = async ({
    id_persona,
    dni,
    cuil,
    id_estado, // puede ser null, lo asigna la base o lo pasas desde el backend
    verificado_por, // id del usuario que verifica
    verificado_en, // fecha de verificación
    observacion, // texto opcional
    actualizado_en // fecha de actualización
}) => {
    const res = await db.query(
        `INSERT INTO personas_identificacion (
            id_persona, dni, cuil, id_estado, verificado_por, verificado_en, observacion, actualizado_en
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [id_persona, dni, cuil, id_estado, verificado_por, verificado_en, observacion, actualizado_en]
    );
    return res.rows[0];
};
