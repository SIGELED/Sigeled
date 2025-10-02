import  db  from '../models/db.js';

export const getEstadisticasDigitalizacion = async (req, res) => {
    try {
        console.log('Obteniendo estadísticas de digitalización...');
        
        const query = `
            SELECT 
                'documentos_totales' as metrica,
                COUNT(*)::text as valor
            FROM personas_documentos
            UNION ALL
            SELECT 
                'documentos_procesados',
                COALESCE(COUNT(*)::text, '0')
            FROM documentos_contenido
            WHERE estado_procesamiento = 'completado'
            UNION ALL
            SELECT 
                'documentos_pendientes',
                COALESCE(COUNT(*)::text, '0')
            FROM cola_procesamiento_documentos
            WHERE estado = 'pendiente'
            UNION ALL
            SELECT 
                'tipos_archivo',
                COUNT(DISTINCT content_type)::text
            FROM archivos
        `;
        
        const result = await db.query(query);
        
        console.log('Estadísticas obtenidas:', result.rows);
        
        res.json({
            success: true,
            estadisticas: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        
        // Si las tablas no existen, dar respuesta informativa
        if (error.message.includes('does not exist')) {
            return res.status(200).json({
                success: false,
                message: 'Sistema de digitalización no inicializado',
                estadisticas: [
                    { metrica: 'documentos_totales', valor: 'N/A' },
                    { metrica: 'sistema_digitalización', valor: 'No configurado' }
                ]
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo estadísticas de digitalización',
            error: error.message 
        });
    }
};

export const buscarEnDocumentos = async (req, res) => {
    try {
        const { texto, id_persona, tipo_documento } = req.query;
        
        console.log('Búsqueda solicitada:', { texto, id_persona, tipo_documento });
        
        if (!texto) {
            return res.status(400).json({ 
                success: false,
                message: 'Parámetro texto es requerido' 
            });
        }

        // Verificar si las tablas existen primero
        try {
            await db.query('SELECT 1 FROM documentos_contenido LIMIT 1');
        } catch (error) {
            if (error.message.includes('does not exist')) {
                return res.status(200).json({ 
                    success: false,
                    message: 'Sistema de búsqueda no implementado aún - tablas no existen',
                    resultados: [],
                    total: 0
                });
            }
            throw error;
        }

        // Búsqueda SÚPER simple sin JOINs complejos
        console.log('Realizando búsqueda básica...');
        
        const query = `
            SELECT 
                dc.id_persona_doc,
                'Usuario' as persona,
                'Sin DNI' as dni,
                'Documento' as tipo_documento,
                'archivo.pdf' as nombre_archivo,
                1.0 as relevancia,
                substring(dc.texto_completo, 1, 200) as extracto,
                dc.fecha_procesado as fecha_subida
            FROM documentos_contenido dc
            WHERE LOWER(dc.texto_completo) LIKE LOWER($1)
                AND dc.estado_procesamiento = 'completado'
            ORDER BY dc.fecha_procesado DESC NULLS LAST
            LIMIT 10
        `;
        
        console.log('Ejecutando query:', query);
        console.log('Parámetros:', [`%${texto}%`]);
        
        const result = await db.query(query, [`%${texto}%`]);
        
        console.log(`Encontrados ${result.rows.length} resultados`);
        
        res.json({
            success: true,
            resultados: result.rows,
            total: result.rows.length,
            busqueda: {
                texto,
                modo: 'basico',
                filtros: {
                    id_persona: id_persona || null,
                    tipo_documento: tipo_documento || null
                }
            }
        });
        
    } catch (error) {
        console.error('Error completo en búsqueda:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({ 
            success: false,
            message: 'Error realizando búsqueda',
            error: error.message,
            resultados: [],
            total: 0
        });
    }
};

export const getEstadoSistemaDigitalizacion = async (req, res) => {
    try {
        const checks = [];
        
        // Verificar tabla documentos_contenido
        try {
            await db.query('SELECT 1 FROM documentos_contenido LIMIT 1');
            checks.push({ componente: 'documentos_contenido', estado: 'OK' });
        } catch (error) {
            checks.push({ 
                componente: 'documentos_contenido', 
                estado: 'ERROR', 
                error: error.message.includes('does not exist') ? 'Tabla no existe' : error.message
            });
        }
        
        // Verificar tabla cola_procesamiento
        try {
            await db.query('SELECT 1 FROM cola_procesamiento_documentos LIMIT 1');
            checks.push({ componente: 'cola_procesamiento_documentos', estado: 'OK' });
        } catch (error) {
            checks.push({ 
                componente: 'cola_procesamiento_documentos', 
                estado: 'ERROR', 
                error: error.message.includes('does not exist') ? 'Tabla no existe' : error.message
            });
        }
        
        // Verificar función de búsqueda
        try {
            const funcionExiste = await db.query(`
                SELECT EXISTS (
                    SELECT 1 FROM pg_proc 
                    WHERE proname = 'buscar_en_documentos'
                )
            `);
            checks.push({ 
                componente: 'funcion_busqueda', 
                estado: funcionExiste.rows[0].exists ? 'OK' : 'NO_IMPLEMENTADA' 
            });
        } catch (error) {
            checks.push({ 
                componente: 'funcion_busqueda', 
                estado: 'ERROR', 
                error: error.message 
            });
        }
        
        // Verificar conexión básica
        try {
            await db.query('SELECT COUNT(*) FROM personas_documentos');
            checks.push({ componente: 'conexion_bd', estado: 'OK' });
        } catch (error) {
            checks.push({ 
                componente: 'conexion_bd', 
                estado: 'ERROR', 
                error: error.message 
            });
        }
        
        const todosOK = checks.every(check => check.estado === 'OK');
        const algunoOK = checks.some(check => check.estado === 'OK');
        
        res.json({
            success: true,
            sistema_digitalización: todosOK ? 'FUNCIONANDO' : algunoOK ? 'INCOMPLETO' : 'NO_DISPONIBLE',
            checks: checks
        });
    } catch (error) {
        console.error('Error verificando sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando sistema de digitalización',
            error: error.message
        });
    }
};