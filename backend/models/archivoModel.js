import db from './db.js';

// Obtener todos los archivos
export const getAllArchivos = async () => {
    const res = await db.query('SELECT * FROM archivos');
    return res.rows;
};

// Obtener archivo por ID
export const getArchivoById = async (id_archivo) => {
  if (!id_archivo) return null;
  const q = 'SELECT * FROM archivos WHERE id_archivo = $1';
  const r = await db.query(q, [id_archivo]);
  return r.rows[0] || null;
};

// Crear archivo
export const createArchivo = async (data) => {
    const {
        nombre_original, content_type, size_bytes, sha256_hex,
        storage_provider, storage_bucket, storage_key, subido_por_usuario
    } = data;
    const res = await db.query(
        `INSERT INTO archivos (
            nombre_original, content_type, size_bytes, sha256_hex,
            storage_provider, storage_bucket, storage_key, subido_por_usuario
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
            nombre_original, 
            content_type, 
            size_bytes, 
            sha256_hex,
            storage_provider, 
            storage_bucket, 
            storage_key, 
            subido_por_usuario
        ]
    );
    return res.rows[0];
};

export const deleteArchivo = async (id_archivo) => {
  const q = 'DELETE FROM archivos WHERE id_archivo = $1 RETURNING *';
  const r = await db.query(q, [id_archivo]);
  return r.rows[0] || null;
};