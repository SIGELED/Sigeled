import { body } from 'express-validator';

export const domicilioValidator = [
    body('calle')
        .isString().withMessage('La calle debe ser texto')
        .notEmpty().withMessage('La calle es obligatoria'),
    body('altura')
        .isInt({ min: 1 }).withMessage('La altura debe ser un número positivo'),
    body('id_dom_barrio')
        .isInt().withMessage('El barrio debe ser un ID válido'),
    body('id_dom_localidad')
        .isInt().withMessage('La localidad debe ser un ID válido'),
    body('id_estado')
        .optional().isInt().withMessage('El estado debe ser un número'),
];
