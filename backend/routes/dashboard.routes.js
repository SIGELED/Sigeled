import express from 'express';
import { verificarToken, soloRRHH, soloAdministrador } from '../middleware/authMiddleware.js';
import { getStatsController, getPendientesController } from '../controllers/dashboard.Controller.js';

const dashboardRouter = express.Router();

dashboardRouter.use(verificarToken);

dashboardRouter.get('/admin-stats', soloRRHH, getStatsController);

dashboardRouter.get('/documentos-pendientes', soloRRHH, getPendientesController);

export default dashboardRouter;