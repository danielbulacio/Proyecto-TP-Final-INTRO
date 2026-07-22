import { db } from "./pool.js";

// Trae todas las mediciones de una parcela, ordenadas por fecha. (es decir los datos de open meteo)
export async function getHistorialParcela(id) {
  const res = await db.query(
    `SELECT fecha, temperatura, precipitacion, humedad_suelo, evapotranspiracion
     FROM detalle_parcela WHERE parcela_id = $1 ORDER BY fecha`,
    [id],
  );
  return res.rows;
}

//Trae los datos de la parcela y los datos del cultivo
export async function getDatosParcela(id) {
  const res = await db.query(
    `SELECT
    p.id, p.nombre, p.latitud, p.longitud,
    d.temperatura, d.precipitacion, d.humedad_suelo, d.evapotranspiracion,
    c.nombre_cultivo, c.tipo, c.temperatura_optima, c.dias_de_cosecha, c.mililitros_necesarios
    FROM parcelas p
    LEFT JOIN detalle_parcela d ON d.parcela_id = p.id
    LEFT JOIN cultivos c        ON c.parcela_id = p.id
    WHERE p.id = $1
    ORDER BY d.fecha DESC
    LIMIT 1`,
    [id],
  );
  return res.rows[0]; // el[0] es porque query devuelve un array. Asi se facilita cuando la llamamos
  // osea permite esto:
  //   const parcela = await res.json();  recibe: { id: 1, ... }
  //   parcela.nombre  te habilita a hacer esto.
}


// Esta funcoin es la que pide los datos de la api del clima open meteo
export async function traerClima(lat, lng) {
  // variables para el fetch de open meteo
  const variables = "temperature_2m,precipitation,soil_moisture_0_to_1cm,evapotranspiration";
  
  // url 
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=${variables}&past_days=30&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  
  const data = await res.json();

  const horas = data.hourly.time;
  const registros = [];

  // guardamos correctamente los valores (todos cada hora de los ultimos 30 dias)
  for (let i = 0; i < horas.length; i++) {
    registros.push({
      fecha: horas[i].split("T")[0],
      temperatura: data.hourly.temperature_2m[i],
      precipitacion: data.hourly.precipitation[i],
      humedad_suelo: data.hourly.soil_moisture_0_to_1cm[i],
      evapotranspiracion: data.hourly.evapotranspiration[i],
    });

  }

  return registros;
}


// Esta funcion inserta los valores en la base de datos 
export async function guardarClima(parcelaId, registros) {
  
  // Borro lo que pueda llegar a estar atnes
  await db.query("DELETE FROM detalle_parcela WHERE parcela_id = $1", [parcelaId]);

  // For la cantidad de registros que hay los inserto uno por uno hasta que termino
  for (const r of registros) {
    await db.query(
      `INSERT INTO detalle_parcela
         (parcela_id, fecha, temperatura, precipitacion, humedad_suelo, evapotranspiracion)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [parcelaId, r.fecha, r.temperatura, r.precipitacion, r.humedad_suelo, r.evapotranspiracion]
    );
  }
}


// Esta funcion maneja llamar a las funcionies para traer los datos reales del clima. 
export async function actualizarClima(parcelaId) {
  const parcela = await getDatosParcela(parcelaId); // recibo datos de la parcela
  const registros = await traerClima(parcela.latitud, parcela.longitud); //recibo los datos del clima (de open meteo)
  await guardarClima(parcelaId, registros); // Llamo a esta funcion y los inserto en la base 
  
  return registros.length;
}


// Esta funcion calcula los scores
export async function calcularscores(parcelaId) {
  const parcela = await getDatosParcela(parcelaId);

  // El query suma la suma de precipitaciones, evapo y humedad.
  const res = await db.query(
    `SELECT SUM(precipitacion) AS lluvia,
            SUM(evapotranspiracion) AS evapo,
            AVG(humedad_suelo) AS humedad
     FROM detalle_parcela WHERE parcela_id = $1`,
    [parcelaId],
  );

  const lluvia = Number(res.rows[0].lluvia);
  const evapo = Number(res.rows[0].evapo);
  const humedad = Number(res.rows[0].humedad);

  // SCORE TEMPERATURA
  // Mido cuantos grados de diferencia hay con la temperatura ideal del cultivo.
  // Cada grado de diferencia resta 4 puntos. Nunca baja de 0.
  const diferenciaGrados = Math.abs(Number(parcela.temperatura) - parcela.temperatura_optima);
  let scoreTemperatura = 100 - diferenciaGrados * 4;
  if (scoreTemperatura < 0) scoreTemperatura = 0;

  // ESTADO HIDRICO
  // Parte 1: que porcentaje de lo que se evaporo lo repuso la lluvia.
  //   lluvia igual a evapo -> 100 (equilibrio perfecto)
  //   lluvia la mitad de evapo -> 50
  let scoreLluvia = 100;
  if (evapo > 0) {
    scoreLluvia = (lluvia / evapo) * 100;
    if (scoreLluvia > 100) scoreLluvia = 100;
  }

  // Consideramos la humedad del suelo
  let scoreHumedad = humedad * 100;
  if (scoreHumedad > 100) scoreHumedad = 100;

  // El score de agua es el promedio de las dos partes.
  const scoreAgua = (scoreLluvia + scoreHumedad) / 2;

  // SCORE GENERAL
  // Promedio entre temperatura y agua.
  const scoreGeneral = (scoreTemperatura + scoreAgua) / 2;

  return {
    general: Math.round(scoreGeneral),
    temperatura: Math.round(scoreTemperatura),
    agua: Math.round(scoreAgua),
  };
}
