import db from './db.js';

// Obtener todos los archivos
export const getAllArchivos = async () => {
    const res = await db.query('SELECT * FROM archivos');
    return res.rows;
};

// Obtener archivo por ID
export const getArchivoById = async (id_archivo) => {
    const res = await db.query('SELECT * FROM archivos WHERE id_archivo = $1', [id_archivo]);
    return res.rows[0];
};

// Crear archivo
export const createArchivo = async (data) => {
    const {
        nombre_original, content_type, size_bytes, sha256_hex,
        storage_provider, storage_bucket, storage_key, subido_por
    } = data;
    const res = await db.query(
        `INSERT INTO archivos (
            nombre_original, content_type, size_bytes, sha256_hex,
            storage_provider, storage_bucket, storage_key, subido_por
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [nombre_original, content_type, size_bytes, sha256_hex,
         storage_provider, storage_bucket, storage_key, subido_por]
    );
    return res.rows[0];
};