import express from "express";

const app = express();
app.use(express.json());

const port = 8000;

const url = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m';

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`todo ok`);
});
// 1. URL de la API
const url = 'https://open-meteo.com';

// 2. Crear una función asíncrona
async function obtenerClima() {
    try {
        // Esperar la respuesta de la petición HTTP
        const response = await fetch(url);

        // Esperar a que los datos se transformen en JSON
        const data = await response.json();

        // 3. Extraer los datos
        const temperatura = data.current.temperature_2m;
        const unidad = data.current_units.temperature_2m;

        // 4. Mostrar en pantalla
        document.getElementById('resultado').textContent = `${temperatura} ${unidad}`;
        
    } 
}

// 5. Ejecutar la función
obtenerClima();
