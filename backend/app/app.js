import express from "express";
import { endpointsDetalleParcela } from "./api/detalle_parcela.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const port = 8000;

app.use("/api/v1/parcelas", endpointsDetalleParcela);
app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`todo ok`);
});
