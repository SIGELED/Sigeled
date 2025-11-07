import db from './db.js';

export const createNotificacion = async ({ id_usuario, mensaje, link, observacion }) => {
    const q = `
            INSERT INTO notificaciones (id_usuario, mensaje, link, observacion)
            VALUES ($1, $2, $3, $4)
            RETURNING *
    `;
    const { rows } = await db.query(q, [id_usuario, mensaje, link || null, observacion || null]);
    return rows[0];
}

export const getNotificacionesByUsuario = async (id_usuario) => {
    const q = `
        SELECT * FROM notificaciones
        WHERE id_usuario = $1
        ORDER BY fecha_creacion DESC
        LIMIT 50;
    `;
    const { rows } = await db.query(q, [id_usuario]);
    return rows;
}

export const markAsRead = async (id_notificacion, id_usuario) => {
    const q = `
        UPDATE notificaciones
        SET leido = true
        WHERE id_notificacion = $1 AND id_usuario = $2
        RETURNING *;
    `;
    const { rows } = await db.query(q, [id_notificacion, id_usuario]);
    return rows[0];
}

export const getAdminAndRRHHIds = async () => {
    const q = `
        SELECT DISTINCT ur.id_usuario
        FROM usuarios_roles ur
        JOIN roles r ON ur.id_rol = r.id_rol
        WHERE r.codigo = 'ADMIN' OR r.codigo = 'RRHH';
    `;
    const { rows } = await db.query(q);
    return rows.map(r => r.id_usuario);
}