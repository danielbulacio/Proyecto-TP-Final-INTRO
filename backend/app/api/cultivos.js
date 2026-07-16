import { Router } from "express";
import { getAllCultivos, getOneCultivo, createCultivo, deleteCultivo } from "../db/cultivos.js";

export const endpointsCultivos = Router();

endpointsCultivos.get("/", async (req, res) => {
    const cultivos = await getAllCultivos();
    res.json(cultivos);
});

endpointsCultivos.get("/:id", async (req, res) => {
    let id = req.params.id;


    // Validamos que el ID sea un número válido
    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    // Chequear que el cultivo existe antes de intentar obtenerlo
    const cultivo = await getOneCultivo(id);

    if (cultivo === undefined) {
        res.status(404).json({ message: "Cultivo no encontrado" });
        return;
    }

    // Si el cultivo existe, lo retornamos
    res.json(cultivo);
});

endpointsCultivos.post("/", async (req, res) => {
    // Desestructuramos el body para que el código quede más limpio
    const { nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios } = req.body;

    // Validamos que todos los campos requeridos estén presentes
    if (!nombre || !parcela_id || !tipo || !temperatura_optima || !dias_cosecha || !mililitros_necesarios) {
        res.status(400).json({ message: "Faltan campos requeridos" });
        return;
    }

    // Validamos que el cultivo no exista ya en la base de datos
    const existingCultivo = await getOneCultivo(nombre);
    if (existingCultivo) {
        res.status(400).json({ message: "El cultivo ya existe" });
        return;
    }

    // Validamos que los campos numéricos sean números válidos
    if (isNaN(parcela_id) || isNaN(temperatura_optima) || isNaN(dias_cosecha) || isNaN(mililitros_necesarios)) {
        res.status(400).json({ message: "Los campos numéricos deben ser números válidos" });
        return;
    }

    // Validamos que los campos numéricos sean positivos
    if (parcela_id <= 0 || temperatura_optima <= 0 || dias_cosecha <= 0 || mililitros_necesarios <= 0) {
        res.status(400).json({ message: "Los campos numéricos deben ser positivos" });
        return;
    }

    // Intentamos crear el cultivo en la base de datos
    const created = await createCultivo(nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios);

    if (!created) {
        res.status(500).json({ message: "Error al crear el cultivo" });
        return;
    }

    res.status(201).json({message: "Cultivo creado"});
});

endpointsCultivos.delete("/:id", async (req, res) => {
    let id = req.params.id; // Leemos desde los parámetros de la URL

    // Validamos que el ID sea un número válido
    if (isNaN(id)) {
        res.status(400).json({ message: "El ID debe ser un número válido" });
        return;
    }

    // Chequear que el cultivo existe antes de intentar eliminarlo
    const cultivo = await getOneCultivo(id);
    if (!cultivo) {
        res.status(404).json({ message: "Cultivo no encontrado" });
        return;
    }

    // Intentamos eliminar el cultivo de la base de datos
    const deleted = await deleteCultivo(id);

    if (!deleted) {
        res.status(500).json({ message: "Error al eliminar el cultivo" });
        return;
    }

    res.status(200).json({ message: "Cultivo eliminado" });
});