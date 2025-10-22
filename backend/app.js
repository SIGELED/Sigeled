import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import docenteRouter from './routes/docente.routes.js';
import userRouter from './routes/user.routes.js';
import roleRouter from './routes/role.routes.js';
import contratoRouter from './routes/contrato.routes.js';
import personaDocRouter from './routes/personaDoc.routes.js'; // corregido nombre
import personaRouter from './routes/persona.routes.js';
import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Configuración COMPLETA de Swagger con autenticación
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SIGELED API',
    version: '1.0.0',
    description: 'Documentación de la API para SIGELED',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Servidor local',
    },
  ],
  // ← ESTO ES LO QUE FALTABA
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
    ,
    schemas: {
      Contrato: {
        type: 'object',
        properties: {
          id_contrato_profesor: { type: 'integer', example: 1 },
          external_id: { type: 'string', format: 'uuid', example: '11111111-1111-1111-1111-111111111111', description: 'UUID público del contrato (external_id), usado en APIs públicas' },
          id_persona: { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000001', description: 'UUID string (ej: "00000000-0000-0000-0000-000000000001")' },
          id_profesor: { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000002', description: 'UUID string (ej: "00000000-0000-0000-0000-000000000002")' },
          id_materia: { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000003', description: 'UUID string (ej: "00000000-0000-0000-0000-000000000003")' },
          id_periodo: { type: 'integer', example: 2025 },
          horas_semanales: { type: 'integer', example: 20 },
          horas_mensuales: { type: 'integer', example: 80 },
          monto_hora: { type: 'number', format: 'float', example: 500.00 },
          fecha_inicio: { type: 'string', format: 'date', example: '2025-01-01' },
          fecha_fin: { type: 'string', format: 'date', example: '2025-12-31' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          persona_nombre: { type: 'string' },
          persona_apellido: { type: 'string' },
          descripcion_materia: { type: 'string' },
          carrera_descripcion: { type: 'string' }
        }
      },
      ContratoProfesorInput: {
        type: 'object',
        required: ['id_persona','id_profesor','id_materia','id_periodo','horas_semanales','monto_hora','fecha_inicio','fecha_fin'],
        properties: {
          id_persona: { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000001', description: 'UUID string (ej: "00000000-0000-0000-0000-000000000001")' },
          id_profesor: { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000002', description: 'UUID string (ej: "00000000-0000-0000-0000-000000000002")' },
          id_materia: { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000003', description: 'UUID string (ej: "00000000-0000-0000-0000-000000000003")' },
          id_periodo: { type: 'integer', example: 1 },
          horas_semanales: { type: 'integer', example: 20 },
          horas_mensuales: { type: 'integer', example: 80 },
          monto_hora: { type: 'number', format: 'float', example: 500.00 },
          fecha_inicio: { type: 'string', format: 'date', example: '2025-01-01' },
          fecha_fin: { type: 'string', format: 'date', example: '2025-12-31' },
          estado: { type: 'string', example: 'en_espera' },
          external_id: { type: 'string', format: 'uuid', example: '11111111-1111-1111-1111-111111111111', description: 'Output only: external UUID del contrato' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(cors());
// Limitar el tamaño del body y manejar errores de parseo JSON
app.use(express.json({ limit: '100kb' }));

// Middleware para capturar errores de parseo JSON y devolver 400 legible
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Error de parseo JSON
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
  }
  // Pasar al siguiente manejador de errores
  next(err);
});
app.use('/api/auth', authRouter);
app.use('/api/docente', docenteRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/contratos', contratoRouter);
app.use('/api/persona-doc', personaDocRouter); // corregido nombre
app.use('/api/persona', personaRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});