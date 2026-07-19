import { db } from "./pool.js";

// Trae todas las mediciones de una parcela, ordenadas por fecha. (es temporal)
export async function getHistorialParcela(id) {
  const res = await db.query(
    "SELECT fecha, temperatura FROM detalle_parcela WHERE parcela_id = $1 ORDER BY fecha",
    [id],
  );
  return res.rows;
}

//Trae los datos de clima actuales
export async function getDatosParcela(id) {
  const res = await db.query(
    `SELECT
       p.id, p.nombre, p.latitud, p.longitud,
       d.temperatura, d.precipitacion, d.humedad_suelo, d.evapotranspiracion
     FROM parcelas p
     LEFT JOIN detalle_parcela d ON d.parcela_id = p.id
     WHERE p.id = $1
     ORDER BY d.fecha DESC
     LIMIT 1`,
    [id],
  );
  return res.rows[0];
}
