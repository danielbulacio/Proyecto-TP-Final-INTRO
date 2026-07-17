import express from "express";
import cors from "cors";

import { endpointsCultivos } from "./api/cultivos.js";


const app = express();

const corsOptions = {
  origin: '*', // Replace with your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(express.json());

app.use(cors(corsOptions));

app.use("/api/v1/cultivos", endpointsCultivos);

const port = 8000;

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`todo ok`);
});
