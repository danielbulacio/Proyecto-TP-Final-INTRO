import express from "express";
import cors from "cors";
import { endpointsParcelas } from "./api/parcelas.js";
import { endpointsCultivos } from "./api/cultivos.js";
import { endpointsTareas } from "./api/tareas.js";
import { endpointsDetalleParcela } from "./api/detalle_parcela.js";

const app = express();

const corsOptions = {
  origin: '*', // Replace with your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(express.json());

app.use(cors(corsOptions));

app.use("/api/v1/cultivos", endpointsCultivos);
app.use("/api/v1/parcelas", endpointsParcelas);
app.use("/api/v1/tareas", endpointsTareas);

const port = 8000;

app.use("/api/v1/parcelas", endpointsDetalleParcela);
app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`todo ok`);
});
