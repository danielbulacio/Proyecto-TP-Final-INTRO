import { db } from "./pool.js";

// Obtener todos los cultivos del catálogo
export async function getAllCultivos() {
  const res = await db.query("SELECT * FROM cultivos");
  return res.rows;
}

// Obtener un solo cultivo por su ID
export async function getOneCultivo(id) {
  const res = await db.query("SELECT * FROM cultivos WHERE id = $1", [id]);
  return res.rows[0]; // Retorna el cultivo o undefined si no existe
}

// Crear un nuevo cultivo en la base de datos
export async function createCultivo(nombre, variedad, temperatura_optima, temperatura_maxima, dias_cosecha, mililitros_requeridos) {
  const res = await db.query(
    "INSERT INTO cultivos (nombre, variedad, temperatura_optima, temperatura_maxima, dias_cosecha, mililitros_requeridos) VALUES ($1, $2, $3, $4, $5, $6)",
    [nombre, variedad, temperatura_optima, temperatura_maxima, dias_cosecha, mililitros_requeridos],
  );

  return res.rowCount == 1;
}

// Eliminar un cultivo por su ID
export async function deleteCultivo(id) {
  const res = await db.query("DELETE FROM cultivos WHERE id = ($1)", [id]);
  return res.rowCount == 1;
}