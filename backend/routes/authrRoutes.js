import express from 'express';
import { login, register } from '../controllers/auth.Controller.js';
import { validarRegistro, validarLogin } from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', validarLogin, login);
router.post('/register', validarRegistro, register);

export default router;