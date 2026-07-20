import { Router } from "express";
import {
  getHistorialParcela,
  getDatosParcela,
  actualizarClima,
} from "../db/detalle-parcelas.js";

export const endpointsDetalleParcela = Router();

// GET /api/v1/parcelas/:id
endpointsDetalleParcela.get("/:id", async (req, res) => {
  const id = req.params.id;
  const parcela = await getDatosParcela(id);

  if (parcela === undefined) {
    res.sendStatus(404);
    return;
  }

  res.json(parcela);
});

// GET /api/v1/parcelas/:id/historial
endpointsDetalleParcela.get("/:id/historial", async (req, res) => {
  const id = req.params.id;
  const historial = await getHistorialParcela(id);
  res.json(historial);
});

// POST /api/v1/parcelas/:id/clima
endpointsDetalleParcela.post("/:id/clima", async (req, res) => {
  const cantidad = await actualizarClima(req.params.id);
  res.json({ mensaje: `Se guardaron ${cantidad} días de clima` });
});
