import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Modelos principales
const Persona = sequelize.define('Persona', {
  id_persona: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  fecha_nacimiento: DataTypes.DATE,
  sexo: DataTypes.STRING,
  telefono: DataTypes.STRING,
}, { tableName: 'personas', timestamps: false });

const PersonasIdentificacion = sequelize.define('PersonasIdentificacion', {
  id_persona: { type: DataTypes.UUID, primaryKey: true },
  dni: { type: DataTypes.STRING, unique: true, allowNull: false },
  cuil: { type: DataTypes.STRING, unique: true, allowNull: false },
}, { tableName: 'personas_identificacion' });

const Profesor = sequelize.define('Profesor', {
  id_profesor: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  id_cargo_materia: DataTypes.UUID,
}, { tableName: 'profesor' });

const CargoProfesor = sequelize.define('CargoProfesor', {
  id_cargo_profesor: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  cargo_descripcion: DataTypes.STRING,
}, { tableName: 'cargo_profesor' });

const Materia = sequelize.define('Materia', {
  id_materia: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  descripcion_materia: { type: DataTypes.STRING, allowNull: false },
  id_anio: DataTypes.UUID,
}, { tableName: 'materia' });

const Carrera = sequelize.define('Carrera', {
  id_carrera: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  carrera_descripcion: DataTypes.STRING,
}, { tableName: 'carrera' });

const Anio = sequelize.define('Anio', {
  id_anio: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  descripcion: DataTypes.STRING,
}, { tableName: 'anio' });

const ContratoProfesor = sequelize.define('ContratoProfesor', {
  id_contrato_profesor: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  id_persona: { type: DataTypes.UUID, allowNull: false },
  id_profesor: { type: DataTypes.UUID, allowNull: false },
  id_periodo: { type: DataTypes.UUID, allowNull: false },
  horas_semanales: DataTypes.INTEGER,
  horas_mensuales: DataTypes.INTEGER,
  fecha_inicio: DataTypes.DATE,
  fecha_fin: DataTypes.DATE,
}, { tableName: 'contrato_profesor' });

// Asociaciones
Persona.hasOne(PersonasIdentificacion, { foreignKey: 'id_persona' });
PersonasIdentificacion.belongsTo(Persona, { foreignKey: 'id_persona' });

Profesor.belongsTo(Persona, { foreignKey: 'id_persona' });
Profesor.belongsTo(CargoProfesor, { foreignKey: 'id_cargo_materia' });

Materia.belongsTo(Anio, { foreignKey: 'id_anio' });
Materia.belongsTo(Carrera, { foreignKey: 'id_carrera' });

ContratoProfesor.belongsTo(Persona, { foreignKey: 'id_persona' });
ContratoProfesor.belongsTo(Profesor, { foreignKey: 'id_profesor' });

// Sincroniza modelos con DB
sequelize.sync({ alter: true }).then(() => console.log('Modelos sincronizados'));

export {
  sequelize,
  Persona,
  PersonasIdentificacion,
  Profesor,
  CargoProfesor,
  Materia,
  Carrera,
  Anio,
  ContratoProfesor,
};