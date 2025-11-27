import cron from 'node-cron';
import db from '../models/db.js';
import { notifyUser, notifyAdminsRRHH } from '../utils/notify.js';

cron.schedule('0 9 * * *', async () => {
    const dias = 7;
    const rows = await db.query(`
        SELECT c.id_contrato, c.fecha_fin, p.id_persona, u.id_usuario
        FROM contratos c
        JOIN personas p ON p.id_persona = c.id_persona
        JOIN usuarios u ON u.id_persona = p.id_persona
        WHERE c.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${dias} days'
    `).then(r => r.rows);

    for (const c of rows) {
        await notifyUser(c.id_usuario, {
        tipo: 'CONTRATO_POR_VENCER',
        mensaje: `Tu contrato vence el ${new Date(c.fecha_fin).toLocaleDateString()}`,
        link: `/dashboard/contratos/${c.id_contrato}`,
        meta: { id_contrato: c.id_contrato, fecha_fin: c.fecha_fin },
        nivel: 'warning'
        });
    }

    if (rows.length) {
        await notifyAdminsRRHH({
        tipo: 'CONTRATOS_POR_VENCER_RESUMEN',
        mensaje: `Contratos por vencer en ${dias} días: ${rows.length}`,
        link: `/dashboard/contratos?vencenEn=${dias}`,
        meta: { dias, cantidad: rows.length },
        nivel: 'warning'
        });
    }
});
