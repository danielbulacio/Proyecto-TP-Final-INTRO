const ctx = document.getElementById("grafico-temp");

      new Chart(ctx, {
        type: "line", // tipo de gráfico: línea
        data: {
          labels: ["10 jun", "11 jun", "12 jun", "13 jun", "14 jun"], // eje X
          datasets: [
            {
              label: "Temperatura (°C)",
              data: [18.5, 20.1, 19.8, 22.3, 21.0], // eje Y (los mock)
            },
          ],
        },
});
