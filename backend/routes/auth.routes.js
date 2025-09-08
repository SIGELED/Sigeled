import express from 'express';
import { login, register } from '../controllers/auth.Controller.js';
import { validarRegistro, validarLogin } from '../validators/authValidator.js';

const authRouter = express.Router();

authRouter.post('/login', validarLogin, login);
authRouter.post('/register', validarRegistro, register);

export default authRouter;