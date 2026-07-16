import { Router } from "express";
import { getAllCultivos, getOneCultivo, createCultivo, deleteCultivo } from "../db/cultivos.js";

export const endpointsCultivos = Router();

endpointsCultivos.get("/", async (req, res) => {
    const cultivos = await getAllCultivos();
    res.json(cultivos);
});

endpointsCultivos.get("/:id", async (req, res) => {
    let id = req.params.id;

    const cultivo = await getOneCultivo(id);

    if (cultivo === undefined) {
        res.sendStatus(404);
        return;
    }

    res.json(cultivo);
});

endpointsCultivos.post("/", async (req, res) => {
    // Desestructuramos el body para que el código quede más limpio
    const { nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios } = req.body;

    const created = await createCultivo(nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios);

    if (!created) {
        res.sendStatus(500);
        return;
    }

    res.status(201).json({message: "Cultivo creado"});
});

endpointsCultivos.delete("/:id", async (req, res) => {
    let id = req.params.id; // Leemos desde los parámetros de la URL

    // Chequear que el cultivo existe antes de intentar eliminarlo
    const cultivo = await getOneCultivo(id);

    if (!cultivo) {
        res.sendStatus(404);
        return;
    }

    const deleted = await deleteCultivo(id);

    if (!deleted) {
        res.sendStatus(500);
        return;
    }

    res.status(200).json({ message: "Cultivo eliminado" });
});