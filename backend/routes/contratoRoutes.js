import express from 'express';
import { listarContratos } from '../controllers/contratoController.js';

const router = express.Router();

router.get('/', listarContratos);

export default router;