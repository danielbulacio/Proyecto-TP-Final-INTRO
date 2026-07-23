import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createParcela,
  getAllParcelas,
  getParcela,
  deleteParcela,
  updateParcela,
} from "../db/parcelas.js";

// Hago global el endpointparcela
export const endpointsParcelas = Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // La carpeta que creamos antes
  },
  filename: function (req, file, cb) {
    // Le agregamos la fecha al nombre para que no se sobreescriban fotos con el mismo nombre
    cb(null, Date.now() + path.extname(file.originalname)) 
  }
});

const upload = multer({ storage: storage });
// =======================================================


// obtener todas las parcelas
endpointsParcelas.get("/", async (req, res) => {
  const parcelas = await getAllParcelas();
  res.json(parcelas);
});

// obtener parcela por id
endpointsParcelas.get("/:id", async (req, res) => {
  let id = req.params.id;

  const parcela = await getParcela(id);

  if (parcela === undefined) {
    res.sendStatus(404);
    return;
  }

  res.json(parcela);
});

endpointsParcelas.put("/:id", upload.single('imagen'), async (req, res) => {
  let id = req.params.id;

  // 1. Al usar FormData, los números llegan como string. Convertimos con parseFloat:
  const latitudNum = parseFloat(req.body.latitud);
  const longitudNum = parseFloat(req.body.longitud);
  const hectareasNum = req.body.hectareas ? parseFloat(req.body.hectareas) : null;

  // Validamos que la conversión haya generado números válidos
  if (isNaN(latitudNum) || isNaN(longitudNum)) {
    res.status(400).send("Latitud o longitud inválidas o vacías");
    return; 
  }

  // 2. Buscamos la parcela actual en la DB
  const parcelaActual = await getParcela(id);
  if (!parcelaActual) {
    res.sendStatus(404);
    return;
  }

  // 3. Si se subió un nuevo archivo usamos req.file.filename, si no, conservamos la imagen actual
  const nombreImagen = req.file ? req.file.filename : parcelaActual.imagen;

  // 4. Actualizamos en la base de datos
  const update = await updateParcela(
    id,
    req.body.nombre,
    latitudNum,
    longitudNum,
    hectareasNum,
    nombreImagen
  );

  if (!update) {
    res.sendStatus(500);
    return;
  }
    
  res.sendStatus(200);
});


// delete parcelas
endpointsParcelas.delete("/:id", async (req,res) => {
  let id = req.params.id;
  // Primero verificamos si la parcela existe
  const parcela = await getParcela(id);
  if(parcela === undefined){
    res.sendStatus(404);
    return;
  }
  // Llamamos a la función deleteParcela para eliminar la parcela de la base de datos
  const eliminado = await deleteParcela(id);
  if(!eliminado){
    res.sendStatus(500);
    return;
  }
  res.json(parcela);
});

// create parcelas
endpointsParcelas.post("/", upload.single('imagen'), async (req, res) => {
  // 1. Al usar FormData, los números llegan como texto. Los convertimos con parseFloat.
  const latitudNum = parseFloat(req.body.latitud);
  const longitudNum = parseFloat(req.body.longitud);
  const hectareasNum = req.body.hectareas ? parseFloat(req.body.hectareas) : null;

  // Validamos que existan y que sean números válidos (si no se pueden convertir, isNaN da true)
  if (isNaN(latitudNum) || isNaN(longitudNum)) {
    res.status(400).send("Latitud o longitud inválidas o faltantes");
    return;
  }

  // 2. Extraemos el nombre del archivo de la imagen (si el usuario subió una)
  const nombreImagen = req.file ? req.file.filename : null;

  // 3. Llamamos a la función de la DB pasándole los datos convertidos y el nombre del archivo
  const created = await createParcela(
    req.body.nombre,
    latitudNum,
    longitudNum,
    hectareasNum,
    nombreImagen // Usamos req.file en lugar de req.body.imagen
  );

  if (!created) {
    res.sendStatus(500);
    return;
  }

  // 4. Respondemos que se creó con éxito
  res.status(201).json({
    id: created,
    nombre: req.body.nombre,
    latitud: latitudNum,
    longitud: longitudNum,
    hectareas: hectareasNum,
    imagen: nombreImagen
  });
});