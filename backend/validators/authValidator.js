export const validarRegistro = (req, res, next) => {
    const { nombre, email, contraseña, rol } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !email || !contraseña || !rol) {
        return res.status(400).json({ 
            message: 'Todos los campos son requeridos: nombre, email, contraseña, rol' 
        });
    }

    // Validar que el nombre tenga al menos 2 caracteres
    if (nombre.trim().length < 2) {
        return res.status(400).json({ 
            message: 'El nombre debe tener al menos 2 caracteres' 
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
    if (contraseña.length < 6) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 6 caracteres' 
        });
    }

    // Validar que el rol sea válido
    const rolesValidos = ['docente', 'rrhh', 'admin'];
    if (!rolesValidos.includes(rol)) {
        return res.status(400).json({ 
            message: 'El rol debe ser: docente, rrhh o admin' 
        });
    }

    next();
};

export const validarLogin = (req, res, next) => {
    const { email, contraseña } = req.body;

    // Validar que email y contraseña estén presentes
    if (!email || !contraseña) {
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