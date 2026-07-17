import express from "express";
import cors from "cros";
import dotenv from "dotenv";

//importo ruta de parcelas endpoints
import{ endpointsParcelas } from ".app/api/parcelas.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/parcelas", endpointsParcelas);

app.use(cors());

app.listen(PORT, () => {
    console.log('Server is running on http:localhost:${port}');
});
