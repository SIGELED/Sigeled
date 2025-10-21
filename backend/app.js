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
          id_persona: { type: 'integer', example: 3 },
          id_profesor: { type: 'integer', example: 5 },
          id_materia: { type: 'integer', example: 10 },
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
          id_persona: { type: 'integer', example: 3 },
          id_profesor: { type: 'integer', example: 5 },
          id_materia: { type: 'integer', example: 10 },
          id_periodo: { type: 'integer', example: 1 },
          horas_semanales: { type: 'integer', example: 20 },
          horas_mensuales: { type: 'integer', example: 80 },
          monto_hora: { type: 'number', format: 'float', example: 500.00 },
          fecha_inicio: { type: 'string', format: 'date', example: '2025-01-01' },
          fecha_fin: { type: 'string', format: 'date', example: '2025-12-31' },
          estado: { type: 'string', example: 'en_espera' }
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
app.use(express.json());
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