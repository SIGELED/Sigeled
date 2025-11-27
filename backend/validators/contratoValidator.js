import { body, validationResult } from "express-validator";

const isUUID = (s) =>
    typeof s === 'string' &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s);

    export const createContratoValidators = [
    body('id_persona').isUUID().withMessage('id_persona UUID requerido'),
    body('id_profesor').optional().isUUID().withMessage('id_profesor debe ser UUID'),
    body('id_periodo').toInt().isInt({ min:1, max:2 }).withMessage('id_periodo debe ser 1 o 2'),
    body('horas_semanales').toInt().isInt({ min:1 }).withMessage('horas_semanales inválidas'),
    body('monto_hora').toFloat().isFloat({ gt:0 }).withMessage('monto_hora debe ser > 0'),
    body('fecha_inicio').isISO8601().withMessage('fecha_inicio inválida'),
    body('fecha_fin').optional({ nullable:true }).isISO8601().withMessage('fecha_fin inválida'),
    body().custom((value, { req }) => {
        const raw = Array.isArray(req.body.id_materias)
        ? req.body.id_materias
        : (req.body.id_materia != null ? [req.body.id_materia] : []);
        const ids = raw.map(String).filter(isUUID);
        if (!ids.length) throw new Error('Debe indicar al menos una materia (id_materias)');
        req.body.id_materias = ids; 
        return true;
    }),
];

export const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Validación fallida', details: errors.array() });
    }
    next();
};
