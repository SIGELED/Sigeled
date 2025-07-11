import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authrRoutes.js';
import docenteRoutes from './routes/docenteRoutes.js';
import contratoRoutes from './routes/contratoRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/docente', docenteRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/contratos', contratoRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});