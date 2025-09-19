import db from './db.js';

// Obtener todas las personas
export const getAllPersonas = async () => {
    const res = await db.query('SELECT * FROM personas');
    return res.rows;
};

// Buscador avanzado de personas
export const getPersonasFiltros = async (filtros) => {
    let query = 'SELECT * FROM personas WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filtros.nombre) {
        query += ` AND LOWER(nombre) LIKE LOWER($${idx})`;
        params.push(`%${filtros.nombre}%`);
        idx++;
    }
    if (filtros.apellido) {
        query += ` AND LOWER(apellido) LIKE LOWER($${idx})`;
        params.push(`%${filtros.apellido}%`);
        idx++;
    }
    if (filtros.dni) {
        query += ` AND dni = $${idx}`;
        params.push(filtros.dni);
        idx++;
    }
    if (filtros.tipo_empleado) {
        query += ` AND id_tipo_empleado = $${idx}`;
        params.push(filtros.tipo_empleado);
        idx++;
    }

    const res = await db.query(query, params);
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

// Actualizar tipo de empleado de una persona
export const actualizarTipoEmpleado = async (id_persona, id_tipo_empleado) => {
    const query = 'UPDATE personas SET id_tipo_empleado = $1 WHERE id_persona = $2';
    await db.query(query, [id_tipo_empleado, id_persona]);
};
