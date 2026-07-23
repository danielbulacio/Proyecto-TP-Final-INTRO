import { Router } from "express";
import {
    getAllTareas,
    getOneTarea,
    getParcela,
    createTarea,
    updateTarea,
    deleteTarea,
    reassignTarea,
    changeStateTarea
} from "../db/tareas.js";

export const endpointsTareas = Router();

const PRIORIDADES = ["Baja", "Media", "Alta", "Urgente"];
const ESTADOS = ["pendiente", "en_progreso", "completada", "cancelada"];

endpointsTareas.get("/", async (req, res) => {
    const tareas = await getAllTareas();
    res.json(tareas);
});

endpointsTareas.get("/:id", async (req, res) => {
    let id = req.params.id;

    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    const tarea = await getOneTarea(id);

    if (tarea === undefined) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }
    res.json(tarea);
});


endpointsTareas.put("/:id", async (req, res) => {
    let id = req.params.id;
    // 1. Extraemos parcela_id también
    const { parcela_id, tarea, prioridad, fecha_limite } = req.body; 

    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    const tareaExistente = await getOneTarea(id);
    if (!tareaExistente) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    // 2. Si envían parcela_id, validamos que exista[cite: 3]
    if (parcela_id !== undefined) {
        if (isNaN(parcela_id) || parcela_id <= 0) {
            res.status(400).json({ message: "La parcela debe ser un número positivo válido" });
            return;
        }
        const parcela = await getParcela(parcela_id);
        if (!parcela) {
            res.status(404).json({ message: "La parcela indicada no existe" });
            return;
        }
    }

    if (tarea !== undefined && tarea.trim().length === 0) {
        res.status(400).json({ message: "La tarea no puede quedar vacía" });
        return;
    }

    if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
        res.status(400).json({ message: `La prioridad debe ser una de: ${PRIORIDADES.join(", ")}` });
        return;
    }

    if (fecha_limite !== undefined && isNaN(Date.parse(fecha_limite))) {
        res.status(400).json({ message: "La fecha límite debe ser una fecha válida (YYYY-MM-DD)" });
        return;
    }

    // 3. Pasamos parcela_id a updateTarea[cite: 3]
    const updated = await updateTarea(id, parcela_id, tarea, prioridad, fecha_limite);

    if (!updated) {
        res.status(500).json({ message: "Error al actualizar la tarea" });
        return;
    }
    res.status(200).json({ message: "Tarea actualizada con éxito" });
});


endpointsTareas.post("/", async (req, res) => {

    const { parcela_id, tarea, prioridad, fecha_limite } = req.body;

    // 1. Valida campos/columnas requeridos/as
    if (!parcela_id || !tarea) {
        res.status(400).json({ message: "Faltan campos requeridos" });
        return;
    }

    // 2. Valida parcela_id
    if (isNaN(parcela_id) || parcela_id <= 0) {
        res.status(400).json({ message: "La parcela debe ser un número positivo válido" });
        return;
    }

    // 3. Valida si la parcela existe antes de crear la tarea
    const parcela = await getParcela(parcela_id);
    if (!parcela) {
        res.status(404).json({ message: "La parcela indicada no existe" });
        return;
    }

    if (prioridad !== undefined && !PRIORIDADES.includes(prioridad)) {
        res.status(400).json({ message: `La prioridad debe ser una de: ${PRIORIDADES.join(", ")}` });
        return;
    }

    if (fecha_limite !== undefined && isNaN(Date.parse(fecha_limite))) {
        res.status(400).json({ message: "La fecha límite debe ser una fecha válida (YYYY-MM-DD)" });
        return;
    }

    const created = await createTarea(
        parcela_id,
        tarea,
        prioridad || null,
        fecha_limite !== undefined ? fecha_limite : null
    );

    if (!created) {
        res.status(500).json({ message: "Error al crear la tarea" });
        return;
    }

    res.status(201).json({ message: "Tarea creada con éxito" });
});

endpointsTareas.delete("/:id", async (req, res) => {
    let id = req.params.id; // Leemos desde los parámetros de la URL

    // Valida que el ID sea valido
    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    // Chequea que la tarea existe antes de intentar eliminarla
    const tarea = await getOneTarea(id);
    if (!tarea) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    // Intentamos eliminar la tarea de la base de datos
    const deleted = await deleteTarea(id);

    if (!deleted) {
        res.status(500).json({ message: "Error al eliminar la tarea" });
        return;
    }

    res.status(200).json({ message: "Tarea eliminada" });
});

endpointsTareas.patch("/:id/asignar", async (req, res) => {
    let id = req.params.id;
    const { nueva_parcela_id } = req.body;

    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    if (!nueva_parcela_id || isNaN(nueva_parcela_id)) {
        res.status(400).json({ message: "nueva_parcela_id es obligatorio y debe ser un número válido" });
        return;
    }

    const tarea = await getOneTarea(id);
    if (!tarea) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    const parcelaDestino = await getParcela(nueva_parcela_id);
    if (!parcelaDestino) {
        res.status(404).json({ message: "La parcela destino no existe" });
        return;
    }

    const reasignada = await reassignTarea(id, nueva_parcela_id, tarea.parcela_id);

    if (!reasignada) {
        res.status(500).json({ message: "Error al reasignar la tarea" });
        return;
    }
    res.status(200).json({ message: "Tarea reasignada con éxito" });
});

endpointsTareas.patch("/:id/estado", async (req, res) => {
    let id = req.params.id;
    const { estado } = req.body;

    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    if (!estado || !ESTADOS.includes(estado)) {
        res.status(400).json({ message: `El estado debe ser uno de: ${ESTADOS.join(", ")}` });
        return;
    }

    const tarea = await getOneTarea(id);
    if (!tarea) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    const cambiado = await changeStateTarea(id, estado, tarea.estado);

    if (!cambiado) {
        res.status(500).json({ message: "Error al cambiar el estado de la tarea" });
        return;
    }
    res.status(200).json({ message: "Estado actualizado con éxito" });
});