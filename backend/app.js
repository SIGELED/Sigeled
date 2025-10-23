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
import archivosRouter from './routes/archivos.routes.js';
import personaTituRouter from './routes/personaTitu.routes.js';

// Configuración básica de Swagger
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
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Documenta todas las rutas
};

const swaggerSpec = swaggerJSDoc(options);

const app = express(); // debe ir antes de usar app.use

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/docente', docenteRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/contratos', contratoRouter);
app.use('/api/persona-doc', personaDocRouter); 
app.use('/api/archivos', archivosRouter); 
app.use('/api/persona', personaRouter);
app.use('/api/titulos', personaTituRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});