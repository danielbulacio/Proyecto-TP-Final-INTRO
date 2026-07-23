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


// devuelve todas las tareas
endpointsTareas.get("/", async (req, res) => {
    const tareas = await getAllTareas();
    res.json(tareas);
});


// devuelve una tarea
endpointsTareas.get("/:id", async (req, res) => {
    let id = req.params.id;

    const tarea = await getOneTarea(id);

    // no existe
    if (tarea === undefined) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }
    res.json(tarea);
});


// edita una tarea
endpointsTareas.put("/:id", async (req, res) => {
    let id = req.params.id;
    const { parcela_id, tarea, prioridad, fecha_limite } = req.body;

    // la tarea tiene que existir
    const tareaExistente = await getOneTarea(id);
    if (!tareaExistente) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    // si mandaron parcela, tiene que existir
    if (parcela_id !== undefined) {
        const parcela = await getParcela(parcela_id);
        if (!parcela) {
            res.status(404).json({ message: "La parcela indicada no existe" });
            return;
        }
    }

    // actualizamos
    const updated = await updateTarea(id, parcela_id, tarea, prioridad, fecha_limite);

    if (!updated) {
        res.status(500).json({ message: "Error al actualizar la tarea" });
        return;
    }
    res.status(200).json({ message: "Tarea actualizada con éxito" });
});


// crea una tarea
endpointsTareas.post("/", async (req, res) => {

    const { parcela_id, tarea, prioridad, fecha_limite } = req.body;

    // parcela y descripcion son obligatorias
    if (!parcela_id || !tarea) {
        res.status(400).json({ message: "Faltan campos requeridos" });
        return;
    }

    // la parcela tiene que existir
    const parcela = await getParcela(parcela_id);
    if (!parcela) {
        res.status(404).json({ message: "La parcela indicada no existe" });
        return;
    }

    // creamos (si no vino prioridad/fecha va null)
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


// borra una tarea
endpointsTareas.delete("/:id", async (req, res) => {
    let id = req.params.id;

    // la tarea tiene que existir
    const tarea = await getOneTarea(id);
    if (!tarea) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    // la borramos
    const deleted = await deleteTarea(id);

    if (!deleted) {
        res.status(500).json({ message: "Error al eliminar la tarea" });
        return;
    }

    res.status(200).json({ message: "Tarea eliminada" });
});


// reasigna la tarea a otra parcela (el frontend NO usa esto, feature a medias)
endpointsTareas.patch("/:id/asignar", async (req, res) => {
    let id = req.params.id;
    const { nueva_parcela_id } = req.body;

    // la parcela destino es obligatoria
    if (!nueva_parcela_id) {
        res.status(400).json({ message: "nueva_parcela_id es obligatorio" });
        return;
    }

    // la tarea tienee que existir
    const tarea = await getOneTarea(id);
    if (!tarea) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    // la parcela destino tiene que existir
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


// cambia solo el estado de una tarea (el desplegbale)
endpointsTareas.patch("/:id/estado", async (req, res) => {
    let id = req.params.id;
    const { estado } = req.body;

    // la tarea tiene que existir
    const tarea = await getOneTarea(id);
    if (!tarea) {
        res.status(404).json({ message: "Tarea no encontrada" });
        return;
    }

    // cambiamos el estado
    const cambiado = await changeStateTarea(id, estado);

    if (!cambiado) {
        res.status(500).json({ message: "Error al cambiar el estado de la tarea" });
        return;
    }
    res.status(200).json({ message: "Estado actualizado con éxito" });
});
