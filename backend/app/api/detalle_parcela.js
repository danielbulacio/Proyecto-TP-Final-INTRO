import { Router } from "express";
import {
  getHistorialParcela,
  getDatosParcela,
  actualizarClima,
  calcularscores,
} from "../db/detalle-parcelas.js";

export const endpointsDetalleParcela = Router();

// GET /api/v1/parcelas/:id
endpointsDetalleParcela.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const parcela = await getDatosParcela(id);

    // Si no existe la parcela, aviso con un 404
    if (parcela === undefined) {
      res.status(404).json({ error: "No se encontro la parcela" });
      return;
    }

    res.json(parcela);
  } catch (error) {
    // Si algo falla (por ejemplo la base de datos) devuelvo un 500
    console.error("Error al traer la parcela:", error);
    res.status(500).json({ error: "Error al traer los datos de la parcela" });
  }
});

// GET /api/v1/parcelas/:id/historial
endpointsDetalleParcela.get("/:id/historial", async (req, res) => {
  try {
    const id = req.params.id;
    const historial = await getHistorialParcela(id);
    res.json(historial);
  } catch (error) {
    console.error("Error al traer el historial:", error);
    res.status(500).json({ error: "Error al traer el historial de clima" });
  }
});

// POST /api/v1/parcelas/:id/clima
endpointsDetalleParcela.post("/:id/clima", async (req, res) => {
  try {
    const id = req.params.id;
    const cantidad = await actualizarClima(id);
    res.json({ mensaje: `Se guardaron ${cantidad} días de clima` });
  } catch (error) {
    // En el caso de que se haya caido open meteo. Atrapamos el error
    console.error("Error al actualizar el clima:", error);
    res.status(500).json({ error: "Error al actualizar el clima" });
  }
});

// GET /api/v1/parcelas/:id/score
endpointsDetalleParcela.get("/:id/score", async (req, res) => {
  try {
    const id = req.params.id;
    const score = await calcularscores(id);
    res.json(score);
  } catch (error) {
    console.error("Error al calcular el score:", error);
    res.status(500).json({ error: "Error al calcular el score" });
  }
});
