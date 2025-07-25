import bcypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/userModel.js';

export const login = async (req, res) => {
    const { email, contraseña } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user || !bcypt.compareSync(contraseña, user.contraseña)) {
            return res.status(401).json({ message: 'Credenciales invalidas' });
        }

        const isPasswordValid = await bcypt.compare(contraseña, user.contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    }
    catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

export const register = async (req, res) => {
    const { nombre, email, contraseña, rol } = req.body;
    try {
        const existente = await findUserByEmail(email);
        if (existente) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const contraseñaHash = bcypt.hashSync(contraseña, 10);
        const newUser = await createUser({ nombre, email, contraseñaHash, rol });

        const token = jwt.sign({ id: newUser.id, rol: newUser.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol } });
    }
    catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}