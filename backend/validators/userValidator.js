// Validaciones para gestión de usuarios

// Validar creación de usuario (solo administradores)
export const validarCrearUsuario = (req, res, next) => {
    const { nombre, email, contraseña, rol, dni, cuil, domicilio, titulo } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !contraseña || !rol) {
        return res.status(400).json({ 
            message: 'Campos requeridos: nombre, email, contraseña, rol' 
        });
    }

    // Validar nombre
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

    // Validar contraseña segura
    if (contraseña.length < 8) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 8 caracteres' 
        });
    }

    // Validar que la contraseña contenga al menos una letra mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(contraseña)) {
        return res.status(400).json({ 
            message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número' 
        });
    }

    // Validar DNI (si se proporciona)
    if (dni && !/^\d{7,8}$/.test(dni)) {
        return res.status(400).json({ 
            message: 'El DNI debe tener 7 u 8 dígitos' 
        });
    }

    // Validar CUIL (si se proporciona)
    if (cuil && !/^\d{2}-\d{8}-\d{1}$/.test(cuil)) {
        return res.status(400).json({ 
            message: 'El CUIL debe tener el formato XX-XXXXXXXX-X' 
        });
    }

    // Validar que el rol sea un número (ID del rol)
    if (isNaN(rol) || rol <= 0) {
        return res.status(400).json({ 
            message: 'El rol debe ser un ID válido' 
        });
    }

    next();
};

// Validar actualización de usuario
export const validarActualizarUsuario = (req, res, next) => {
    const { nombre, email, dni, cuil, domicilio, titulo } = req.body;

    // Al menos un campo debe estar presente
    if (!nombre && !email && !dni && !cuil && !domicilio && !titulo) {
        return res.status(400).json({ 
            message: 'Al menos un campo debe ser proporcionado para actualizar' 
        });
    }

    // Validar nombre si se proporciona
    if (nombre && nombre.trim().length < 2) {
        return res.status(400).json({ 
            message: 'El nombre debe tener al menos 2 caracteres' 
        });
    }

    // Validar formato de email si se proporciona
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'El formato del email no es válido' 
            });
        }
    }

    // Validar DNI si se proporciona
    if (dni && !/^\d{7,8}$/.test(dni)) {
        return res.status(400).json({ 
            message: 'El DNI debe tener 7 u 8 dígitos' 
        });
    }

    // Validar CUIL si se proporciona
    if (cuil && !/^\d{2}-\d{8}-\d{1}$/.test(cuil)) {
        return res.status(400).json({ 
            message: 'El CUIL debe tener el formato XX-XXXXXXXX-X' 
        });
    }

    next();
};

// Validar asignación de rol
export const validarAsignarRol = (req, res, next) => {
    const { roleId } = req.body;

    if (!roleId) {
        return res.status(400).json({ 
            message: 'El ID del rol es requerido' 
        });
    }

    if (isNaN(roleId) || roleId <= 0) {
        return res.status(400).json({ 
            message: 'El ID del rol debe ser un número válido' 
        });
    }

    next();
};

// Validar cambio de contraseña
export const validarCambiarContraseña = (req, res, next) => {
    const { contraseñaActual, nuevaContraseña } = req.body;

    if (!contraseñaActual || !nuevaContraseña) {
        return res.status(400).json({ 
            message: 'Contraseña actual y nueva contraseña son requeridas' 
        });
    }

    // Validar nueva contraseña segura
    if (nuevaContraseña.length < 8) {
        return res.status(400).json({ 
            message: 'La nueva contraseña debe tener al menos 8 caracteres' 
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(nuevaContraseña)) {
        return res.status(400).json({ 
            message: 'La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número' 
        });
    }

    next();
}; 