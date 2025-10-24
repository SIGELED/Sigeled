import db from './db.js';

// Obtener títulos por persona
// Consulta con JOIN para obtener datos completos del título, tipo y archivo
export const getTitulosByPersona = async (id_persona) => {
    const res = await db.query(`
        SELECT 
        pt.id_titulo,
        pt.id_persona,
        pt.id_tipo_titulo,
        tt.nombre AS tipo_titulo,
        pt.nombre_titulo,
        pt.institucion,
        pt.fecha_emision,
        pt.matricula_prof,
        pt.id_archivo,
        a.nombre_original AS archivo_nombre,
        pt.id_estado_verificacion,
        ev.nombre AS estado_verificacion_nombre, 
        pt.verificado_por_usuario,
        pt.verificado_en,
        pt.creado_en
        FROM personas_titulos pt
        LEFT JOIN tipos_titulo tt ON pt.id_tipo_titulo = tt.id_tipo_titulo
        LEFT JOIN archivos a ON pt.id_archivo = a.id_archivo
        LEFT JOIN estado_verificacion ev ON ev.id_estado = pt.id_estado_verificacion
        WHERE pt.id_persona = $1
        ORDER BY pt.creado_en DESC;
    `, [id_persona]);

    return res.rows;
};

export const getTiposTitulo = async () => {
    const { rows } = await db.query(
        `SELECT id_tipo_titulo, codigo, nombre FROM tipos_titulo`
    );
    return rows;
}

// Crear título
export const createTitulo = async ({
    id_persona,
    id_tipo_titulo,
    nombre_titulo,
    institucion,
    fecha_emision,
    matricula_prof,
    id_archivo,
    id_estado_verificacion,
    verificado_por_usuario,
    verificado_en,
    creado_en
}) => {
    const res = await db.query(
        `
        WITH ins AS (
            INSERT INTO personas_titulos (
                id_persona, id_tipo_titulo, nombre_titulo, institucion, fecha_emision, matricula_prof, 
                id_archivo, verificado_por_usuario, verificado_en, id_estado_verificacion, creado_en
            )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING id_titulo
            )
        SELECT 
            pt.id_titulo,
            pt.id_persona,
            pt.id_tipo_titulo,
            tt.nombre AS tipo_titulo,
            pt.nombre_titulo,
            pt.institucion,
            pt.fecha_emision,
            pt.matricula_prof,
            pt.id_archivo,
            a.nombre_original AS archivo_nombre,
            pt.id_estado_verificacion,
            ev.nombre AS estado_verificacion_nombre,   
            ev.codigo AS estado_verificacion_codigo,   
            pt.verificado_por_usuario,
            pt.verificado_en,
            pt.creado_en
            FROM personas_titulos pt
            LEFT JOIN tipos_titulo tt ON pt.id_tipo_titulo = tt.id_tipo_titulo
            LEFT JOIN archivos a      ON pt.id_archivo = a.id_archivo
            LEFT JOIN estado_verificacion ev ON ev.id_estado = pt.id_estado_verificacion 
            WHERE pt.id_titulo = (SELECT id_titulo FROM ins)
        `,
        [
            id_persona,
            id_tipo_titulo,
            nombre_titulo,
            institucion,
            fecha_emision,
            matricula_prof,
            id_archivo,
            verificado_por_usuario,
            verificado_en,
            id_estado_verificacion,
            creado_en
        ]
    );
    return res.rows[0];
};
