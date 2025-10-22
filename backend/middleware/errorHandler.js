export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
            codigo_error: err.codigo_error || 'ERROR_PERSONALIZADO'
        });
    }

    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Registro duplicado',
            codigo_error: 'DUPLICATE_ENTRY'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        codigo_error: 'INTERNAL_ERROR'
    });
};