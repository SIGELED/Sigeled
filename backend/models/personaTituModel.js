import db from './db.js';

// Obtener títulos por persona
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

// Obtener título por ID
export const getTituloById = async (id_titulo) => {
  const q = `SELECT * FROM personas_titulos WHERE id_titulo = $1 LIMIT 1`;
  const r = await db.query(q, [id_titulo]);
  return r.rows[0] || null;
};

// Crear título
export const createTitulo = async ({
    id_persona,
    id_tipo_titulo,
    nombre_titulo,
    institucion,
    fecha_emision,
    matricula_prof,
    id_archivo,
    verificado_por,
    verificado_en,
    id_estado,
    creado_es
}) => {
    const res = await db.query(
        `INSERT INTO personas_titulos (
            id_persona, id_tipo_titulo, nombre_titulo, institucion, fecha_emision, matricula_prof, id_archivo, verificado_por, verificado_en, id_estado_verificacion, creado_en
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [id_persona, id_tipo_titulo, nombre_titulo, institucion, fecha_emision, matricula_prof, id_archivo, verificado_por, verificado_en, id_estado, creado_es]
    );
    return res.rows[0];
};

export const deleteTitulo = async (id_titulo) => {
  const q = `DELETE FROM personas_titulos WHERE id_titulo = $1 RETURNING *`;
  const r = await db.query(q, [id_titulo]);
  return r.rows[0] || null;
};

export const countArchivoReferencesInTitulos = async (id_archivo) => {
  const q = `SELECT COUNT(*) as count FROM personas_titulos WHERE id_archivo = $1`;
  const r = await db.query(q, [id_archivo]);
  return Number(r.rows[0]?.count) || 0;
};