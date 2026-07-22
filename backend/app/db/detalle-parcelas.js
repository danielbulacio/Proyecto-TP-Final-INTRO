import { db } from "./pool.js";

// Trae todas las mediciones de una parcela, ordenadas por fecha. (es temporal)
export async function getHistorialParcela(id) {
  const res = await db.query(
    `SELECT fecha, temperatura, precipitacion, humedad_suelo, evapotranspiracion
     FROM detalle_parcela WHERE parcela_id = $1 ORDER BY fecha`,
    [id],
  );
  return res.rows;
}
//Trae los datos de clima actuales
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
  return res.rows[0];
}
export async function traerClima(lat, lng) {
  const variables = "temperature_2m,precipitation,soil_moisture_0_to_1cm,evapotranspiration";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=${variables}&past_days=30&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const horas = data.hourly.time;
  const registros = [];

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

export async function guardarClima(parcelaId, registros) {
  // Borro el clima viejo 
  await db.query("DELETE FROM detalle_parcela WHERE parcela_id = $1", [parcelaId]);

  // Inserto los registros nuevos, uno por día
  for (const r of registros) {
    await db.query(
      `INSERT INTO detalle_parcela
         (parcela_id, fecha, temperatura, precipitacion, humedad_suelo, evapotranspiracion)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [parcelaId, r.fecha, r.temperatura, r.precipitacion, r.humedad_suelo, r.evapotranspiracion]
    );
  }
}
export async function actualizarClima(parcelaId) {
  const parcela = await getDatosParcela(parcelaId);// recibo datos de la parcela
  const registros = await traerClima(parcela.latitud, parcela.longitud); //recibo los datos del clima (de open meteo)
  
  await guardarClima(parcelaId, registros); // Llamo a esta funcion y los inserto en la base 
  return registros.length;
}

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

  const lluvia = Number(res.rows[0].lluvia); // esto que es
  const evapo = Number(res.rows[0].evapo);
  const humedad = Number(res.rows[0].humedad);

  // FACTOR 1 — Temperatura: qué tan cerca de la óptima del cultivo
  const difTemp = Math.abs(Number(parcela.temperatura) - parcela.temperatura_optima);
  const scoreTemp = Math.max(0, 100 - difTemp * 5);

  // FACTOR 2 — Agua: balance hídrico (lluvia − evapo) + humedad del suelo
  const balance = lluvia - evapo;
  const scoreBalance = Math.min(100, Math.max(0, (balance / parcela.mililitros_necesarios) * 100));
  const scoreHumedad = Math.min(100, humedad * 100);   // humedad 0-1 → 0-100
  const scoreAgua = (scoreBalance + scoreHumedad) / 2;

  // GENERAL: engloba los dos
  const general = (scoreTemp + scoreAgua) / 2;

  return {
    general: Math.round(general),
    temperatura: Math.round(scoreTemp),
    agua: Math.round(scoreAgua),
  };
}
