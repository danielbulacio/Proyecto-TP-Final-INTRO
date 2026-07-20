async function obtenerHistorialTarea(req, res) {
  try {
    const tarea = await pool.query('SELECT id FROM tareas WHERE id = $1', [req.params.id]);
    if (tarea.rowCount === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
 
    const historial = await pool.query(
      'SELECT * FROM tareas_historial WHERE tarea_id = $1 ORDER BY fecha DESC, id DESC',
      [req.params.id]
    );
    res.json(historial.rows);
  } catch (error) {
    manejarErrorSQL(error, res);
  }
}
 
module.exports = {
  obtenerHistorialTarea
};
