import { db } from "./pool.js";

export async function getAllTareas() {
    const resultado = await db.query("SELECT * FROM tareas ORDER BY id DESC");
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

    return true;
}

export async function deleteTarea(id) {
    const resultado = await db.query("DELETE FROM tareas WHERE id = $1", [id]);
    return resultado.rowCount > 0;
}

export async function reassignTarea(id, nuevaParcelaId, parcelaAnteriorId) {

    const resultado = await db.query(


        "UPDATE tareas SET parcela_id = $1 WHERE id = $2",
        [nuevaParcelaId, id]
    );

    if (resultado.rowCount === 0) return false;

    return true;
}

export async function changeStateTarea(id, estado) {
    const resultado = await db.query(
        "UPDATE tareas SET estado = $1 WHERE id = $2",
        [estado, id]
    );

    if (resultado.rowCount === 0) return false;

    return true;
}