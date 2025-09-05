import db from './db.js';

// Obtener todas las personas
export const getAllPersonas = async () => {
    const res = await db.query('SELECT * FROM personas');
    return res.rows;
};

// Obtener persona por ID
export const getPersonaById = async (id_persona) => {
    const res = await db.query('SELECT * FROM personas WHERE id_persona = $1', [id_persona]);
    return res.rows[0];
};

// Crear persona
export const createPersona = async ({ nombre, apellido, fecha_nacimiento, sexo, id_tipo_empleado }) => {
    const res = await db.query(
        `INSERT INTO personas (nombre, apellido, fecha_nacimiento, sexo, id_tipo_empleado)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, apellido, fecha_nacimiento, sexo, id_tipo_empleado]
    );
    return res.rows[0];
};

export const vincularPersonaUsuario = async (id_persona, id_usuario) => {
    const res = await db.query(
        `INSERT INTO personas_usuarios (id_persona, id_usuario) VALUES ($1, $2) RETURNING *`,
        [id_persona, id_usuario]
    );
    return res.rows[0];
};