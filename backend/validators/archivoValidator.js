import multer from 'multer';

export const archivoValidator = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG y PNG.'));
        }
    }
});