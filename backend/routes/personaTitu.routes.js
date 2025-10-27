import express from 'express';
import { verificarToken, soloRRHH } from '../middleware/authMiddleware.js';
import { crearTitulo, encontrarTituloPersona, listarTiposTitulo, verificarTitulo } from "../controllers/personaTitu.Controller.js";

const personaTituRouter = express.Router();
personaTituRouter.use(verificarToken);

personaTituRouter.get('/persona/:id_persona', encontrarTituloPersona);

personaTituRouter.get('/tipos', listarTiposTitulo);

personaTituRouter.post('/', crearTitulo);

personaTituRouter.patch('/:id_titulo/estado', soloRRHH, verificarTitulo);

export default personaTituRouter;