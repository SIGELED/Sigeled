import { getAdminStats, getDocumentosPendientes } from "../models/dashboardModel.js";

export const getStatsController = async (req, res) => {
    try {
        const stats = await getAdminStats();
        res.json(stats);
    } catch (error) {
        console.error('Error en getStatsController:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas del dashboard',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const getPendientesController = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;
        const documentos = await getDocumentosPendientes(limit);
        res.json(documentos);
    } catch (error) {
        console.error('Error en getPendientesController:', error);
        res.status(500).json({ 
            error: 'Error al obtener documentos pendientes',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}