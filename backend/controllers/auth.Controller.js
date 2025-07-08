import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/userModel.js';
import db from '../models/db.js';

export const login = async (req, res) => {
    const { email, contraseña } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user || !bcrypt.compareSync(contraseña, user.contraseña)) {
            return res.status(401).json({ message: 'Credenciales invalidas' });
        }

        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id, rol: user.nombre_rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.nombre_rol } });
    }
    catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

export const register = async (req, res) => {
    const { nombre, email, contraseña } = req.body;
    try {
        const existente = await findUserByEmail(email);
        if (existente) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Buscar el id del rol 'pendiente'
        const rolPendienteRes = await db.query("SELECT id FROM roles WHERE nombre = 'pendiente' LIMIT 1");
        if (rolPendienteRes.rows.length === 0) {
            return res.status(500).json({ message: "No existe el rol 'pendiente' en la base de datos" });
        }
        const rolPendienteId = rolPendienteRes.rows[0].id;

        const contraseñaHash = bcrypt.hashSync(contraseña, 10);
        const newUser = await createUser({ nombre, email, contraseña: contraseñaHash, rol: rolPendienteId });

        const token = jwt.sign({ id: newUser.id, rol: 'pendiente' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: 'pendiente' } });
    }
    catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}