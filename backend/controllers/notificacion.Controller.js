import { io } from '../app.js';
import { getNotificacionesByUsuario, markAsRead, createNotificacion } from "../models/notificacionModel.js";

export const getMisNotificaciones = async (req,res) => {
    try {
        const id_usuario = req.user.id_usuario;
        if(!id_usuario) {
            return res.status(401).json({message: "ID de usuario no encontrado"});
        }
        const notifs = await getNotificacionesByUsuario(id_usuario);
        res.json(notifs);
    } catch (error) {
        console.error('Error en getMisNotificaciones:', error);
        res.status(500).json({message: "Error al obtener notificaciones", detalle: error.message});
    }
}

export const marcarComoLeido = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id_notificacion } = req.params;

        const notif = await markAsRead(id_notificacion, id_usuario);

        if(!notif) {
            return res.status(404).json({ message: "Notificación no encontrada" })
        }
        res.json(notif);
    } catch (error) {
        console.error("Error en marcarComoLeido:", error);
        res.status(500).json({ message: "Error al marcar como leído", detalle: error.message });
    }
}

export const testPush = async (req, res) => {
    try {
        const id_usuario = req.user?.id_usuario ?? req.user?.id;
        if (!id_usuario) return res.status(401).json({ message: 'Usuario no identificado' });

        const notif = await createNotificacion({
        id_usuario,
        tipo: 'TEST',
        nivel: 'info',
        mensaje: '🔔 Notificación de prueba en tiempo real',
        observacion: 'Emitida desde /api/notificaciones/test',
        link: '/dashboard',
        meta: { route: '/api/notificaciones/test' }
        });

        io.to(id_usuario.toString()).emit('nueva_notificacion', notif);
        res.json({ ok: true, notif });
    } catch (e) {
        console.error('testPush error:', e);
        res.status(500).json({ message: 'Fallo testPush', detalle: e.message });
    }
};