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
  const q = `
    SELECT u.id_usuario, u.id_persona,
           json_agg(json_build_object('id_perfil', p.id_perfil, 'codigo', p.codigo, 'nombre', p.nombre)) FILTER (WHERE p.id_perfil IS NOT NULL) AS perfiles
    FROM usuarios u
    LEFT JOIN usuarios_perfiles up ON u.id_usuario = up.id_usuario
    LEFT JOIN perfiles p ON up.id_perfil = p.id_perfil
    WHERE u.id_usuario = $1
    GROUP BY u.id_usuario, u.id_persona
    LIMIT 1
  `;
  const r = await db.query(q, [id_usuario]);
  return r.rows[0] || null;
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
    const res = await db.query(
        `SELECT * FROM usuarios`
    );
    return res.rows;
};