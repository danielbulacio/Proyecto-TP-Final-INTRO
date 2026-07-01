import express from "express";
import cors from "cros";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(express.json());
app.use(cors());



app.listen(PORT, () => {
    console.log('Server is running on http:localhost:${port}');
});