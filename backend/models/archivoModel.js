import db from './db.js';

// Obtener todos los archivos
export const getAllArchivos = async () => {
    const res = await db.query('SELECT * FROM archivos ORDER BY subido_en DESC');
    return res.rows;
};

// Obtener archivo por ID
export const getArchivoById = async (id_archivo) => {
  if (!id_archivo) return null;
  const q = 'SELECT * FROM archivos WHERE id_archivo = $1';
  const r = await db.query(q, [id_archivo]);
  return r.rows[0] || null;
};

// Obtener archivo por SHA256 (detectar duplicados)
export const getArchivoBySha256 = async (sha256_hex) => {
  const q = `SELECT * FROM archivos WHERE sha256_hex = $1 LIMIT 1`;
  const r = await db.query(q, [sha256_hex]);
  return r.rows[0] || null;
};

// Obtener archivos por usuario
export const getArchivosByUsuario = async (id_usuario) => {
  const q = `SELECT * FROM archivos WHERE subido_por_usuario = $1 ORDER BY subido_en DESC`;
  const r = await db.query(q, [id_usuario]);
  return r.rows;
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

// Eliminar archivo
export const deleteArchivo = async (id_archivo) => {
  const q = `DELETE FROM archivos WHERE id_archivo = $1 RETURNING *`;
  const r = await db.query(q, [id_archivo]);
  return r.rows[0] || null;
};

// Contar referencias en documentos y títulos
export const countReferenciasArchivo = async (id_archivo) => {
  const q = `
    SELECT 
      COALESCE((SELECT COUNT(*) FROM personas_documentos WHERE id_archivo = $1), 0) +
      COALESCE((SELECT COUNT(*) FROM personas_titulos WHERE id_archivo = $1), 0) as total
  `;
  const r = await db.query(q, [id_archivo]);
  return Number(r.rows[0]?.total) || 0;
};