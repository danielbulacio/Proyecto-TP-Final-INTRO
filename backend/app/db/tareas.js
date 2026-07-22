import { db } from "./pool.js";

export async function getAllTareas() {
    const resultado = await db.query("SELECT * FROM tareas ORDER BY fecha_creacion DESC");
    return resultado.rows;
}

export async function getOneTarea(id) {
    const resultado = await db.query("SELECT * FROM tareas WHERE id = $1", [id]);
    return resultado.rows[0];
}

export async function getParcela(id) {
    const resultado = await db.query("SELECT id FROM parcelas WHERE id = $1", [id]);
    return resultado.rows[0];
}

export async function createTarea(parcela_id, tarea, prioridad, fecha_limite) {
    const resultado = await db.query(
        `INSERT INTO tareas (parcela_id, tarea, prioridad, fecha_limite)
         VALUES ($1, $2, COALESCE($3, 'Media'), $4)
         RETURNING id`,
        [parcela_id, tarea, prioridad || null, fecha_limite || null]
    );

    const nuevaTarea = resultado.rows[0];
    if (!nuevaTarea) return false;

    await db.query(
        `INSERT INTO tareas_historial (tarea_id, accion, detalle)
         VALUES ($1, 'creacion', $2)`,
        [nuevaTarea.id, `Tarea creada con prioridad "${prioridad || "Media"}" en la parcela ${parcela_id}`]
    );

    return true;
}

export async function updateTarea(id, parcela_id, tarea, prioridad, fecha_limite) {
    const resultado = await db.query(
        `UPDATE tareas SET
           parcela_id = COALESCE($1, parcela_id),
           tarea = COALESCE($2, tarea),
           prioridad = COALESCE($3, prioridad),
           fecha_limite = COALESCE($4, fecha_limite)
         WHERE id = $5`,
        [parcela_id ?? null, tarea ?? null, prioridad ?? null, fecha_limite ?? null, id]
    );

    if (resultado.rowCount === 0) return false;

    await db.query(
        `INSERT INTO tareas_historial (tarea_id, accion, detalle)
         VALUES ($1, 'actualizacion', 'Datos de la tarea actualizados')`,
        [id]
    );

    return true;
}

export async function deleteTarea(id) {
    const resultado = await db.query("DELETE FROM tareas WHERE id = $1", [id]);
    return resultado.rowCount > 0;
}

export async function reassignTarea(id, nuevaParcelaId, parcelaAnteriorId) {

    const resultado = await pool.query(


        "UPDATE tareas SET parcela_id = $1 WHERE id = $2",
        [nuevaParcelaId, id]
    );

    if (resultado.rowCount === 0) return false;

    await db.query(
        `INSERT INTO tareas_historial (tarea_id, accion, detalle, parcela_anterior_id, parcela_nueva_id)
         VALUES ($1, 'reasignacion', $2, $3, $4)`,
        [id, `Tarea reasignada de la parcela ${parcelaAnteriorId} a la parcela ${nuevaParcelaId}`, parcelaAnteriorId, nuevaParcelaId]
    );

    return true;
}

export async function changeStateTarea(id, estado, estadoAnterior) {
    const fechaCompletada = estado === "completada" ? new Date().toISOString() : null;

    const resultado = await db.query(
        "UPDATE tareas SET estado = $1, fecha_completada = $2 WHERE id = $3",
        [estado, fechaCompletada, id]
    );

    if (resultado.rowCount === 0) return false;

    await db.query(
        `INSERT INTO tareas_historial (tarea_id, accion, detalle, estado_anterior, estado_nuevo)
         VALUES ($1, 'cambio_estado', $2, $3, $4)`,
        [id, `Estado cambiado de "${estadoAnterior}" a "${estado}"`, estadoAnterior, estado]
    );

    return true;
}

export async function getHistorialTarea(id) {
    const resultado = await db.query(
        "SELECT * FROM tareas_historial WHERE tarea_id = $1 ORDER BY fecha DESC, id DESC",
        [id]
    );
    return resultado.rows;
}