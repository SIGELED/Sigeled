import { getTitulosByPersona, createTitulo } from "../models/personaTituModel.js";

export const crearTitulo = async (req, res) => {
    try {
        const data = req.body;

        if(!data.id_persona || !data.id_tipo_titulo || !data.nombre_titulo){
            return res.status(401).json({message:'id_persona, id_tipo_titulo y nombre_titulo son obligatorios'});
        }

        const nuevoTitulo = await createTitulo({
            id_persona: data.id_persona,
            id_tipo_titulo: data.id_tipo_titulo,
            nombre_titulo: data.nombre_titulo,
            institucion: data.institucion || null,
            fecha_emision: data.fecha_emision || null,
            matricula_prof: data.matricula_prof || null,
            id_archivo: data.id_archivo || null, 
            verificado_por_usuario: data.verificado_por || null,
            verificado_en: data.verificado_en || null, 
            id_estado_verificacion: data.id_estado_verificacion || 1, 
            creado_en: data.creado_en || new Date()
        })

        res.status(201).json(nuevoTitulo);
    } catch (error) {
        console.error('Error en crearTitulo:', error);
        res.status(500).json({message:'Error al crear titulo', detalle:error.message});
    }
}

export const encontrarTituloPersona = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const titulo = await getTitulosByPersona(id_persona);
        res.json(titulo);
    } catch (error) {
        console.error('Error en findTituloPersona:', error);
        res.status(500).json({message:'Error al encontrar titulo por persona', detalle:error.message});
    }
}