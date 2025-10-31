import { createArchivo } from '../models/archivoModel.js';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getIdentificacionByPersona, createIdentificacion } from '../models/personaIdentModel.js';
import { getDomiciliosByPersona, createDomicilio } from '../models/personaDomiModel.js';
import * as tituModel from '../models/personaTituModel.js';
import * as archivoModel from '../models/archivoModel.js';
import * as docModel from '../models/personaDocModel.js';
import { createPersona,updatePersona , desasignarPerfilPersona, getAllPersonas, getPersonaById } from '../models/personaModel.js';
import { getPersonasFiltros, asignarPerfilPersona, getPerfilesDePersona, buscarPersonaPorDNI } from '../models/personaModel.js';
import db from "../models/db.js"
import { getEstadosVerificacion } from '../models/estadoVerificacionModel.js';
import { getTitulosByPersona, createTitulo, updateTitulo } from '../models/personaTituModel.js';

const ALLOWED_ROLES = ['ADMIN', 'RRHH', 'ADMINISTRATIVO'];

const isAdminOrRRHH = (req) => {
  const user = req.user;
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some(r => ALLOWED_ROLES.includes(String(r)));
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
        console.log('req.body:', req.body);
        console.log('req.user:', req.user);

        const { nombre, apellido, fecha_nacimiento, sexo, telefono } = req.body;
        const id_usuario = req.user.id; // Extraído del token
        console.log('id_usuario:', id_usuario);

        // Crear persona sin tipo de empleado
        const persona = await createPersona({ nombre, apellido, fecha_nacimiento, sexo, telefono });
        console.log('persona creada:', persona);

        await db.query(
            'UPDATE usuarios SET id_persona = $1 WHERE id_usuario = $2',
            [persona.id_persona, id_usuario]
        );
        console.log(`IdUsuario: ${id_usuario} vinculado a persona ${persona.id_persona}`);

        res.status(201).json({message:"Persona creada y vinculada a usuario correctamente", persona});
    } catch (error) {
        console.error('Error al registrarDatosPersona', error);
        res.status(500).json({ message: 'Error al registrar datos personales', detalle:error.message });
    }
};

export const actualizarDatosPersona = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const { nombre, apellido, fecha_nacimiento, sexo, telefono } = req.body;

        const personaExistente = await getPersonaById(id_persona);
        if (!personaExistente) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }

        const personaActualizada = await updatePersona(id_persona, { nombre, apellido, fecha_nacimiento, sexo, telefono });
        res.json({ message: 'Datos de persona actualizados correctamente', persona: personaActualizada });
    } catch (error) {
        console.error('Error al actualizarDatosPersona', error);
        res.status(500).json({ message: 'Error al actualizar datos personales', detalle: error.message });
    }
};

export const asignarPerfil = async (req, res) => {
    try {
        const { id_persona, id_perfil } = req.body;
        
        const usuarioActor = 
            req.user?.id_usuario ??
            req.user?.id ??
            req.usuario?.id_usuario ??
            req.usuario?.id;

        if(!usuarioActor){
            return res.status(401).json({message:'No se pudo identificar el usuario autenticad'});
        }

        const resultado = await asignarPerfilPersona(id_persona, id_perfil, usuarioActor);
        res.status(201).json({message:'Perfil asignado correctamente', resultado});
    } catch (error) {
        res.status(500).json({ message: 'Error al asignar perfil', detalle: error.message });
    }
};

export const desasignarPerfil = async (req, res) => {
    try {
        const {id_persona, id_perfil} = req.params;
        const usuarioActor = 
            req.user?.id_usuario ??
            req.user?.id ??
            req.usuario?.id_usuario ??
            req.usuario?.id;

        const out = await desasignarPerfilPersona(id_persona, Number(id_perfil), usuarioActor);

        if(!out) {
            return res.status(404).json({message: "No hay un perfil vigente para quitar"});
        }
        res.json({message:'Perfil desasignado correctamente', resultado: out});
    } catch (error) {
        console.error('Error en desasignarPerfil:', error);
        res.status(500).json({message:'Error al desasignar perfil', detalle:error.message});
    }
}

