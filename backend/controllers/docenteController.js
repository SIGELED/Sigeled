import multer from 'multer';
import path from 'path';
import { updateUserCV } from '../models/userModel.js';

//Configuración de Multer para guardar los arcihvos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });

// Controlador para subir el CV
export const uploadCV = async (req, res) => {
    try {
        // Asumimos que el usuario está autenticado y su id está en req.user.id
        const userId = req.user.id;
        const cvPath = req.file.path;

        // Actualizar la ruta del CV en la base de datos
        await updateUserCV(userId, cvPath);

        res.status(200).json({ message: 'CV subido correctamente', cvPath });
    } catch (error) {
        res.status(500).json({ message: 'Error al subir el CV', error: error.message });
    }
};