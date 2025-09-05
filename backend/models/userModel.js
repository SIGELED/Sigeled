import db from './db.js';

// Buscar usuario por email
export const findUserByEmail = async (email) => {
    const res = await db.query(
        `SELECT * FROM usuarios WHERE email = $1`,
        [email]
    );
    return res.rows[0];
};

// Crear usuario
export const createUser = async ({ email, password_hash }) => {
    const res = await db.query(
        `INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING *`,
        [email, password_hash]
    );
    return res.rows[0];
};

// Buscar usuario por id
export const getUserById = async (id_usuario) => {
    const res = await db.query(
        `SELECT * FROM usuarios WHERE id_usuario = $1`,
        [id_usuario]
    );
    return res.rows[0];
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
    const res = await db.query(
        `SELECT * FROM usuarios`
    );
    return res.rows;
};