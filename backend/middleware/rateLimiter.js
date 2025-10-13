import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP
    message: {
        success: false,
        message: 'Demasiados intentos de login. Intenta en 15 minutos.',
        codigo_error: 'TOO_MANY_ATTEMPTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
        success: false,
        message: 'Demasiadas peticiones. Intenta más tarde.',
        codigo_error: 'RATE_LIMIT_EXCEEDED'
    }
});