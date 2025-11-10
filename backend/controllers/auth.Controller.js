import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { io } from '../app.js';
import { createNotificacion, getAdminAndRRHHIds } from '../models/notificacionModel.js';
import { findUserByEmail, createUser } from '../models/userModel.js';
import { getRolesByUserId } from '../models/roleModel.js';
import { getPerfilesDePersona, getPersonaById } from '../models/personaModel.js';
import { notifyAdminsRRHH } from '../utils/notify.js';


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const activo = (user.activo === true) || (user.activo === 't') || (user.activo === 1) || (user.activo === '1') || (user.activo === 'true');

        if(!activo){
            return res.status(403).json({message:"Tu cuenta esta en revisión. Espera a que sea activada"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const roles = await getRolesByUserId(user.id_usuario);
        const roleNames = roles.map(rol => rol.codigo.toUpperCase());

        const persona = await getPersonaById(user.id_persona);

        const perfiles = await getPerfilesDePersona(user.id_persona);

        const payload = {
            id: user.id_usuario,
            id_usuario: user.id_usuario,
            id_persona: user.id_persona,
            email: user.email,
            roles: roleNames,
            perfiles,
            activo,
        };

        const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id_usuario,
                id_usuario: user.id_usuario,
                id_persona: user.id_persona,
                email: user.email,
                nombre: persona?.nombre || null,
                apellido: persona?.apellido || null,
                roles: roleNames,
                perfiles,
                persona: persona || null,
                activo,
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

        try {
            await notifyAdminsRRHH({
                tipo: 'USUARIO_REGISTRADO',
                mensaje: `Nuevo usuario registrado: ${email}. Requiere activación.`,
                link: `/dashboard/usuarios/${newUser.id_usuario}`,
                meta: { id_usuario: newUser.id_usuario }
            })
        } catch (notifError) {
            console.error("Error al notificar a admins:", notifError);
        }

        const payload = {
            id: newUser.id_usuario,
            id_usuario: newUser.id_usuario,
            email: newUser.email,
            activo: false,
        };

        const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            token,
            user: {
                id: newUser.id_usuario,
                id_usuario: newUser.id_usuario,
                email: newUser.email,
                activo: false,
            },
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};