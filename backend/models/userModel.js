import db from './db.js';

export const findUserByEmail = async (email) => {
    // Trae el usuario junto con el nombre del rol
    const res = await db.query(
        `SELECT u.*, r.nombre AS nombre_rol
         FROM usuarios u
         JOIN roles r ON u.rol = r.id
         WHERE u.email = $1`,
        [email]
    );
    return res.rows[0];
};

export const createUser = async (userData) => {
    // userData debe incluir: nombre, email, password, rol (id del rol), y otros campos necesarios
    const { nombre, email, password, rol, ...otrosCampos } = userData;
    // Ajusta los campos y valores según tu tabla usuarios
    const campos = ['nombre', 'email', 'password', 'rol'];
    const valores = [nombre, email, password, rol];
    // Agrega dinámicamente otros campos si existen
    Object.entries(otrosCampos).forEach(([key, value]) => {
        campos.push(key);
        valores.push(value);
    });
    const placeholders = campos.map((_, idx) => `$${idx + 1}`).join(', ');
    const query = `INSERT INTO usuarios (${campos.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    const result = await db.query(query, valores);
    return result.rows[0];
};

export const getUserById = async (id) => {
    // Trae el usuario junto con el nombre del rol
    const res = await db.query(
        `SELECT u.*, r.nombre AS nombre_rol
         FROM usuarios u
         JOIN roles r ON u.rol = r.id
         WHERE u.id = $1`,
        [id]
    );
    return res.rows[0];
};

export const getAllUsers = async () => {
    // Trae todos los usuarios junto con el nombre del rol
    const res = await db.query(
        `SELECT u.*, r.nombre AS nombre_rol
         FROM usuarios u
         JOIN roles r ON u.rol = r.id`
    );
    return res.rows;
};

export const updateUserCV = async (userId, cvPath) => {
    const res = await db.query(
        'UPDATE usuarios SET cv = $1 WHERE id = $2 RETURNING *',
        [cvPath, userId]
    );
    return res.rows[0];
};