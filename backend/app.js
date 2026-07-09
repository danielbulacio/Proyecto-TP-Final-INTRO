import express from "express";

//importo ruta de parcelas endpoints
import{ endpointsParcelas } from ".app/api/parcelas.js";

const app = express();
const PORT = 8000;

app.use(express.json());

app.use("/parcelas", endpointsParcelas);


