import db from './db.js';

export const findUserByEmail = async (email) => {
    const res = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return res.rows[0];
};

export const createUser = async ({ nombre, email, contraseñaHash, rol }) => {
    const res = await db.query(
        'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombre, email, contraseñaHash, rol]
    );
    return res.rows[0];
};

export const updateUserCV = async (userId, cvPath) => {
    const res = await db.query(
        'UPDATE usuarios SET cv = $1 WHERE id = $2 RETURNING *',
        [cvPath, userId]
    );
    return res.rows[0];
};