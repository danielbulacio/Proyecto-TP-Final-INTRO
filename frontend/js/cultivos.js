// COMPORTAMIENTO INTERACTIVO Y SOLICITUDES API (POSTGRESQL BASE)

      // Configuración de endpoints del backend REST API
      const API_CULTIVOS_URL = "http://localhost:8000/api/v1/cultivos";
      const API_PARCELAS_URL = "http://localhost:8000/api/v1/parcelas";

      /**
       * Trae el catálogo completo de parcelas para mapear los IDs con sus nombres.
       * @returns {Promise<Object>} Un mapa clave-valor {id_parcela: nombre}
       */
      async function getParcelasMap() {
        try {
          const response = await fetch(API_PARCELAS_URL);
          if (!response.ok) return {};
          
          const parcelas = await response.json();
          const mapa = {};
          parcelas.forEach(p => {
            mapa[p.id] = p.nombre; // Asume que la tabla parcelas tiene id y nombre
          });
          return mapa;
        } catch (err) {
          console.warn("No se pudo conectar al endpoint de parcelas para resolver nombres:", err);
          return {};
        }
      }

      /**
       * Trae todos los cultivos registrados en la base de datos de Postgres y renderiza las tarjetas correspondientes.
       */
      async function getAllCultivos() {
        const grid = document.getElementById("grid-cultivos");
        const errorDiv = document.getElementById("error");
        
        // Limpieza de estados anteriores
        errorDiv.classList.add("is-hidden");
        errorDiv.textContent = "";

        try {
          // Obtener datos simultáneamente
          const [parcelasMap, response] = await Promise.all([
            getParcelasMap(),
            fetch(API_CULTIVOS_URL)
          ]);

          if (!response.ok) {
            throw new Error(`Error de Servidor (${response.status}): ${response.statusText}`);
          }

          const cultivos = await response.json();
          grid.innerHTML = "";

          // Validación de tabla vacía
          if (cultivos.length === 0) {
            grid.innerHTML = `
              <div class="column is-12 has-text-centered py-6">
                <span class="material-icons has-text-grey-light" style="font-size: 64px;">eco</span>
                <p class="title is-4 has-text-grey mt-3">Base de datos de cultivos vacía</p>
                <p class="subtitle is-6">Agrega un nuevo cultivo desde el panel de control técnico.</p>
                <a class="button is-success mt-2" href="gestion_cultivos.html">Agregar Primer Cultivo</a>
              </div>
            `;
            return;
          }

          // Generación dinámica de la cuadrícula de cultivos
          cultivos.forEach(cultivo => {
            // Resolución del nombre de la parcela usando parcela_id
            const nombreParcela = parcelasMap[cultivo.parcela_id] || `Parcela (ID: ${cultivo.parcela_id})`;

            // Definición visual basada en el tipo de cultivo
            let badgeColor = "is-primary";
            let cardIcon = "eco";
            const tipoNormalizado = (cultivo.tipo || "").toLowerCase();

            if (tipoNormalizado.includes("cereal") || tipoNormalizado.includes("grano") || tipoNormalizado.includes("maiz")) {
              badgeColor = "is-warning";
              cardIcon = "grass";
            } else if (tipoNormalizado.includes("fruta") || tipoNormalizado.includes("frutilla") || tipoNormalizado.includes("manzana")) {
              badgeColor = "is-danger";
              cardIcon = "local_florist";
            } else if (tipoNormalizado.includes("tuberculo") || tipoNormalizado.includes("papa") || tipoNormalizado.includes("raiz")) {
              badgeColor = "is-link";
              cardIcon = "spa";
            }

            const cardCol = document.createElement("div");
            cardCol.className = "column is-12-mobile is-6-tablet is-4-desktop";

            cardCol.innerHTML = `
              <div class="card crop-card">
                <!-- Cabecera de la tarjeta con el Tipo SQL -->
                <header class="card-header has-background-light px-4 py-3 is-flex is-justify-content-between is-align-items-center" style="border-bottom: 1px solid #f0f0f0;">
                  <span class="tag ${badgeColor} is-light font-semibold is-capitalized">${cultivo.tipo || "General"}</span>
                  <span class="tag is-white border-light">ID: ${cultivo.id}</span>
                </header>

                <div class="card-content" style="flex-grow: 1;">
                  <div class="media is-align-items-center mb-3">
                    <div class="media-left">
                      <span class="material-icons has-text-success mr-2" style="font-size: 2.5rem;">${cardIcon}</span>
                    </div>
                    <div class="media-content">
                      <p class="title is-4 mb-1">${cultivo.nombre_cultivo}</p>
                      <p class="subtitle is-6 has-text-grey-dark mb-0">
                        Ubicación: <strong class="has-text-success">${nombreParcela}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <hr style="margin: 0.75rem 0; background-color: #f5f5f5;">
                  
                  <div class="content is-size-7">
                    <div class="columns is-mobile is-multiline">
                      <div class="column is-6 pb-1">
                        <span class="has-text-grey">Temp. Óptima</span><br>
                        <strong>${cultivo.temperatura_optima}°C</strong>
                      </div>
                      <div class="column is-6 pb-1">
                        <span class="has-text-grey">Días de Cosecha</span><br>
                        <strong>${cultivo.dias_de_cosecha} días</strong>
                      </div>
                      <div class="column is-12 pt-1">
                        <span class="has-text-grey">Volumen Hidrológico</span><br>
                        <strong>💧 ${cultivo.mililitros_necesarios} ml diarios</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Enlace al detalle específico del cultivo en otra página -->
                <footer class="card-footer" style="border-top: 1px solid #f0f0f0; background: #fafafa;">
                  <a href="cultivo.html?id=${cultivo.id}" class="card-footer-item has-text-success font-semibold py-3" style="font-size: 0.95rem;">
                    <span class="icon mr-1"><i class="material-icons">visibility</i></span>
                    Ver Ficha Técnica
                  </a>
                </footer>
              </div>
            `;

            grid.appendChild(cardCol);
          });

        } catch (err) {
          console.error("Error al renderizar los cultivos desde PostgreSQL:", err);
          errorDiv.classList.remove("is-hidden");
          errorDiv.textContent = `No se pudo conectar con el servidor de Base de Datos. Detalles: ${err.message}`;
          
          grid.innerHTML = `
            <div class="column is-12 has-text-centered py-6">
              <span class="material-icons has-text-danger" style="font-size: 48px;">cloud_off</span>
              <p class="title is-5 has-text-danger mt-2">Error de Conexión</p>
              <p class="subtitle is-6 text-muted">Asegúrate de que la API de Node/FastAPI en el puerto 8000 esté corriendo.</p>
            </div>
          `;
        }
      }

      /**
       * Alterna el menú responsive de Bulma (Hamburguesa) en entornos de pantallas reducidas o móviles.
       */
      function toggleNavbar() {
        const burger = document.querySelector(".navbar-burger");
        const menu = document.getElementById("navbarMain");
        if (burger && menu) {
          burger.classList.toggle("is-active");
          menu.classList.toggle("is-active");
        }
      }

      // Inicialización asíncrona de la página al cargarse por completo
      window.onload = function() {
        getAllCultivos();
      };