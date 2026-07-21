const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function dibujarMapa(lat, long, nombre_parcela) {
  const map = L.map("map").setView([lat, long], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  L.marker([lat, long])
    .addTo(map)
    .bindPopup(`${nombre_parcela}: ${lat}, ${long}`)
    .openPopup();
}

let chart; // guardo la instancia del gráfico
let historialGlobal; // guardo los datos traídos
let tempOptima; // guardo la temperatura óptima del cultivo (para la línea del gráfico)

async function cargarHistorial() {
  const res = await fetch(
    `http://localhost:8000/api/v1/parcelas/detalle/${id}/historial`,
  );
  historialGlobal = await res.json();
  dibujarGrafico("temperatura"); // arranca mostrando temperatura
}

function dibujarGrafico(tipo) {
  const fechas = historialGlobal.map((fila) => {
    const [anio, mes, dia] = fila.fecha.split("T")[0].split("-");
    return `${dia}/${mes}`;
  });
  const valores = historialGlobal.map((fila) => Number(fila[tipo]));

  const canvas = document.getElementById("grafico-temp");

  if (chart) chart.destroy(); // 👈 destruyo el gráfico anterior

  const gradiente = canvas.getContext("2d").createLinearGradient(0, 0, 0, 300);
  gradiente.addColorStop(0, "rgba(136, 132, 216, 0.8)");
  gradiente.addColorStop(1, "rgba(136, 132, 216, 0)");

  // dataset principal (el dato real)
  const datasets = [
    {
      label: tipo,
      data: valores,
      fill: true,
      backgroundColor: gradiente,
      borderColor: "#8884d8",
      tension: 0.4,
      pointRadius: 3,
    },
  ];

  // si es temperatura, agrego la línea de la óptima del cultivo
  if (tipo === "temperatura" && tempOptima != null) {
    datasets.push({
      label: "Óptima del cultivo",
      data: fechas.map(() => tempOptima), // mismo valor en todas las fechas = línea horizontal
      borderColor: "#e03131",
      borderDash: [6, 6], // punteada
      pointRadius: 0, // sin puntos
      fill: false,
    });
  }

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: fechas,
      datasets: datasets,
    },
    options: {
      interaction: {
        mode: "index",
        intersect: false, // no hace falta que el mouse toque el punto exacto
      },
      plugins: {
        legend: { display: false },
        tooltip: { position: "nearest" }, // aparece cerca del cursor, no en el promedio
      },
      scales: {
        x: {
          ticks: {
            callback: function (v, i) {
              return i % 2 === 0 ? this.getLabelForValue(v) : "";
            },
          },
        },
      },
    },
  });
}

async function mostrarDatosActuales() {
  const res = await fetch(`http://localhost:8000/api/v1/parcelas/detalle/${id}`);
  const parcela = await res.json();
  tempOptima = parcela.temperatura_optima; // guardo el óptimo para la línea del gráfico
  dibujarMapa(
    Number(parcela.latitud),
    Number(parcela.longitud),
    parcela.nombre,
  );
  document.getElementById("parcela-nombre").textContent = parcela.nombre;

  document.getElementById("parcela_nombre_breadcumb").textContent =
    parcela.nombre;

  document.getElementById("temp").textContent = `${parcela.temperatura} °C`;
  document.getElementById("humedad").textContent = `${parcela.humedad_suelo} m3/m3`;
  document.getElementById("precipitacion").textContent = `${parcela.precipitacion} mm`;
  document.getElementById("evapo").textContent = `${parcela.evapotranspiracion} mm`;
  document.getElementById("parcela-ubicacion").textContent =
    `${parcela.latitud}, ${parcela.longitud}`;

  document.getElementById("cultivo-nombre").textContent = parcela.nombre_cultivo;
  document.getElementById("cultivo-tipo").textContent = parcela.tipo;
  document.getElementById("cultivo-temp").textContent = `${parcela.temperatura_optima}°`;
  document.getElementById("cultivo-agua").textContent = `${parcela.mililitros_necesarios} ml`;
}

