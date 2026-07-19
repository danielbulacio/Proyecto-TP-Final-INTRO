import {db} from "./pool.js";


export async function getAllParcelas() {

    const res = await db.query(
        "SELECT id,nombre,latitud,longitud FROM parcelas"

    return res.rows;
}

export async function getParcela(id) {

    const res = await db.query(
        "SELECT id, nombre, latitud, longitud FROM parcelas WHERE id = $1",
        [id]
    );
    return res.rows[0];
}

export async function updateParcela(id, nombre, latitud, longitud) {
  
    const res = await db.query(

        "UPDATE parcelas SET nombre=$1, latitud=$2, longitud=$3 WHERE id = $4", [nombre, latitud, longitud, id]
    );
    return res.rowCount == 1;
}

export async function deleteParcela(id) {
    
    await db.query("DELETE FROM detalle_parcela WHERE parcela_id = $1;", [id]);
    await db.query("DELETE FROM cultivos WHERE parcela_id = $1", [id]);
    await db.query("DELETE FROM tareas WHERE parcela_id = $1", [id]);

    const res = await db.query(
        "DELETE FROM parcelas WHERE id = $1",[id]);
    return res.rowCount == 1;
}
export async function createParcela(nombre, latitud, longitud){

    const res = await db.query(
        "INSERT INTO parcelas(nombre, latitud, longitud) VALUES ($1, $2, $3)",
        [nombre, latitud, longitud]
    );
    return res.rowCount == 1;
}