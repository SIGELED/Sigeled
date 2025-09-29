// Importa modelos
import {
  Persona,
  PersonasIdentificacion,
  Profesor,
  CargoProfesor,
  Materia,
  Carrera,
  Anio,
  ContratoProfesor,
} from './index.js';

// Función de modelo: Obtener todos los contratos
export async function getAllContratos() {
  const contratos = await ContratoProfesor.findAll({
    include: [
      { model: Persona, as: 'Persona' },
      { model: Profesor, as: 'Profesor', include: [{ model: CargoProfesor, as: 'CargoProfesor' }] },
      { model: Materia, as: 'Materia', include: [{ model: Carrera, as: 'Carrera' }] },
    ],
    order: [['fecha_inicio', 'DESC']],
  });
  return contratos.map(c => c.toJSON());
}

// Función de modelo: Obtener contrato por ID
export async function getContratoById(idContrato) {
  const contrato = await ContratoProfesor.findByPk(idContrato, {
    include: [{ model: Persona }, { model: Materia }],
  });
  return contrato ? contrato.toJSON() : null;
}

// Nueva función de modelo: Buscar persona por DNI
export async function getPersonaByDni(dni) {
  const identificacion = await PersonasIdentificacion.findOne({
    where: { dni },
    include: [{ model: Persona }],
  });
  if (!identificacion) throw new Error('Persona no encontrada');
  return identificacion.Persona.toJSON();
}

// Nueva función de modelo: Detalles de profesor
export async function getProfesorDetalles(idPersona) {
  const profesor = await Profesor.findOne({
    where: { id_persona: idPersona },
    include: [
      { model: CargoProfesor, as: 'CargoProfesor' },
      { model: Materia, as: 'Materias', include: [{ model: Carrera, as: 'Carrera' }, { model: Anio, as: 'Anio' }] },
    ],
  });
  return profesor ? profesor.toJSON() : null;
}

// Nueva función de modelo: Materias por carrera y año
export async function getMateriasByCarreraAnio(idCarrera, idAnio) {
  const materias = await Materia.findAll({
    where: { id_carrera: idCarrera, id_anio: idAnio },
    include: [{ model: Carrera, as: 'Carrera' }],
  });
  return materias.map(m => m.toJSON());
}

// Nueva función de modelo: Crear contrato profesor
export async function crearContratoProfesor(data) {
  const contrato = await ContratoProfesor.create(data);
  return contrato.toJSON();
}

// Nueva función de modelo: Crear contrato (legacy para compatibilidad)
export async function createContrato(data) {
  const contrato = await ContratoProfesor.create(data);
  return contrato.toJSON();
}

// Nueva función de modelo: Actualizar contrato
export async function updateContrato(idContrato, data) {
  const contrato = await ContratoProfesor.findByPk(idContrato);
  if (!contrato) throw new Error('Contrato no encontrado');
  await contrato.update(data);
  return contrato.toJSON();
}

// Nueva función de modelo: Eliminar contrato
export async function deleteContrato(idContrato) {
  const contrato = await ContratoProfesor.findByPk(idContrato);
  if (!contrato) throw new Error('Contrato no encontrado');
  await contrato.destroy();
  return contrato.toJSON();
}