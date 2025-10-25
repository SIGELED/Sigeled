import db from './db.js';

// Obtener todos los documentos de personas
export const getAllPersonasDocumentos = async () => {
    const res = await db.query('SELECT * FROM personas_documentos');
    return res.rows;
};

export const getPersonasDocumentos = async ({id_persona} = {}) => {
    const params = [];
    let where = '';
    if(id_persona){
        params.push(id_persona);
        where = `WHERE pd.id_persona = $${params.length}`;
    }

    const sql = `
        SELECT
            pd.id_persona_doc,
            pd.id_persona,
            pd.id_tipo_doc,
            t.codigo       AS tipo_codigo,
            t.nombre       AS tipo_nombre,
            pd.id_archivo,
            a.nombre_original AS archivo_nombre,
            pd.id_estado_verificacion AS id_estado,
            ev.codigo      AS estado_codigo,
            ev.nombre      AS estado_nombre,
            pd.vigente,
            pd.creado_en
        FROM personas_documentos pd
        LEFT JOIN tipos_documento      t  USING (id_tipo_doc)
        LEFT JOIN archivos             a  USING (id_archivo)
        LEFT JOIN estado_verificacion  ev ON ev.id_estado = pd.id_estado_verificacion
        ${where}
        ORDER BY pd.creado_en DESC, pd.id_persona_doc DESC
    `;
    const res = await db.query(sql, params);
    return res.rows;
    }

export const getPersonaDocumentoById = async (id_persona_doc) => {
    const res = await db.query(
        `
        SELECT
            pd.*,
            t.codigo AS tipo_codigo, t.nombre AS tipo_nombre,
            a.nombre_original AS archivo_nombre,
            ev.codigo AS estado_codigo, ev.nombre AS estado_nombre
        FROM personas_documentos pd
        LEFT JOIN tipos_documento     t  USING (id_tipo_doc)
        LEFT JOIN archivos            a  USING (id_archivo)
        LEFT JOIN estado_verificacion ev ON ev.id_estado = pd.id_estado_verificacion
        WHERE pd.id_persona_doc = $1
        `,
        [id_persona_doc]
    );
    return res.rows[0];
};

// Crear documento de persona
export const createPersonaDocumento = async ({id_persona, id_tipo_doc, id_archivo, id_estado_verificacion = 1, vigente}) => {
    const res = await db.query(
    `
        WITH ins AS (
        INSERT INTO personas_documentos (
            id_persona, id_tipo_doc, id_archivo, id_estado_verificacion, vigente
        ) VALUES ($1,$2,$3,$4,$5)
            RETURNING id_persona_doc
        )
        SELECT
            pd.id_persona_doc,
            pd.id_persona,
            pd.id_tipo_doc,
            t.codigo       AS tipo_codigo,
            t.nombre       AS tipo_nombre,
            pd.id_archivo,
            a.nombre_original AS archivo_nombre,
            pd.id_estado_verificacion AS id_estado,
            ev.codigo      AS estado_codigo,
            ev.nombre      AS estado_nombre,
            pd.vigente,
            pd.creado_en
        FROM personas_documentos pd
        LEFT JOIN tipos_documento      t  USING (id_tipo_doc)
        LEFT JOIN archivos             a  USING (id_archivo)
        LEFT JOIN estado_verificacion  ev ON ev.id_estado = pd.id_estado_verificacion
        WHERE pd.id_persona_doc = (SELECT id_persona_doc FROM ins)
        `,
        [id_persona, id_tipo_doc, id_archivo, id_estado_verificacion, vigente]
    );
    return res.rows[0];
};

export const insertVerificacionDocumento = async({
    id_persona_doc, 
    id_estado_verificacion, 
    observacion, 
    verificado_por_usuario
}) => {
    const res = await db.query(
        `
        INSERT INTO verificacion_documentos(
            id_persona_doc, id_estado_verificacion, observacion, verificado_por_usuario, verificado_en
        ) VALUES ($1, $2, $3, $4, now())
        RETURNING *
        `,
        [id_persona_doc, id_estado_verificacion, observacion || null, verificado_por_usuario || null]
    );
    return res.rows[0];
};

export const updateEstadoDocumento = async({
    id_persona_doc,
    id_estado_verificacion,
    observacion,
    verificado_por_usuario
}) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE personas_documentos
            SET id_estado_verificacion = $1
            WHERE id_persona_doc = $2`,
            [id_estado_verificacion, id_persona_doc]
        )

        await client.query(
            `INSERT INTO verificacion_documentos (
                id_persona_doc, id_estado_verificacion, observacion, verificado_por_usuario, verificado_en
            ) VALUES ($1, $2, $3, $4, now())`,
            [id_persona_doc, id_estado_verificacion, observacion || null, verificado_por_usuario || null]
        );

        const final = await client.query(
            `
            SELECT 
                pd.id_persona_doc,
                pd.id_persona,
                pd.id_tipo_doc,
                t.codigo AS tipo_codigo,
                t.nombre AS tipo_nombre,
                pd.id_archivo,
                a.nombre_original AS archivo_nombre,
                pd.id_estado_verificacion AS id_estado,
                ev.codigo AS estado_codigo,
                ev.nombre AS estado_nombre,
                pd.vigente,
                pd.creado_en
            FROM personas_documentos pd
            LEFT JOIN tipos_documento   t USING(id_tipo_doc)
            LEFT JOIN archivos          a USING(id_archivo)
            LEFT JOIN estado_verificacion ev ON ev.id_estado = pd.id_estado_verificacion
            WHERE pd.id_persona_doc = $1
            `,
            [id_persona_doc]
        );

        await client.query('COMMIT');
        return final.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Eliminar documento de persona
export const deletePersonaDocumento = async (data) => {
    const {
        id_persona, id_tipo_doc, id_archivo, id_estado_verificacion, vigente
    } = data;
    const res = await db.query(
        `DELETE FROM `
    )
}

export const getAllTiposDocumento = async () => {
    const res = await db.query('SELECT * FROM tipos_documento ORDER BY id_tipo_doc');
    return res.rows;
}