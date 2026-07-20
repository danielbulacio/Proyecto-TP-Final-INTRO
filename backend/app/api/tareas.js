const pool = require('../data/pool');
const manejarErrorSQL = require('../utils/manejarErrorSQL');
const {
  validarCreacion,
  validarActualizacion,
  validarCambioEstado,
  validarReasignacion
} = require('../utils/validarTarea');

//crear Tarea

async function crearTarea(req, res) {
  const { valido, errores } = validarCreacion(req.body);
  if (!valido) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }
 
  const { parcela_id, tarea, prioridad, fecha_limite } = req.body;
  const cliente = await pool.connect();
 
  try {
    await cliente.query('BEGIN');
    
    const parcela = await cliente.query('SELECT id FROM parcelas WHERE id = $1', [parcela_id]);
    if (parcela.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ error: 'La parcela indicada no existe' });
    }

    const resultado = await cliente.query(
      `INSERT INTO tareas (parcela_id, tarea, prioridad, fecha_limite)
       VALUES ($1, $2, COALESCE($3, 'Media'), $4)
       RETURNING *`,
      [parcela_id, tarea.trim(), prioridad || null, fecha_limite || null]
    );
    const tareaCreada = resultado.rows[0];
 
    await cliente.query(
      `INSERT INTO tareas_historial (tarea_id, accion, detalle)
       VALUES ($1, 'creacion', $2)`,
      [tareaCreada.id, `Tarea creada con prioridad "${tareaCreada.prioridad}" en la parcela ${parcela_id}`]
    );
 
    await cliente.query('COMMIT');
    res.status(201).json(tareaCreada);
  } catch (error) {
    await cliente.query('ROLLBACK');
    manejarErrorSQL(error, res);
  } finally {
    cliente.release();
  }
}

async function obtenerTareas(req, res) {
  const { parcela_id, estado, prioridad } = req.query;
  const condiciones = [];
  const valores = [];
 
  if (parcela_id) {
    valores.push(parcela_id);
    condiciones.push(`parcela_id = $${valores.length}`);
  }
  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }
  if (prioridad) {
    valores.push(prioridad);
    condiciones.push(`prioridad = $${valores.length}`);
  }
 
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
 
  try {
    const resultado = await pool.query(
      `SELECT * FROM tareas ${where} ORDER BY fecha_creacion DESC`,
      valores
    );
    res.json(resultado.rows);
  } catch (error) {
    manejarErrorSQL(error, res);
  }
}

async function obtenerTareaPorId(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM tareas WHERE id = $1', [req.params.id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(resultado.rows[0]);
  } catch (error) {
    manejarErrorSQL(error, res);
  }
}

async function actualizarTarea(req, res) {
  const { valido, errores } = validarActualizacion(req.body);
  if (!valido) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }
 
  const { tarea, prioridad, fecha_limite } = req.body;
  const cliente = await pool.connect();
 
  try {
    await cliente.query('BEGIN');
 
    const existente = await cliente.query('SELECT * FROM tareas WHERE id = $1', [req.params.id]);
    if (existente.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
 
    const resultado = await cliente.query(
      `UPDATE tareas SET
         tarea = COALESCE($1, tarea),
         prioridad = COALESCE($2, prioridad),
         fecha_limite = COALESCE($3, fecha_limite)
       WHERE id = $4
       RETURNING *`,
      [tarea ?? null, prioridad ?? null, fecha_limite ?? null, req.params.id]
    );
 
    await cliente.query(
      `INSERT INTO tareas_historial (tarea_id, accion, detalle)
       VALUES ($1, 'actualizacion', 'Datos de la tarea actualizados')`,
      [req.params.id]
    );
 
    await cliente.query('COMMIT');
    res.json(resultado.rows[0]);
  } catch (error) {
    await cliente.query('ROLLBACK');
    manejarErrorSQL(error, res);
  } finally {
    cliente.release();
  }
}

async function eliminarTarea(req, res) {
  try {
    const resultado = await pool.query('DELETE FROM tareas WHERE id = $1 RETURNING id', [req.params.id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.status(204).send();
  } catch (error) {
    manejarErrorSQL(error, res);
  }
}


async function asignarTareaAParcela(req, res) {
  const { valido, errores } = validarReasignacion(req.body);
  if (!valido) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }
 
  const { nueva_parcela_id } = req.body;
  const cliente = await pool.connect();
 
  try {
    await cliente.query('BEGIN');
 
    const tarea = await cliente.query('SELECT * FROM tareas WHERE id = $1', [req.params.id]);
    if (tarea.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
 
    const parcelaDestino = await cliente.query('SELECT id FROM parcelas WHERE id = $1', [nueva_parcela_id]);
    if (parcelaDestino.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ error: 'La parcela destino no existe' });
    }
 
    const parcelaAnterior = tarea.rows[0].parcela_id;
 
    const resultado = await cliente.query(
      'UPDATE tareas SET parcela_id = $1 WHERE id = $2 RETURNING *',
      [nueva_parcela_id, req.params.id]
    );
 
    await cliente.query(
      `INSERT INTO tareas_historial (tarea_id, accion, detalle, parcela_anterior_id, parcela_nueva_id)
       VALUES ($1, 'reasignacion', $2, $3, $4)`,
      [
        req.params.id,
        `Tarea reasignada de la parcela ${parcelaAnterior} a la parcela ${nueva_parcela_id}`,
        parcelaAnterior,
        nueva_parcela_id
      ]
    );
 
    await cliente.query('COMMIT');
    res.json(resultado.rows[0]);
  } catch (error) {
    await cliente.query('ROLLBACK');
    manejarErrorSQL(error, res);
  } finally {
    cliente.release();
  }
}

async function cambiarEstadoTarea(req, res) {
  const { valido, errores } = validarCambioEstado(req.body);
  if (!valido) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }
 
  const { estado } = req.body;
  const cliente = await pool.connect();
 
  try {
    await cliente.query('BEGIN');
 
    const tarea = await cliente.query('SELECT * FROM tareas WHERE id = $1', [req.params.id]);
    if (tarea.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
 
    const estadoAnterior = tarea.rows[0].estado;
    const fechaCompletada = estado === 'completada' ? new Date().toISOString() : null;
 
    const resultado = await cliente.query(
      `UPDATE tareas SET estado = $1, fecha_completada = $2 WHERE id = $3 RETURNING *`,
      [estado, fechaCompletada, req.params.id]
    );
 
    await cliente.query(
      `INSERT INTO tareas_historial (tarea_id, accion, detalle, estado_anterior, estado_nuevo)
       VALUES ($1, 'cambio_estado', $2, $3, $4)`,
      [req.params.id, `Estado cambiado de "${estadoAnterior}" a "${estado}"`, estadoAnterior, estado]
    );
 
    await cliente.query('COMMIT');
    res.json(resultado.rows[0]);
  } catch (error) {
    await cliente.query('ROLLBACK');
    manejarErrorSQL(error, res);
  } finally {
    cliente.release();
  }
}

module.exports = {
  crearTarea,
  obtenerTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea,
  asignarTareaAParcela,
  cambiarEstadoTarea
};

