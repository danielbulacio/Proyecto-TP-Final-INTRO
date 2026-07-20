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

async function dibujarGrafico() {
  const res = await fetch(
    `http://localhost:8000/api/v1/parcelas/${id}/historial`,
  );
  const historial = await res.json();
  const fechas = historial.map((fila) => {
    const [anio, mes, dia] = fila.fecha.split("T")[0].split("-");
    return `${dia}/${mes}`;
  });
  const temperaturas = historial.map((fila) => Number(fila.temperatura));

  const canvas = document.getElementById("grafico-temp");

  const gradiente = canvas.getContext("2d").createLinearGradient(0, 0, 0, 300);
  gradiente.addColorStop(0, "rgba(136, 132, 216, 0.8)");
  gradiente.addColorStop(1, "rgba(136, 132, 216, 0)");

  new Chart(canvas, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [
        {
          label: "Temperatura (°C)",
          data: temperaturas,
          fill: true,
          backgroundColor: gradiente,
          borderColor: "#8884d8",
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: {
            callback: function (value, index) {
              // muestra la fecha solo en los índices pares (cada 2 días)
              return index % 2 === 0 ? this.getLabelForValue(value) : "";
            },
          },
        },
      },
    },
  });
}


async function mostrarDatosActuales() {
  const res = await fetch(`http://localhost:8000/api/v1/parcelas/${id}`);
  const parcela = await res.json();
  dibujarMapa(
    Number(parcela.latitud),
    Number(parcela.longitud),
    parcela.nombre,
  );
  document.getElementById("parcela-nombre").textContent = parcela.nombre;

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
