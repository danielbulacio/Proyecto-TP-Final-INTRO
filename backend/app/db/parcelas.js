import {db} from "./pool.js";


export async function getAllParcelas() {
    // Añadido 'id' a la consulta
    const res = await db.query(
        "SELECT id, nombre, latitud, longitud FROM parcelas"
    );
    return res.rows;
}

export async function getParcela(id) {
    // Añadido 'id' a la consulta por consistencia
    const res = await db.query(
        "SELECT id, nombre, latitud, longitud FROM parcelas WHERE id = $1",
        [id]
    );
    return res.rows[0];
}

export async function updateParcela(id, nombre, latitud, longitud) {
    // Faltaba el WHERE
    const res = await db.query(
        "UPDATE parcelas SET nombre=$1, latitud=$2, longitud=$3 WHERE id=$4", 
        [nombre, latitud, longitud, id]
    );
    return res.rowCount == 1;
}

export async function deleteParcela(id) {
    const res = await db.query(
        "DELETE FROM parcelas WHERE id = $1",[id]);
    return res.rowCount == 1;
}

export async function createParcela(nombre, latitud, longitud){
    // Decía 'nombres' (con S) en lugar de 'nombre' como está en schema.sql
    const res = await db.query(
        "INSERT INTO parcelas(nombre, latitud, longitud) VALUES ($1, $2, $3)",
        [nombre, latitud, longitud]
    );
    return res.rowCount == 1;
}