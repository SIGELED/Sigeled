import { 
    getDomiciliosByPersona,
    createDomicilio,
    getDepartamentos,
    getLocalidadesByDepartamento,
    getBarriosByLocalidad,
} from "../models/personaDomiModel.js";

export const obtenerDomicilios = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const out = await getDomiciliosByPersona(id_persona);
        res.json(out);
    } catch (error) {
        console.error('Error en obtenerDomicilios:', error);
        res.status(500).json({message: 'Error al obtener domicilios', detalle: error.message});
    }
};

export const crearDomicilio = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const { calle, altura, id_dom_barrio } = req.body;

        if(!calle || !altura) {
            return res.status(400).json({message:'Faltan datos: calle y altura son obligatorios'});
        }

        const nuevoDomicilio = await createDomicilio({
            id_persona,
            calle,
            altura,
            id_dom_barrio: id_dom_barrio ?? null,
        });

        res.status(201).json(nuevoDomicilio);
    } catch (error) {
        console.error("Error en crearDomicilio:", error);
        res.status(500).json({message:'Error al crear domicilio', detalle: error.message});
    }
};

export const listarDepartamentos = async (_req, res) => {
    try {
        const deptos = await getDepartamentos();
        res.json(deptos);
    } catch (error) {
        console.error("Error en listarDepartamentos", error);
        res.status(500).json({message:'Error al obtener departamentos', detalle:error.message});
    }
}

export const listarLocalidades = async (req, res) => {
    try {
        const { id_dom_departamento } = req.params;
        const localidades = await getLocalidadesByDepartamento(id_dom_departamento);
        res.json(localidades);
    } catch (error) {
        console.error('Error en listarLocalidades:', error);
        res.status(500).json({message:'Error al obtener localidades por departamento', detalle:error.message});
    }
}

export const listarBarrios = async (req, res) => {
    try {
        const { id_dom_localidad } = req.params;
        const barrios = await getBarriosByLocalidad(id_dom_localidad);
        res.json(barrios);
    } catch (error) {
        console.error('Error en listarBarrios:', error);
        res.status(500).json({message:'Error al obtener barrios por localidad', detalla:error.message});
    }
}