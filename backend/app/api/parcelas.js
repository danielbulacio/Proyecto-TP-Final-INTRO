import {Router} from "express";
import{
    createParcela,
    getAllParcelas,
    getParcela,
    deleteParcela,
    updateParcela,
} from "../db/parcelas.js";

//hago global el endpointparcela
export const endpointsParcelas = Router();
//obtener todas las parcelas
endpointsParcelas.get("/", async (req, res) => {
  const parcelas = await getAllParcelas();
  res.json(parcelas);
});

//obtener parcela por id
endpointsParcelas.get("/:id", async (req, res) => {
  let id = req.params.id;

  const parcela = await getParcela(id);

  if (parcela === undefined) {
    res.sendStatus(404);
    return;
  }

  res.json(parcela);
});
//actualizacion de parcelas
 endpointsParcelas.put("/:id", async (req,res) => {
    let id = req.params.id;

    if(
      req.body.latitud === undefined || req.body.latitud != "number"||
      req.body.longitud === undefined || req.body.longitud != "number"
    ){
      res.status(400).send("Latitud o longitud inválidas o vacias")
    };

    const update = await updateParcela(
      id,
      req.body.nombre,
      req.body.latitud,
      req.body.longitud
    );

    if (!update) {
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
 });

 //actualizar campo especifico
 endpointsParcelas.patch("/:id", async (req,res) => {
    let id = req.params.id;

    if (req.body.latitud !== undefined && typeof req.body.latitud !== "number") {
    res.status(400).send("Latitud debe ser un número");
    return;
    }
  
    if (req.body.longitud !== undefined && typeof req.body.longitud !== "number") {
    res.status(400).send("Longitud debe ser un número");
    return;
    }
    let parcela = await getParcela(id);

    if (parcela === undefined){
      res.sendStatus(404);
      return;
    }

    const update = updateParcela(
      id,
      req.body.nombre || parcela.nombre,
      req.body.latitud !== undefined ? req.body.latitud : parcela.latitud,
      req.body.longitud !== undefined ? req.body.longitud : parcela.longitud
    )
    if(!update){
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
 });

//delete parcelas
 endpointsParcelas.delete("/:id", async (req,res) => {
  let id = req.params.id;
  
  const parcela = await getParcela(id);
  if(parcela === undefined){
    res.sendStatus(404);
    return;
  }
  
  const eliminado = await deleteParcela(id);
  if(!eliminado){
    res.sendStatus(500);
    return;
  }
  res.jason(parcela);
});

// create parcelas
 endpointsParcelas.post("/", async (req, res) => {
  // 1. Validamos que vengan latitud y longitud, y que sean números (pueden tener decimales)
  if (
    req.body.latitud === undefined || typeof req.body.latitud !== "number" ||
    req.body.longitud === undefined || typeof req.body.longitud !== "number"
  ) {
    res.status(400).send("Latitud o longitud inválidas o faltantes");
    return;
  }

  // 2. Llamamos a la función de la DB pasándole los campos reales de tu tabla
  const created = await createParcela(
    req.body.nombre,
    req.body.latitud,
    req.body.longitud
  );

  if (!created) {
    res.sendStatus(500);
    return;
  }

  // 3. Respondemos que se creó con éxito
  res.status(201).json({
    nombre: req.body.nombre,
    latitud: req.body.latitud,
    longitud: req.body.longitud
  });
});