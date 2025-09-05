import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authrRoutes.js';
import docenteRoutes from './routes/docenteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import contratoRoutes from './routes/contratoRoutes.js';
import authRouter from './routes/authr.routes.js';
import docenteRouter from './routes/docente.routes.js';
import userRouter from './routes/user.routes.js';
import roleRouter from './routes/role.routes.js';
import contratoRouter from './routes/contrato.routes.js';
import personaDocRouster from './routes/personaDoc.routes.js';
import personaRouter from './routes/persona.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/docente', docenteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/auth', authRouter);
app.use('/api/docente', docenteRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/contratos', contratoRouter);
app.use('/api/persona-doc', personaDocRouster);
app.use('/api/persona', personaRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});