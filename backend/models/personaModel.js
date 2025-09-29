import db from './db.js';

// Obtener todas las personas
export const getAllPersonas = async () => {
    const res = await db.query('SELECT * FROM personas');
    return res.rows;
};

// Buscar personas por nombre de perfil (ej: 'profesor', 'investigador', etc.)
export const buscarPersonasPorNombrePerfil = async (nombre_perfil) => {
    const query = `
        SELECT p.*
        FROM personas p
        JOIN personas_perfiles pp ON p.id_persona = pp.id_persona
        JOIN perfiles pf ON pp.id_perfil = pf.id_perfil
        WHERE LOWER(pf.nombre) = LOWER($1)
        AND pp.vigente = true
    `;
    const res = await db.query(query, [nombre_perfil]);
    return res.rows;
};

// Buscar personas por varios perfiles (array de nombres de perfil)
export const buscarPersonasPorNombresPerfiles = async (nombres_perfiles) => {
    const placeholders = nombres_perfiles.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
        SELECT DISTINCT p.*
        FROM personas p
        JOIN personas_perfiles pp ON p.id_persona = pp.id_persona
        JOIN perfiles pf ON pp.id_perfil = pf.id_perfil
        WHERE LOWER(pf.nombre) IN (${placeholders})
        AND pp.vigente = true
    `;
    const res = await db.query(query, nombres_perfiles.map(n => n.toLowerCase()));
    return res.rows;
};

// Buscar persona por DNI (el DNI está en personas_identificacion)
export const buscarPersonaPorDNI = async (dni) => {
    const query = `
        SELECT p.*
        FROM personas p
        JOIN personas_identificacion pi ON p.id_persona = pi.id_persona
        WHERE pi.dni = $1
    `;
    const res = await db.query(query, [dni]);
    return res.rows;
};

// Buscador avanzado de personas (ahora permite filtrar por DNI)
export const getPersonasFiltros = async (filtros) => {
    let query = `
        SELECT DISTINCT p.*
        FROM personas p
        LEFT JOIN personas_perfiles pp ON p.id_persona = pp.id_persona AND pp.vigente = true
        LEFT JOIN perfiles pf ON pp.id_perfil = pf.id_perfil
        LEFT JOIN personas_identificacion pi ON p.id_persona = pi.id_persona
        WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (filtros.nombre) {
        query += ` AND LOWER(p.nombre) LIKE LOWER($${idx})`;
        params.push(`%${filtros.nombre}%`);
        idx++;
    }
    if (filtros.apellido) {
        query += ` AND LOWER(p.apellido) LIKE LOWER($${idx})`;
        params.push(`%${filtros.apellido}%`);
        idx++;
    }
    if (filtros.dni) {
        query += ` AND pi.dni = $${idx}`;
        params.push(filtros.dni);
        idx++;
    }
    if (filtros.perfil) {
        query += ` AND LOWER(pf.nombre) = LOWER($${idx})`;
        params.push(filtros.perfil);
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
export const createPersona = async ({ nombre, apellido, fecha_nacimiento, sexo, telefono }) => {
    const res = await db.query(
        `INSERT INTO personas (nombre, apellido, fecha_nacimiento, sexo, telefono)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, apellido, fecha_nacimiento, sexo, telefono]
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

// Asignar un perfil a una persona
export const asignarPerfilPersona = async (id_persona, id_perfil, usuario_asignador) => {
    // Opcional: marcar como no vigente si ya tenía ese perfil
    await db.query(
        `UPDATE personas_perfiles SET vigente = false, actualizado_por_usuario = $1, actualizado_en = NOW()
            WHERE id_persona = $2 AND id_perfil = $3 AND vigente = true`,
        [usuario_asignador, id_persona, id_perfil]
    );
    // Insertar nuevo perfil vigente
    const res = await db.query(
        `INSERT INTO personas_perfiles (id_persona, id_perfil, vigente, asignado_por_usuario, asignado_en)
         VALUES ($1, $2, true, $3, NOW()) RETURNING *`,
        [id_persona, id_perfil, usuario_asignador]
    );
    return res.rows[0];
};

// Obtener perfiles vigentes de una persona
export const getPerfilesDePersona = async (id_persona) => {
    const res = await db.query(
        `SELECT pf.*
        FROM perfiles pf
        JOIN personas_perfiles pp ON pf.id_perfil = pp.id_perfil
        WHERE pp.id_persona = $1 AND pp.vigente = true`,
        [id_persona]
    );
    return res.rows;
};
