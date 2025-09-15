import { createIdentificacion, updateEstadoIdentificacion, getIdentificacionByPersona } from '../models/personaIdentModel.js';
import { createArchivo } from '../models/archivoModel.js';

// Subir identificación con archivo comprobatorio
export const subirIdentificacion = async (req, res) => {
    try {
        const { tipo_doc, numero } = req.body;
        const id_persona = req.user.id_persona || req.body.id_persona;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Debe adjuntar un archivo comprobatorio.' });
        }

        // Guardar el archivo en la base de datos
        const archivo = await createArchivo({
            nombre_original: file.originalname,
            content_type: file.mimetype,
            size_bytes: file.size,
            storage_key: file.filename,
            subido_por: id_persona
        });

        // Estado de verificación por defecto: pendiente
        const id_estado = 1; // Asume que 1 es 'pendiente'

        // Crear la identificación y vincular el archivo
        const identificacion = await createIdentificacion({
            id_persona,
            tipo_doc,
            numero,
            id_archivo: archivo.id_archivo,
            id_estado
        });

        res.status(201).json({ identificacion, archivo });
    } catch (error) {
        res.status(500).json({ message: 'Error al subir identificación', detalle: error.message });
    }
};

// Actualizar estado de verificación de una identificación (solo RRHH/Admin)
export const actualizarEstadoIdentificacion = async (req, res) => {
    try {
        const { id_identificacion, estado_verificacion } = req.body;
        await updateEstadoIdentificacion(id_identificacion, estado_verificacion);
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado de verificación', detalle: error.message });
    }
};

// Obtener identificaciones de una persona
export const obtenerIdentificacion = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const identificaciones = await getIdentificacionByPersona(id_persona);
        res.json(identificaciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener identificaciones', detalle: error.message });
    }
};