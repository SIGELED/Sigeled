import db from './db.js';

// Obtener todos los documentos de personas
export const getAllPersonasDocumentos = async () => {
    const res = await db.query('SELECT * FROM personas_documentos');
    return res.rows;
};

// Obtener documento de persona por ID
export const getPersonaDocumentoById = async (id_persona_doc) => {
  const q = 'SELECT * FROM personas_documentos WHERE id_persona_doc = $1';
  const r = await db.query(q, [id_persona_doc]);
  return r.rows[0] || null;
};

// Crear documento de persona
export const createPersonaDocumento = async (data) => {
    const {
        id_persona, id_tipo_doc, id_archivo, id_estado_verificacion, vigente
    } = data;
    const res = await db.query(
        `INSERT INTO personas_documentos (
            id_persona, id_tipo_doc, id_archivo, id_estado_verificacion, vigente
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id_persona, id_tipo_doc, id_archivo, id_estado_verificacion, vigente]
    );
    return res.rows[0];
};

// Eliminar documento de persona
export const deletePersonaDocumento = async (id_persona_doc) => {
  const q = 'DELETE FROM personas_documentos WHERE id_persona_doc = $1 RETURNING *';
  const r = await db.query(q, [id_persona_doc]);
  return r.rows[0] || null;
};

export const getAllTiposDocumento = async () => {
    const res = await db.query('SELECT * FROM tipos_documento ORDER BY id_tipo_doc');
    return res.rows;
}

export const countArchivoReferences = async (id_archivo) => {
  const q = 'SELECT COUNT(*)::int AS cnt FROM personas_documentos WHERE id_archivo = $1';
  const r = await db.query(q, [id_archivo]);
  return r.rows[0]?.cnt ?? 0;
};