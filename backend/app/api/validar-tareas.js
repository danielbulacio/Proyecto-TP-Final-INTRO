const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Urgente'];
const ESTADOS = ['pendiente', 'en_progreso', 'completada', 'cancelada'];
 
function esFechaValida(valor) {
  if (typeof valor !== 'string') return false;
  // Formato esperado YYYY-MM-DD (lo que envía un <input type="date">)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00`);
  return !Number.isNaN(fecha.getTime());
}
 
// Valida el body para crear una tarea nueva (POST /api/tareas)
function validarCreacion(body) {
  const errores = [];
  const { parcela_id, tarea, prioridad, fecha_limite } = body;
 
  // --- parcela_id ---
  if (parcela_id === undefined || parcela_id === null || parcela_id === '') {
    errores.push({ campo: 'parcela_id', mensaje: 'parcela_id es obligatorio' });
  } else if (!Number.isInteger(Number(parcela_id))) {
    errores.push({ campo: 'parcela_id', mensaje: 'parcela_id debe ser un número entero' });
  }
 
  // --- tarea ---
  if (!tarea || typeof tarea !== 'string' || tarea.trim().length === 0) {
    errores.push({ campo: 'tarea', mensaje: 'tarea es obligatoria y no puede estar vacía' });
  } else if (tarea.length > 255) {
    errores.push({ campo: 'tarea', mensaje: 'tarea no puede superar los 255 caracteres' });
  }
 
  // --- prioridad (el usuario "designa la importancia" acá) ---
  if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
    errores.push({
      campo: 'prioridad',
      mensaje: `prioridad debe ser una de: ${PRIORIDADES.join(', ')}`
    });
  }
 
  // --- fecha_limite ---
  if (fecha_limite !== undefined && fecha_limite !== null && fecha_limite !== '') {
    if (!esFechaValida(fecha_limite)) {
      errores.push({ campo: 'fecha_limite', mensaje: 'fecha_limite debe tener formato YYYY-MM-DD' });
    }
  }
 
  // --- campos que el usuario NUNCA debe poder fijar a mano ---
  if (body.estado !== undefined) {
    errores.push({ campo: 'estado', mensaje: 'estado no se define al crear la tarea (usa PATCH /:id/estado)' });
  }
  if (body.fecha_completada !== undefined) {
    errores.push({
      campo: 'fecha_completada',
      mensaje: 'fecha_completada se calcula automáticamente al completar la tarea'
    });
  }
 
  return { valido: errores.length === 0, errores };
}
 
// Valida el body para actualizar campos generales (PUT /api/tareas/:id)
function validarActualizacion(body) {
  const errores = [];
  const { tarea, prioridad, fecha_limite } = body;
 
  if (tarea !== undefined) {
    if (typeof tarea !== 'string' || tarea.trim().length === 0) {
      errores.push({ campo: 'tarea', mensaje: 'tarea no puede quedar vacía' });
    } else if (tarea.length > 255) {
      errores.push({ campo: 'tarea', mensaje: 'tarea no puede superar los 255 caracteres' });
    }
  }
 
  if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
    errores.push({
      campo: 'prioridad',
      mensaje: `prioridad debe ser una de: ${PRIORIDADES.join(', ')}`
    });
  }
 
  if (fecha_limite !== undefined && fecha_limite !== null && fecha_limite !== '' && !esFechaValida(fecha_limite)) {
    errores.push({ campo: 'fecha_limite', mensaje: 'fecha_limite debe tener formato YYYY-MM-DD' });
  }
 
  return { valido: errores.length === 0, errores };
}
 
// Valida el body para cambiar el estado (PATCH /api/tareas/:id/estado)
function validarCambioEstado(body) {
  const errores = [];
  if (!body.estado || !ESTADOS.includes(body.estado)) {
    errores.push({ campo: 'estado', mensaje: `estado debe ser uno de: ${ESTADOS.join(', ')}` });
  }
  return { valido: errores.length === 0, errores };
}
 
// Valida el body para reasignar la tarea a otra parcela (PATCH /api/tareas/:id/asignar)
function validarReasignacion(body) {
  const errores = [];
  if (body.nueva_parcela_id === undefined || !Number.isInteger(Number(body.nueva_parcela_id))) {
    errores.push({ campo: 'nueva_parcela_id', mensaje: 'nueva_parcela_id es obligatorio y debe ser un entero' });
  }
  return { valido: errores.length === 0, errores };
}
 
module.exports = {
  PRIORIDADES,
  ESTADOS,
  esFechaValida,
  validarCreacion,
  validarActualizacion,
  validarCambioEstado,
  validarReasignacion
};