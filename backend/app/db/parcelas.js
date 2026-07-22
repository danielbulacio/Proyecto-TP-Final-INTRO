import {db} from "./pool.js";


export async function getAllParcelas() {

    const res = await db.query(
        "SELECT id,nombre,latitud,longitud,hectareas,imagen FROM parcelas"
    );
    return res.rows;
}

export async function getParcela(id) {

    const res = await db.query(
        "SELECT id, nombre, latitud, longitud, hectareas, imagen FROM parcelas WHERE id = $1",
        [id]
    );
    return res.rows[0];
}

export async function updateParcela(id, nombre, latitud, longitud, hectareas, imagen) {
  
    const res = await db.query(

        "UPDATE parcelas SET nombre=$1, latitud=$2, longitud=$3, hectareas=$4, imagen=$5 WHERE id = $6", [nombre, latitud, longitud, hectareas, imagen, id]
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
export async function createParcela(nombre, latitud, longitud , hectareas, imagen) {

    const res = await db.query(
        "INSERT INTO parcelas(nombre, latitud, longitud, hectareas, imagen) VALUES ($1, $2, $3, $4, $5)",
        [nombre, latitud, longitud, hectareas, imagen]
    );
    return res.rowCount == 1;
}