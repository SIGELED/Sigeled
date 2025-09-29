import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/userModel.js';
import db from '../models/db.js';

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // OBTENER LOS ROLES DEL USUARIO
        const userRoles = await getUserRoles(user.id_usuario);
        const rolPrincipal = userRoles.length > 0 ? userRoles[0].nombre : 'usuario';

        const token = jwt.sign(
            { 
                id_usuario: user.id_usuario, // ← Cambié 'id' por 'id_usuario' para consistencia
                email: user.email,
                rol: rolPrincipal // ← Ahora sí incluye el rol real de la BD
            },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { 
                id_usuario: user.id_usuario, 
                email: user.email, 
                rol: rolPrincipal // ← También enviamos el rol al frontend
            } 
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existente = await findUserByEmail(email);
        if (existente) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await createUser({ email, password_hash });

        const token = jwt.sign(
            { id: newUser.id_usuario, email: newUser.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '1h' }
        );
        res.status(201).json({ token, user: { id: newUser.id_usuario, email: newUser.email } });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};