// Obtener todas las personas
export const listarPersonas = async (req, res) => {
    try {
        const personas = await getAllPersonas();
        res.json(personas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener personas' });
    }
};

export const obtenerPerfilesPersona = async (req, res) => {
    try {
        const { id_persona } = req.params;
        const perfiles = await getPerfilesDePersona(id_persona);
        res.json(perfiles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfiles', detalle: error.message });
    }
};

export const buscarPorDNI = async (req, res) => {
    try {
        const { dni } = req.query;
        if (!dni) return res.status(400).json({ message: 'Debe indicar el DNI' });
        const personas = await buscarPersonaPorDNI(dni);
        res.json(personas);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar por DNI', detalle: error.message });
    }
};

export const buscadorAvanzado = async (req, res) => {
    try {
        const { nombre, apellido, dni, perfil } = req.query;
        const filtros = {};
        if (nombre) filtros.nombre = nombre;
        if (apellido) filtros.apellido = apellido;
        if (dni) filtros.dni = dni;
        if (perfil) filtros.perfil = perfil;
        const personas = await getPersonasFiltros(filtros);
        res.json(personas);
    } catch (error) {
        res.status(500).json({ message: 'Error en el buscador avanzado', detalle: error.message });
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
        const {id_persona} = req.params;
        const {dni, cuil} = req.body;

        console.log('id_persona:', id_persona);
        console.log('dni:', dni, 'cuil:', cuil);
        
        const existentes = await getIdentificacionByPersona(id_persona);
        console.log('existentes:', existentes);

        if (existentes.some(e => e.dni === dni || e.cuil === cuil)) {
            return res.status(409).json({ error: 'Ya existe una identificación con ese DNI o CUIL para esta persona.' });
        }
        
        const nuevaIdentificacion = await createIdentificacion({id_persona, dni, cuil});
        console.log('nuevaIdentificacion:', nuevaIdentificacion);

        res.status(201).json({
            message:'Identificación creada correctamente.',
            identificacion: nuevaIdentificacion
        })
    } catch (err) {
        console.error('Eror en crearIdentificacion:', err);
        res.status(500).json({ error: 'Error al crear identificación', detalle: err.message});
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

// Actualizar título
export const actualizarTitulo = async (req, res) => {
    try {
        const { id_persona, id_titulo } = req.params;
        const { id_tipo_titulo, nombre_titulo, institucion, fecha_emision, matricula_prof, id_archivo } = req.body;

        // Validar que el título existe
        const tituloExistente = await tituModel.getTituloById(id_titulo);
        if (!tituloExistente) {
            return res.status(404).json({ error: 'Título no encontrado' });
        }

        // Validar que el título pertenece a la persona indicada
        if (String(tituloExistente.id_persona) !== String(id_persona)) {
            return res.status(400).json({ error: 'El título no pertenece a la persona indicada' });
        }

        // Validar que no haya duplicado con otro título (excepto el actual)
        const existentes = await getTitulosByPersona(id_persona);
        if (existentes.some(e => e.id_titulo !== Number(id_titulo) && e.nombre_titulo === nombre_titulo)) {
            return res.status(409).json({ error: 'Ya existe otro título con ese nombre para esta persona.' });
        }

        const tituloActualizado = await updateTitulo({
            id_titulo,
            id_tipo_titulo: id_tipo_titulo || tituloExistente.id_tipo_titulo,
            nombre_titulo: nombre_titulo || tituloExistente.nombre_titulo,
            institucion: institucion !== undefined ? institucion : tituloExistente.institucion,
            fecha_emision: fecha_emision || tituloExistente.fecha_emision,
            matricula_prof: matricula_prof !== undefined ? matricula_prof : tituloExistente.matricula_prof,
            id_archivo: id_archivo !== undefined ? id_archivo : tituloExistente.id_archivo
        });

        res.json({ message: 'Título actualizado correctamente', titulo: tituloActualizado });
    } catch (error) {
        console.error('Error al actualizarTitulo:', error);
        res.status(500).json({ error: 'Error al actualizar título', detalle: error.message });
    }
};

// Eliminar título (con limpieza de archivo si corresponde)
export const deleteTitulo = async (req, res, next) => {
  try {
    console.log('[titu-delete] req.params:', req.params);
    const { id_persona, id_titulo } = req.params;
    
    if (!id_persona || !id_titulo) {
      return res.status(400).json({ success: false, message: 'id_persona e id_titulo requeridos' });
    }

    // Obtener título
    const titulo = await tituModel.getTituloById(id_titulo);
    if (!titulo) return res.status(404).json({ success: false, message: 'Título no encontrado' });

    // Validar que pertenece a la persona indicada
    if (String(titulo.id_persona) !== String(id_persona)) {
      return res.status(400).json({ success: false, message: 'Título no pertenece a la persona indicada' });
    }

    // Obtener archivo asociado (si existe)
    const archivo = titulo.id_archivo ? await archivoModel.getArchivoById(titulo.id_archivo) : null;

    // Validar permisos (admin/rrhh o propietario)
    const isPropietario = req.user && String(req.user.id_persona) === String(id_persona);
    if (!isAdminOrRRHH(req) && !isPropietario) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este título' });
    }

    // Eliminar título
    const deletedTitu = await tituModel.deleteTitulo(id_titulo);

    // Si había archivo asociado, limpiar si no tiene más referencias
    if (archivo && archivo.id_archivo) {
      try {
        const refsEnTitulos = await tituModel.countArchivoReferencesInTitulos(archivo.id_archivo);
        const refsEnDocumentos = await docModel.countArchivoReferences(archivo.id_archivo);
        const totalRefs = refsEnTitulos + refsEnDocumentos;
        
        if (totalRefs === 0) {
          await archivoModel.deleteArchivo(archivo.id_archivo);
          console.log('[titu-delete] archivo eliminado (sin referencias):', archivo.id_archivo);
        }
      } catch (e) {
        console.warn('[titu-delete] error al limpiar archivo:', e.message);
      }
    }

    return res.status(200).json({ success: true, data: deletedTitu });
  } catch (err) {
    console.error('[titu-delete] error:', err);
    return next(err);
  }
};