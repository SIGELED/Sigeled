import { 
    getDomiciliosByPersona,
    createDomicilio,
    getDepartamentos,
    getLocalidadesByDepartamento,
    getBarriosByLocalidad,
    createBarrio,
    getBarriosByPersona,
    assignBarrioToPersona,
    unassignBarrioFromPersona,
    deleteDomicilio,
    getDomicilioById
} from "../models/personaDomiModel.js";

const isAdminOrRRHH = (req) => {
    const user = req.user;
    if (!user) return false;
    const rolNum = Number(user.id_rol || user.id_perfil || user.idPerfil || 0);
    if ([1, 2, 3].includes(rolNum)) return true;
    const roleNames = Array.isArray(user.roles) ? user.roles : (Array.isArray(user.perfiles) ? user.perfiles.map(p => p?.codigo || p?.nombre) : []);
    return roleNames.some(r => ['ADMIN', 'RRHH', 'ADMINISTRATIVO'].includes(String(r)));
};

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

export const crearBarrio = async (req, res) => {
    try {
        const { id_dom_localidad } = req.params;
        const { barrio, manzana, casa, departamento, piso } = req.body;

        if(!barrio) {
            return res.status(400).json({message: 'barrio es obligatorio'});
        }

        if(!id_dom_localidad) {
            return res.status(400).json({message: 'id_dom_localidad es obligatorio'});
        }

        const nuevoBarrio = await createBarrio({
            barrio: String(barrio).trim(),
            manzana: manzana ?? null,
            casa: casa ?? null,
            departamento: departamento ?? null,
            piso: piso ?? null,
            id_dom_localidad: Number(id_dom_localidad),
        });

        res.status(201).json(nuevoBarrio);
    } catch (error) {
        console.error('Error en crearBarrio:', error);
        res.status(500).json({message:'Error al crear barrio', detalle:error.message});
    }
}

export const listarBarriosPersona = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const data = await getBarriosByPersona(id_persona);
        res.json(data);
    } catch (error) {
        console.error('Error en listarBarriosPersona:', error);
        res.status(500).json({message:"Error al listar barrios de la persona:", detalle:error.message});
    }
};

export const vincularBarrioPersona = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const { id_dom_barrio }= req.body;
        if(!id_dom_barrio) return res.status(400).json({message: 'id_dom_barrio es obligatorio'});

        const barrio = await assignBarrioToPersona({id_persona, id_dom_barrio:Number(id_dom_barrio)});
        res.status(201).json(barrio);
    } catch (error) {
        console.error('Error en vincularBarrioPersona:', error);
        res.status(500).json({message:'Error al vincular barrio', detalle: error.message});
    }
};

export const desvincularBarrioPersona = async (req, res) => {
    try {
        const { id_persona, id_dom_barrio } = req.params;
        const ok = await unassignBarrioFromPersona({id_persona, id_dom_barrio: Number(id_dom_barrio)});
        if(!ok) return res.status(404).json({message:'No existe la vinculación'});
        res.json({ok:true});
    } catch (error) {
        console.error('Error en desvincularBarrioPersona', error);
        res.status(500).json({message:'Error al desvincular barrio', detalle:error.message});
    }
}

export const borrarDomicilio = async (req, res, next) => {
    try {
        const { id_persona, id_domicilio } = req.params;
        if (!id_persona || !id_domicilio) return res.status(400).json({ success:false, message:'id_persona e id_domicilio requeridos' });

        const dom = await getDomicilioById(id_domicilio);
        if (!dom) return res.status(404).json({ success:false, message:'Domicilio no encontrado' });

        if (String(dom.id_persona) !== String(id_persona)) return res.status(400).json({ success:false, message:'Domicilio no pertenece a la persona indicada' });

        const user = req.user;
        if (!user) return res.status(401).json({ success:false, message:'Usuario no autenticado' });

        const userPersonaId = String(user.id_persona || user.id || '');
        if (!isAdminOrRRHH(req) && userPersonaId !== String(id_persona)) {
            return res.status(403).json({ success:false, message:'No autorizado para eliminar este domicilio' });
        }

        const deleted = await deleteDomicilio(id_domicilio);
        return res.status(200).json({ success: true, data: deleted });
    } catch (err) { next(err); }
};