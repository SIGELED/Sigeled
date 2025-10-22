import { body } from 'express-validator';

export const domicilioValidator = [
    body('calle')
        .isString().withMessage('La calle debe ser texto')
        .trim().notEmpty().withMessage('La calle es obligatoria')
        .isLength({max:120}).withMessage('calle demasiado larga'),

    body('altura')
        .isInt({ min: 1 }).withMessage('La altura debe ser un número positivo'),

    body('id_dom_barrio')
        .optional({nullable: true})
        .isInt().withMessage('El barrio debe ser un ID válido'),
];
