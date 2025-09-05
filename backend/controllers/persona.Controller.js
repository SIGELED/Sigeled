import { createPersona, vincularPersonaUsuario, getAllPersonas, getPersonaById } from '../models/personaModel.js';

export const registrarDatosPersona = async (req, res) => {
    try {
        const { nombre, apellido, fecha_nacimiento, sexo} = req.body;
        const id_usuario = req.user.id_usuario; // Extraído del token
        const persona = await createPersona({ nombre, apellido, fecha_nacimiento, sexo });
        await vincularPersonaUsuario(persona.id_persona, id_usuario);
        res.status(201).json(persona);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar datos personales' });
    }
};

// Obtener todas las personas
export const listarPersonas = async (req, res) => {
    try {
        const personas = await getAllPersonas();
        res.json(personas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener personas' });
    }
};

// Obtener persona por ID
export const obtenerPersona = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const persona = await getPersonaById(id_persona);
        if (!persona) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }
        res.json(persona);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener persona' });
    }
};