export const validarRegistro = (req, res, next) => {
    const { email, password } = req.body;

    // Validar que ambos campos estén presentes
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Email y contraseña son requeridos' 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'El formato del email no es válido' 
        });
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 6 caracteres' 
        });
    }

    next();
};

export const validarLogin = (req, res, next) => {
    const { email, password } = req.body;

    // Validar que email y contraseña estén presentes
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Email y contraseña son requeridos' 
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'El formato del email no es válido' 
        });
    }

    next();
};

export const soloRRHH = (req, res, next) => {
    if (req.user && (req.user.rol === 'rrhh' || req.user.rol === 'administrador')) {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: solo RRHH o Administrador'
    });
};