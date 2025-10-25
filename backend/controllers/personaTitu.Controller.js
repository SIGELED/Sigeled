import { getTitulosByPersona, createTitulo, getTiposTitulo, updateEstadoTitulo } from "../models/personaTituModel.js";
import { getEstadoById, getEstadoByCodigo } from "../models/estadoVerificacionModel.js";

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
            verificado_por_usuario: null,
            verificado_en: null,
            id_estado_verificacion: data.id_estado_verificacion || 1,
            creado_en: data.creado_en || new Date()
        });
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

export const listarTiposTitulo = async (_req, res) => {
    try {
        const tipos = await getTiposTitulo();
        res.json(tipos);
    } catch (error) {
        console.error('Error en listarTiposTitulo:', error);
        res.status(500).json({message:'Error al listar tipos de titulo', detalle:error.message});
    }
}

const toSmallint = (v) => {
    if (v === null || v === undefined) return null;
    const n = parseInt(String(v), 10);
    return Number.isInteger(n) ? n : null;
};

const resolveEstado = async (val) => {
    const n = toSmallint(val);
    if (n !== null) return await getEstadoById(n);
    return await getEstadoByCodigo(String(val)); 
};

export const verificarTitulo = async (req, res) => {
    try {
        const id_titulo = String(req.params.id_titulo); 
        const { id_estado_verificacion, observacion } = req.body;

        const estado = await resolveEstado(id_estado_verificacion);
        if (!estado) return res.status(400).json({ message: "Estado inválido" });

        const code = String(estado.codigo || "").toUpperCase();
        if ((code === "RECHAZADO" || code === "OBSERVADO") && !String(observacion || "").trim()) {
        return res.status(400).json({ message: "Debe indicar observación para Rechazado/Observado" });
        }

        const verificado_por_usuario =
        req.user?.id_usuario ?? req.user?.id ?? req.usuario?.id_usuario ?? req.usuario?.id ?? null;

        const actualizado = await updateEstadoTitulo({
        id_titulo, 
        id_estado_verificacion: estado.id_estado, 
        observacion: String(observacion || "").trim() || null,
        verificado_por_usuario
        });

        res.json(actualizado);
    } catch (error) {
        console.error("Error en verificarTitulo:", error);
        res.status(500).json({ message: "Error al verificar título", detalle: error.message });
    }
};