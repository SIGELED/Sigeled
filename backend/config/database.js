import 'dotenv/config'; // Carga variables de .env
import { Sequelize } from 'sequelize';

// Construye DATABASE_URL desde env vars
const databaseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('DATABASE_URL construida:', databaseUrl.replace(process.env.DB_PASS, '***')); // Log sin password para debug

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Cambia a true para ver queries
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

// Prueba la conexión
sequelize.authenticate()
  .then(() => console.log('Conexión a DB exitosa'))
  .catch(err => console.error('Error en conexión:', err));

export default sequelize;