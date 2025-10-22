import { body, validationResult } from 'express-validator';

export const createContratoValidators = [
  body('id_persona').exists().withMessage('id_persona es requerido').isUUID().withMessage('id_persona debe ser UUID'),
  body('id_profesor').exists().withMessage('id_profesor es requerido').isUUID().withMessage('id_profesor debe ser UUID'),
  body('id_materia').exists().withMessage('id_materia es requerido').isUUID().withMessage('id_materia debe ser UUID'),
  body('id_periodo').exists().withMessage('id_periodo es requerido').isInt().withMessage('id_periodo debe ser entero'),
  body('horas_semanales').exists().withMessage('horas_semanales es requerido').isInt({ min: 0, max: 160 }).withMessage('horas_semanales debe ser entero entre 0 y 160'),
  body('horas_mensuales').optional().isInt({ min: 0 }).withMessage('horas_mensuales debe ser entero positivo'),
  body('monto_hora').exists().withMessage('monto_hora es requerido').isFloat({ min: 0 }).withMessage('monto_hora debe ser numero >= 0'),
  body('fecha_inicio').exists().withMessage('fecha_inicio es requerido').isISO8601().withMessage('fecha_inicio debe ser fecha ISO (YYYY-MM-DD)'),
  body('fecha_fin').exists().withMessage('fecha_fin es requerido').isISO8601().withMessage('fecha_fin debe ser fecha ISO (YYYY-MM-DD)'),
  body('fecha_fin').custom((value, { req }) => {
    const start = new Date(req.body.fecha_inicio);
    const end = new Date(value);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Fechas inválidas');
    }
    if (start >= end) {
      throw new Error('fecha_inicio debe ser anterior a fecha_fin');
    }
    return true;
  }),
  body('estado').optional().isString().withMessage('estado debe ser texto')
];

// Validadores para actualización retirados: la actualización de contratos está deshabilitada.

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
