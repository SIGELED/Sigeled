import db from './db.js';

// Obtener todos los estados de verificación
export const getEstadosVerificacion = async () => {
    const res = await db.query('SELECT * FROM estado_verificacion');
    return res.rows;
};

// Obtener el id del estado "Pendiente"
export const getIdEstadoPendiente = async () => {
    const res = await db.query("SELECT id_estado FROM estado_verificacion WHERE nombre = 'Pendiente' LIMIT 1");
    return res.rows[0]?.id_estado;
};
