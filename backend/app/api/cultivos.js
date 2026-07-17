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
    // Desestructuramos el body
    const { nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios } = req.body;

    // 1. Validamos ÚNICAMENTE los campos estrictamente requeridos
    if (!nombre || !parcela_id) {
        res.status(400).json({ message: "Faltan campos requeridos: nombre y parcela_id son obligatorios" });
        return;
    }

    // 2. Validamos que el cultivo no exista ya en la base de datos
    const existingCultivo = await getOneCultivo(nombre);
    if (existingCultivo) {
        res.status(400).json({ message: "El cultivo ya existe" });
        return;
    }

    // 3. Validamos parcela_id (ya que ahora sabemos con certeza que existe)
    if (isNaN(parcela_id) || parcela_id <= 0) {
        res.status(400).json({ message: "El campo parcela_id debe ser un número positivo válido" });
        return;
    }

    // 4. Validaciones condicionales: SOLO si se envían los campos opcionales
    // (Validamos que temperatura_optima, dias_cosecha y mililitros_necesarios sean números positivos si se proporcionan)
    if (temperatura_optima !== undefined) {
        if (isNaN(temperatura_optima) || temperatura_optima <= 0) {
            res.status(400).json({ message: "La temperatura óptima debe ser un número positivo" });
            return;
        }
    }

    if (dias_cosecha !== undefined) {
        if (isNaN(dias_cosecha) || dias_cosecha <= 0) {
            res.status(400).json({ message: "Los días de cosecha deben ser un número positivo" });
            return;
        }
    }

    if (mililitros_necesarios !== undefined) {
        if (isNaN(mililitros_necesarios) || mililitros_necesarios <= 0) {
            res.status(400).json({ message: "Los mililitros necesarios deben ser un número positivo" });
            return;
        }
    }

    // Intentamos crear el cultivo en la base de datos (pasando null o undefined en lo que no venga)
    const created = await createCultivo(
        nombre, 
        parcela_id, 
        tipo || null, 
        temperatura_optima !== undefined ? temperatura_optima : null, 
        dias_cosecha !== undefined ? dias_cosecha : null, 
        mililitros_necesarios !== undefined ? mililitros_necesarios : null
    );

    if (!created) {
        res.status(500).json({ message: "Error al crear el cultivo" });
        return;
    }

    res.status(201).json({ message: "Cultivo creado con éxito" });
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