// ...existing code...
import * as docModel from '../models/personaDocModel.js';
import * as archivoModel from '../models/archivoModel.js';

const ALLOWED_ROLES = ['ADMIN', 'RRHH', 'ADMINISTRATIVO'];

const isAdminOrRRHH = (req) => {
  const user = req.user;
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some(r => ALLOWED_ROLES.includes(String(r)));
};

// Obtener todos los documentos de personas
export const listarPersonasDocumentos = async (req, res) => {
    try {
        const documentos = await docModel.getAllPersonasDocumentos();
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener documentos de personas' });
    }
};

// Obtener documento de persona por ID
export const obtenerPersonaDocumento = async (req, res) => {
    try {
        const { id_persona_doc } = req.params;
        const documento = await docModel.getPersonaDocumentoById(id_persona_doc);
        if (!documento) return res.status(404).json({ message: 'Documento no encontrado' });
        res.json(documento);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener documento de persona' });
    }
};

// Crear documento de persona
export const crearPersonaDocumento = async (req, res) => {
    try {
        const nuevoDocumento = await docModel.createPersonaDocumento(req.body);
        res.status(201).json(nuevoDocumento);
    } catch (error) {
        console.error('Error en crearPersonaDocumento:', error);
        res.status(500).json({ message: 'Error al crear documento de persona', detalle: error.message });
    }
};

// Eliminar documento de persona (con permisos y limpieza de archivo si corresponde)
export const deleteDocumento = async (req, res, next) => {
  try {
    console.log('[doc-delete] req.params:', req.params);
    const { id_persona, id_persona_doc } = req.params;
    
    if (!id_persona || !id_persona_doc) {
      return res.status(400).json({ success: false, message: 'id_persona e id_persona_doc requeridos' });
    }

    // Obtener documento
    const doc = await docModel.getPersonaDocumentoById(id_persona_doc);
    if (!doc) return res.status(404).json({ success: false, message: 'Documento no encontrado' });

    // Validar que pertenece a la persona indicada
    if (String(doc.id_persona) !== String(id_persona)) {
      return res.status(400).json({ success: false, message: 'Documento no pertenece a la persona indicada' });
    }

    // Obtener archivo asociado (si existe)
    const archivo = doc.id_archivo ? await archivoModel.getArchivoById(doc.id_archivo) : null;

    // Validar permisos (admin/rrhh o propietario del archivo)
    const isUploader = archivo && req.user && String(req.user.id_usuario) === String(archivo.subido_por_usuario);
    if (!isAdminOrRRHH(req) && !isUploader) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este documento' });
    }

    // Eliminar documento
    const deletedDoc = await docModel.deletePersonaDocumento(id_persona_doc);

    // Si había archivo asociado, limpiar si no tiene más referencias
    if (archivo && archivo.id_archivo) {
      try {
        const refs = await docModel.countArchivoReferences(archivo.id_archivo);
        if (refs === 0) {
          await archivoModel.deleteArchivo(archivo.id_archivo);
          console.log('[doc-delete] archivo eliminado (sin referencias):', archivo.id_archivo);
          // TODO: eliminar del storage externo si aplica (archivo.storage_provider, archivo.storage_key)
        }
      } catch (e) {
        console.warn('[doc-delete] error al limpiar archivo:', e.message);
      }
    }

    return res.status(200).json({ success: true, data: deletedDoc });
  } catch (err) {
    console.error('[doc-delete] error:', err);
    return next(err);
  }
};

export const listarTiposDocumento = async (req, res) => {
    try {
        const tipos = await docModel.getAllTiposDocumento();
        res.json(tipos);
    } catch (error) {
        console.error('Error en listarTiposDocumento:', error);
        res.status(500).json({ message: "Error al obtener tipos de documento", detalle: error.message });
    }
}
// ...existing code...