import cron from 'node-cron';
import db from '../models/db.js';
import { notifyUser, notifyAdminsRRHH } from '../utils/notify.js';

cron.schedule('0 9 * * *', async () => {
    console.log('[CRON CONTRATOS] Ejecutando chequeo de contratos por vencer...');
    const dias = 30;

    const { rows } = await db.query(
        `
        SELECT 
        cp.id_contrato_profesor,
        cp.fecha_fin,
        cp.id_persona,
        u.id_usuario
        FROM contrato_profesor cp
        JOIN usuarios u ON u.id_persona = cp.id_persona
        WHERE cp.fecha_fin IS NOT NULL
        AND cp.fecha_fin::date 
            BETWEEN CURRENT_DATE 
            AND (CURRENT_DATE + $1 * INTERVAL '1 day')
        `,
        [dias]
    );

    for (const c of rows) {
        await notifyUser(c.id_usuario, {
            tipo: 'CONTRATO_POR_VENCER',
            mensaje: `Tu contrato vence el ${new Date(c.fecha_fin).toLocaleDateString()}`,
            link: `/dashboard/contratos/${c.id_contrato_profesor}`,
            meta: { id_contrato: c.id_contrato_profesor, fecha_fin: c.fecha_fin },
            nivel: 'warning',
        });
    }

    if (rows.length) {
        await notifyAdminsRRHH({
            tipo: 'CONTRATOS_POR_VENCER_RESUMEN',
            mensaje: `Contratos por vencer en ${dias} días: ${rows.length}`,
            link: `/dashboard/contratos?vencenEn=${dias}`,
            meta: { dias, cantidad: rows.length },
            nivel: 'warning',
        });
    }
});
