import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRouter from './routes/auth.routes.js';
import docenteRouter from './routes/docente.routes.js';
import userRouter from './routes/user.routes.js';
import roleRouter from './routes/role.routes.js';
import contratoRouter from './routes/contrato.routes.js';
import personaDocRouter from './routes/personaDoc.routes.js'; 
import personaRouter from './routes/persona.routes.js';
import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import archivosRouter from './routes/archivos.routes.js';
import personaTituRouter from './routes/personaTitu.routes.js';
import legajoRouter from './routes/legajo.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import notificacionRouter from './routes/notificacion.routes.js';

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
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

  socket.on('join_room', (roomName) => {
    if(roomName) {
      socket.join(roomName.toString());
      console.log(`[Socket.IO] Cliente ${socket.id} se unió a la sala: ${roomName}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
  })
})

export { io };

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
app.use('/api/legajo', legajoRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notificaciones', notificacionRouter);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Servidor (y Socket.IO) corriendo en el puerto ${PORT}`);
});