import {
    getAllPersonasDocumentos,
    getPersonaDocumentoById,
    createPersonaDocumento
} from '../models/personaDocModel.js';

// Obtener todos los documentos de personas
export const listarPersonasDocumentos = async (req, res) => {
    try {
        const documentos = await getAllPersonasDocumentos();
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener documentos de personas' });
    }
};

// Obtener documento de persona por ID
export const obtenerPersonaDocumento = async (req, res) => {
    try {
        const { id_persona_doc } = req.params;
        const documento = await getPersonaDocumentoById(id_persona_doc);
        if (!documento) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }
        res.json(documento);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener documento de persona' });
    }
};

// Crear documento de persona
export const crearPersonaDocumento = async (req, res) => {
    try {
        const nuevoDocumento = await createPersonaDocumento(req.body);
        res.status(201).json(nuevoDocumento);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento de persona' });
    }
};