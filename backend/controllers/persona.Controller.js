import { createArchivo } from '../models/archivoModel.js';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getIdentificacionByPersona, createIdentificacion } from '../models/personaIdentModel.js';
import { getDomiciliosByPersona, createDomicilio } from '../models/personaDomiModel.js';
import { getTitulosByPersona, createTitulo } from '../models/personaTituModel.js';
import { createPersona, vincularPersonaUsuario, getAllPersonas, getPersonaById, actualizarTipoEmpleado } from '../models/personaModel.js';

// Subir archivo comprobatorio
export const subirArchivo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se envió ningún archivo.' });
        }
        // Inicializar Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const nombreArchivo = `${timestamp}_${req.file.originalname}`;
        // Subir a Supabase Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
            .from('legajos')
            .upload(nombreArchivo, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });
        if (uploadError) {
            return res.status(500).json({ error: 'Error al subir el archivo a Supabase', detalle: uploadError.message });
        }
        // Calcular hash SHA256
        const sha256_hex = createHash('sha256').update(req.file.buffer).digest('hex');
        // Guardar metadatos en la base de datos
        const archivoData = {
            nombre_original: req.file.originalname,
            content_type: req.file.mimetype,
            size_bytes: req.file.size,
            sha256_hex,
            storage_provider: 'supabase',
            storage_bucket: 'legajos',
            storage_key: nombreArchivo,
            subido_por: req.usuario?.id_usuario || null
        };
        const archivoGuardado = await createArchivo(archivoData);
        res.status(201).json({ mensaje: 'Archivo subido y guardado', archivo: archivoGuardado });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar estados de verificación
export const listarEstadosVerificacion = async (req, res) => {
    try {
        const estados = await getEstadosVerificacion();
        res.json(estados);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Registro de datos personales y vinculación automática
export const registrarDatosPersona = async (req, res) => {
    try {
        const { nombre, apellido, fecha_nacimiento, sexo } = req.body;
        const id_usuario = req.user.id_usuario; // Extraído del token

        // Crear persona sin tipo de empleado
        const persona = await createPersona({ nombre, apellido, fecha_nacimiento, sexo });

        // Vincular automáticamente usuario y persona
        await vincularPersonaUsuario(persona.id_persona, id_usuario);

        res.status(201).json(persona);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar datos personales' });
    }
};

// Endpoint para que RRHH/Administrativo asigne tipo de empleado
export const asignarTipoEmpleado = async (req, res) => {
    try {
        const { id_persona, id_tipo_empleado } = req.body;
        // Solo RRHH/Administrativo debe acceder a este endpoint (proteger en la ruta)
        await actualizarTipoEmpleado(id_persona, id_tipo_empleado);
        res.json({ message: 'Tipo de empleado asignado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al asignar tipo de empleado' });
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

// Identificación
export const obtenerIdentificacion = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const identificacion = await getIdentificacionByPersona(id_persona);
        res.json(identificacion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const crearIdentificacion = async (req, res) => {
    try {
        let datos = req.body;
        // Control de duplicados DNI/CUIL para la persona
        const existentes = await getIdentificacionByPersona(datos.id_persona);
        if (existentes.some(e => e.dni === datos.dni || e.cuil === datos.cuil)) {
            return res.status(409).json({ error: 'Ya existe una identificación con ese DNI o CUIL para esta persona.' });
        }
        // Si no se envía id_estado, asignar el id de 'Pendiente'
        if (!datos.id_estado) {
            const { getIdEstadoPendiente } = await import('../models/estadoVerificacionModel.js');
            const idPendiente = await getIdEstadoPendiente();
            datos.id_estado = idPendiente;
        } else {
            // Validar que el estado existe
            const { getEstadosVerificacion } = await import('../models/estadoVerificacionModel.js');
            const estados = await getEstadosVerificacion();
            const existe = estados.some(e => e.id_estado === Number(datos.id_estado));
            if (!existe) {
                return res.status(400).json({ error: 'El estado de verificación no es válido.' });
            }
        }
        // Auditoría: guardar el usuario que realiza el cambio
        if (req.usuario && req.usuario.id_usuario) {
            datos.actualizado_por = req.usuario.id_usuario;
        }
        const nuevaIdent = await createIdentificacion(datos);
        res.status(201).json(nuevaIdent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Domicilio
export const obtenerDomicilios = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const domicilios = await getDomiciliosByPersona(id_persona);
        res.json(domicilios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const crearDomicilio = async (req, res) => {
    try {
        let datos = req.body;
        // Si la tabla persona_domicilio tiene id_estado, aplica la lógica
        if ('id_estado' in datos) {
            if (!datos.id_estado) {
                const { getIdEstadoPendiente } = await import('../models/estadoVerificacionModel.js');
                const idPendiente = await getIdEstadoPendiente();
                datos.id_estado = idPendiente;
            } else {
                const { getEstadosVerificacion } = await import('../models/estadoVerificacionModel.js');
                const estados = await getEstadosVerificacion();
                const existe = estados.some(e => e.id_estado === Number(datos.id_estado));
                if (!existe) {
                    return res.status(400).json({ error: 'El estado de verificación no es válido.' });
                }
            }
        }
        // Auditoría: guardar el usuario que realiza el cambio
        if (req.usuario && req.usuario.id_usuario) {
            datos.actualizado_por = req.usuario.id_usuario;
        }
        const nuevoDomi = await createDomicilio(datos);
        res.status(201).json(nuevoDomi);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Títulos
export const obtenerTitulos = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const titulos = await getTitulosByPersona(id_persona);
        res.json(titulos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const crearTitulo = async (req, res) => {
    try {
        let datos = req.body;
        // Control de duplicados de título para la persona
        const existentes = await getTitulosByPersona(datos.id_persona);
        if (existentes.some(e => e.nombre_titulo === datos.nombre_titulo)) {
            return res.status(409).json({ error: 'Ya existe un título con ese nombre para esta persona.' });
        }
        if (!datos.id_estado) {
            const { getIdEstadoPendiente } = await import('../models/estadoVerificacionModel.js');
            const idPendiente = await getIdEstadoPendiente();
            datos.id_estado = idPendiente;
        } else {
            const { getEstadosVerificacion } = await import('../models/estadoVerificacionModel.js');
            const estados = await getEstadosVerificacion();
            const existe = estados.some(e => e.id_estado === Number(datos.id_estado));
            if (!existe) {
                return res.status(400).json({ error: 'El estado de verificación no es válido.' });
            }
        }
        // Auditoría: guardar el usuario que realiza el cambio
        if (req.usuario && req.usuario.id_usuario) {
            datos.actualizado_por = req.usuario.id_usuario;
        }
        const nuevoTitulo = await createTitulo(datos);
        res.status(201).json(nuevoTitulo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};