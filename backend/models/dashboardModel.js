import db from "./db.js";

export async function getAdminStats() {
    const PENDIENTE_ID = 1;

    const statsQuery = `
        SELECT
            (SELECT COUNT(*) FROM usuarios WHERE activo = true) AS totalUsuarios,
            
            (SELECT COUNT(*) 
                FROM contrato_profesor 
                WHERE CURRENT_DATE BETWEEN fecha_inicio::date AND COALESCE(fecha_fin::date, 'infinity'::date)) AS contratosActivos,

            ( (SELECT COUNT(*) FROM personas_documentos WHERE id_estado_verificacion = $1) +
            (SELECT COUNT(*) FROM personas_titulos WHERE id_estado_verificacion = $1)
            ) AS documentosPendientes
    `;

    const { rows } = await db.query(statsQuery, [PENDIENTE_ID]);
    return rows[0];
}

export async function getDocumentosPendientes(limit = 5) {
    const PENDIENTE_ID = 1;

    const query = `
        (
            -- Documentos
            SELECT 
                pd.id_persona_doc AS item_id,
                'documento' AS tipo_item,
                pd.id_persona,
                p.nombre,
                p.apellido,
                td.nombre AS descripcion,
                pd.creado_en
            FROM personas_documentos pd
            JOIN personas p ON pd.id_persona = p.id_persona
            JOIN tipos_documento td ON pd.id_tipo_doc = td.id_tipo_doc
            WHERE pd.id_estado_verificacion = $1
        )
        UNION ALL
        (
            -- Títulos
            SELECT 
                pt.id_titulo AS item_id,
                'titulo' AS tipo_item,
                pt.id_persona,
                p.nombre,
                p.apellido,
                pt.nombre_titulo AS descripcion,
                pt.creado_en
            FROM personas_titulos pt
            JOIN personas p ON pt.id_persona = p.id_persona
            WHERE pt.id_estado_verificacion = $1
        )
        ORDER BY creado_en DESC
        LIMIT $2
    `;

    const { rows } = await db.query(query, [PENDIENTE_ID, limit]);
    return rows;
}