import express from "express";
import cors from "cors";
import { endpointsParcelas } from "./api/parcelas.js";

const app = express();

app.use(cors());
app.use(express.json());

const port = 8000;

app.use("/api/parcelas", endpointsParcelas);

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`todo ok`);
});
