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
export async function createCultivo(nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios) {
  const res = await db.query(
    "INSERT INTO cultivos (nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios) VALUES ($1, $2, $3, $4, $5, $6)",
    [nombre, parcela_id, tipo, temperatura_optima, dias_cosecha, mililitros_necesarios],
  );

  return res.rowCount == 1;
}

// Eliminar un cultivo por su ID
export async function deleteCultivo(id) {
  const res = await db.query("DELETE FROM cultivos WHERE id = ($1)", [id]);
  return res.rowCount == 1;
}