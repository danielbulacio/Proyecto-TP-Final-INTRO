import express from "express";

const app = express();
app.use(express.json());

const port = 8000;

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`todo ok`);
});
