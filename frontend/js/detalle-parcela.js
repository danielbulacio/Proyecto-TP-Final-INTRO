

async function mostrarDatosActuales() {
  const res = await fetch("http://localhost:8000/api/v1/parcelas/1");
  const parcela = await res.json();

  document.getElementById("parcela_nombre_breadcumb").textContent =
    parcela.nombre;
  document.getElementById("temp").textContent = parcela.temperatura;
  document.getElementById("humedad").textContent = parcela.humedad_suelo;
  document.getElementById("precipitacion").textContent = parcela.precipitacion;
  document.getElementById("evapo").textContent = parcela.evapotranspiracion;
  document.getElementById("parcela-ubicacion").textContent =
    `${parcela.latitud}, ${parcela.longitud}`;
}

mostrarDatosActuales();

dibujarGrafico();
