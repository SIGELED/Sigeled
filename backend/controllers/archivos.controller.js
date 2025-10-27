import * as archivoModel from '../models/archivoModel.js';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_ROLES = ['ADMIN', 'RRHH', 'ADMINISTRATIVO'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const isAdminOrRRHH = (req) => {
  const user = req.user;
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some(r => ALLOWED_ROLES.includes(String(r)));
};

// Listar archivos (admin/rrhh ven todos, usuarios normales solo los suyos)
export const listarArchivos = async (req, res, next) => {
  try {
    console.log('[archivo-list] usuario:', req.user?.id_usuario);
    
    if (isAdminOrRRHH(req)) {
      const archivos = await archivoModel.getAllArchivos();
      return res.json({ success: true, data: archivos });
    } else {
      const archivos = await archivoModel.getArchivosByUsuario(req.user?.id_usuario);
      return res.json({ success: true, data: archivos });
    }
  } catch (err) {
    next(err);
  }
};

// Obtener archivo por ID
export const obtenerArchivo = async (req, res, next) => {
  try {
    const { id_archivo } = req.params;
    if (!id_archivo) return res.status(400).json({ success: false, message: 'id_archivo requerido' });

    const archivo = await archivoModel.getArchivoById(id_archivo);
    if (!archivo) return res.status(404).json({ success: false, message: 'Archivo no encontrado' });

    // Permisos: admin/rrhh ven cualquiera, usuarios normales solo los suyos
    const isOwner = req.user && String(req.user.id_usuario) === String(archivo.subido_por_usuario);
    if (!isAdminOrRRHH(req) && !isOwner) {
      return res.status(403).json({ success: false, message: 'No autorizado para ver este archivo' });
    }

    res.json({ success: true, data: archivo });
  } catch (err) {
    next(err);
  }
};

// Subir archivo (multipart/form-data)
export const subirArchivo = async (req, res, next) => {
  try {
    console.log('[archivo-upload] usuario:', req.user?.id_usuario);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Validaciones
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        success: false, 
        message: `Archivo muy grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      });
    }

    if (!ALLOWED_TYPES.includes(mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: `Tipo de archivo no permitido. Permitidos: PDF, JPEG, PNG, DOC, DOCX` 
      });
    }

    // Calcular SHA256
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    // Verificar duplicados
    const existente = await archivoModel.getArchivoBySha256(sha256);
    if (existente) {
      console.log('[archivo-upload] archivo duplicado detectado:', sha256);
      return res.status(400).json({ 
        success: false, 
        message: 'Este archivo ya fue subido anteriormente' 
      });
    }

    // Guardar en disco (carpeta ./uploads)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${sha256}-${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    // Crear registro en BD
    const archivo = await archivoModel.createArchivo({
      nombre_original: originalname,
      content_type: mimetype,
      size_bytes: size,
      sha256_hex: sha256,
      storage_provider: 'local',
      storage_bucket: 'uploads',
      storage_key: filename,
      subido_por_usuario: req.user?.id_usuario
    });

    console.log('[archivo-upload] archivo creado:', archivo.id_archivo);

    return res.status(201).json({ 
      success: true, 
      data: archivo,
      message: 'Archivo subido correctamente' 
    });
  } catch (err) {
    console.error('[archivo-upload] error:', err);
    next(err);
  }
};

// Eliminar archivo
export const eliminarArchivo = async (req, res, next) => {
  try {
    console.log('[archivo-delete] usuario:', req.user?.id_usuario, 'archivo:', req.params.id_archivo);
    const { id_archivo } = req.params;

    if (!id_archivo) {
      return res.status(400).json({ success: false, message: 'id_archivo requerido' });
    }

    const archivo = await archivoModel.getArchivoById(id_archivo);
    if (!archivo) return res.status(404).json({ success: false, message: 'Archivo no encontrado' });

    // Permisos: admin/rrhh siempre pueden, usuario normal solo si lo subió
    const isOwner = req.user && String(req.user.id_usuario) === String(archivo.subido_por_usuario);
    if (!isAdminOrRRHH(req) && !isOwner) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este archivo' });
    }

    // Verificar referencias
    const referencias = await archivoModel.countReferenciasArchivo(id_archivo);
    if (referencias > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar: el archivo está asociado a ${referencias} documento(s)/título(s). Elimínalos primero.`,
        referencias
      });
    }

    // Eliminar del storage (si es local)
    if (archivo.storage_provider === 'local' && archivo.storage_key) {
      try {
        const filepath = path.join(process.cwd(), 'uploads', archivo.storage_key);
        await fs.unlink(filepath);
        console.log('[archivo-delete] archivo físico eliminado:', archivo.storage_key);
      } catch (e) {
        console.warn('[archivo-delete] advertencia al eliminar archivo físico:', e.message);
      }
    }

    // Eliminar de BD
    const deleted = await archivoModel.deleteArchivo(id_archivo);
    console.log('[archivo-delete] registro eliminado:', id_archivo);

    return res.status(200).json({ success: true, data: deleted, message: 'Archivo eliminado correctamente' });
  } catch (err) {
    console.error('[archivo-delete] error:', err);
    return next(err);
  }
};