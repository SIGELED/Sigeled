import { io } from "../app.js";
import { createNotificacion, getAdminAndRRHHIds } from "../models/notificacionModel.js";

export async function notifyUser(id_usuario, { mensaje, link = null, observacion = null, tipo = null, meta = null, nivel='info' }){
    const notif = await createNotificacion({ id_usuario, mensaje, link, observacion, tipo, meta, nivel });
    io.to(id_usuario.toString()).emit('nueva_notificacion', notif);
    return notif;
}

export async function notifyAdminsRRHH(payload){
    const ids = await getAdminAndRRHHIds();
    const uniq = [...new Set(ids)];
    const created = [];
    for (const id of uniq) {
        created.push(await notifyUser(id, payload));
    }
    return created;
}