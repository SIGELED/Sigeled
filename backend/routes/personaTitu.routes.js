import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { crearTitulo, encontrarTituloPersona } from "../controllers/personaTitu.Controller.js";

const personaTituRouter = express.Router();

personaTituRouter.use(verificarToken);

personaTituRouter.get('/persona/:id_persona', encontrarTituloPersona);

personaTituRouter.post('/', crearTitulo);

export default personaTituRouter;