document.querySelectorAll(".tab").forEach((boton) => {
  boton.addEventListener("click", () => {
    // saco "active" de todos y se lo pongo al clickeado (estilo visual)
    document
      .querySelectorAll(".tab")
      .forEach((b) => b.classList.remove("active"));
    boton.classList.add("active");

    // dibujo el gráfico con la métrica de ese botón
    dibujarGrafico(boton.dataset.metric);
  });
});

document.querySelectorAll(".tab").forEach((boton) => {
  boton.addEventListener("click", () => {
    // saco "active" de todos y se lo pongo al clickeado (estilo visual)
    document
      .querySelectorAll(".tab")
      .forEach((b) => b.classList.remove("active"));
    boton.classList.add("active");

    // dibujo el gráfico con la métrica de ese botón
    dibujarGrafico(boton.dataset.metric);
  });
});

async function mostrarScore() {
  const res = await fetch(`http://localhost:8000/api/v1/parcelas/detalle/${id}/score`);
  const score = await res.json();

  // los números
  document.getElementById("score-general").textContent = score.general;
  document.getElementById("score-temperatura").textContent = score.temperatura;
  document.getElementById("score-agua").textContent = score.agua;

  // el ancho de las barras de abajo
  document.getElementById("bar-general").style.width = `${score.general}%`;
  document.getElementById("bar-temperatura").style.width =
    `${score.temperatura}%`;
  document.getElementById("bar-agua").style.width = `${score.agua}%`;
  
  function colorPorScore(valor) {
    if (valor >= 66) return "#2f9e44"; // verde
    if (valor >= 33) return "#f59f00"; // amarillo
    return "#e03131"; // rojo
  }

  // seteamos el color de la barra dependiendo de que tan mal o tan bien este
  document.getElementById("bar-general").style.background = colorPorScore(
    score.general,
  );
  document.getElementById("bar-temperatura").style.background = colorPorScore(
    score.temperatura,
  );
  document.getElementById("bar-agua").style.background = colorPorScore(
    score.agua,
  );
  function estadoTexto(valor) {
  if (valor >= 80) return "Óptimo";
  if (valor >= 60) return "Bueno";
  if (valor >= 40) return "Regular";
  return "Crítico";
}

  // dentro de mostrarScore, después de los números:
  document.getElementById("estado-general").textContent = estadoTexto(score.general);
  document.getElementById("estado-temperatura").textContent = estadoTexto(score.temperatura);
  document.getElementById("estado-agua").textContent = estadoTexto(score.agua);
}


// seccion de popup de info

// obtiene el popup que aparece. Es decir la ubicacion donde va a a aparecer el popup 
const Info = document.getElementById("modal-info");

// obtemos el texto principal 
const infotexto = document.getElementById("modal-info-texto");

// obtemos el titulo
const modalInfoTitulo = document.getElementById("modal-info-titulo");

// obtemos la formula o lo que queremos poner en la formula 
const modalInfoFormula = document.getElementById("modal-info-formula");

// recorremos todos los botones de info y les decimos que tienen que hacer
document.querySelectorAll(".card-header[data-titulo]").forEach((btn) => {
  btn.addEventListener("click", () => {
    // basicamente poner la info que tienen en el popup
    modalInfoTitulo.textContent = btn.dataset.titulo;
    infotexto.innerHTML = btn.dataset.desc;
    modalInfoFormula.textContent = btn.dataset.formula || "";
    Info.classList.add("abierto"); // mostramos el popup
  });
});

// si tocan la x se cierra
document.getElementById("modal-info-close").addEventListener("click", () => {
  Info.classList.remove("abierto");
});

// si tocan afuera se cierrta tambien
Info.addEventListener("click", (e) => {
  if (e.target === Info) Info.classList.remove("abierto");
});

// fin de seccion de popup de info

async function init() {
  await mostrarDatosActuales(); // trae la parcela 
  await cargarHistorial(); // dibuja el grafico
  mostrarScore();
}

init();


