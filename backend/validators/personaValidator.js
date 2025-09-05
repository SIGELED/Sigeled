export const validarDatosPersona = (req, res, next) => {
    const { nombre, apellido, fecha_nacimiento, sexo, id_tipo_empleado } = req.body;
    if (!nombre || !apellido || !fecha_nacimiento || !sexo || !id_tipo_empleado) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    next();
};