import multer from 'multer';

const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

export const archivoValidator = multer({
    storage,
    limits: { fileSize: TAMANO_MAXIMO },
    fileFilter: (req, file, cb) => {
        if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
        } else {
        cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG y PNG.'), false);
        }
    }
});
