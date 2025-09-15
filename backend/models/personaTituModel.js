import db from './db.js';

// Obtener títulos por persona
// Consulta con JOIN para obtener datos completos del título, tipo y archivo
export const getTitulosByPersona = async (id_persona) => {
    const res = await db.query(`
        SELECT pt.*, tt.nombre AS tipo_titulo, a.nombre_original AS archivo_nombre, a.tipo_de_contenido, a.tamano_bytes
        FROM personas_titulos pt
        LEFT JOIN tipos_titulo tt ON pt.id_tipo_titulo = tt.id_tipo_titulo
        LEFT JOIN archivos a ON pt.id_archivo = a.id_archivo
        WHERE pt.id_persona = $1
    `, [id_persona]);
    return res.rows;
};

// Crear título
// Permite guardar todos los campos relevantes, algunos opcionales/autocompletados
export const createTitulo = async ({
    id_persona,
    id_tipo_titulo,
    nombre_titulo,
    institucion,
    fecha_emision,
    matricula_prof,
    id_archivo, // puede ser null al crear, se actualiza luego
    verificado_por, // id_usuario, null al crear
    verificado_en, // fecha, null al crear
    id_estado, // estado de verificación, null al crear
    creado_es // fecha de creación, puede ser null
}) => {
    const res = await db.query(
        `INSERT INTO personas_titulos (
            id_persona, id_tipo_titulo, nombre_titulo, institucion, fecha_emision, matricula_prof, id_archivo, verificado_por, verificado_en, id_estado, creado_es
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [id_persona, id_tipo_titulo, nombre_titulo, institucion, fecha_emision, matricula_prof, id_archivo, verificado_por, verificado_en, id_estado, creado_es]
    );
    return res.rows[0];
};
