// Configuración de endpoints del backend REST API de PostgreSQL
const API_CULTIVOS_URL = "http://localhost:8000/api/v1/cultivos";
const API_PARCELAS_URL = "http://localhost:8000/api/v1/parcelas";

// Variables globales para mapeo de parcelas
let parcelasCache = {};

/**
 * Carga todas las parcelas desde el backend y popula el selector del formulario
 */
async function loadParcelas() {
  const select = document.getElementById("parcela_id");
  
  try {
    const response = await fetch(API_PARCELAS_URL);
    if (!response.ok) {
      throw new Error("No se pudo obtener el listado de parcelas para mapear la base de datos.");
    }
    
    const parcelas = await response.json();
    select.innerHTML = `<option value="">-- Selecciona una Parcela --</option>`;
    
    parcelas.forEach(parcela => {

      console.log("Revisando parcela de la API -> ID:", parcela.id, "Nombre:", parcela.nombre);

      // Guardar en caché para resolución inmediata de nombres en tabla
      parcelasCache[parcela.id] = parcela.nombre || `Parcela (ID: ${parcela.id})`;
      
      // Añadir opción al dropdown
      const option = document.createElement("option");
      option.value = parcela.id;
      option.textContent = parcela.nombre || `Parcela ${parcela.id}`;
      select.appendChild(option);
    });

    return true;
    
  } catch (err) {
    showNotification("error", `Error de Conexión de Parcelas: ${err.message}`);
    select.innerHTML = `<option value="">Error al cargar parcelas</option>`;
    return false;
  }
}

/**
 * Carga todos los cultivos de la base de datos Postgres y dibuja la tabla
 */
async function getAllCultivos() {
  const tbody = document.getElementById("table-cultivos");
  const totalBadge = document.getElementById("total-registros");
  
  try {
    const response = await fetch(API_CULTIVOS_URL);
    if (!response.ok) {
      throw new Error(`Error de Servidor (${response.status}): ${response.statusText}`);
    }
    
    const cultivos = await response.json();
    tbody.innerHTML = "";
    totalBadge.textContent = `${cultivos.length} Cultivos registrados`;

    if (cultivos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="has-text-centered py-5 has-text-grey">
            <span class="material-icons" style="font-size: 32px; vertical-align: middle;">eco</span>
            No se encontraron cultivos registrados en la base de datos PostgreSQL.
          </td>
        </tr>
      `;
      return;
    }

    cultivos.forEach(cultivo => {
      const tr = document.createElement("tr");

      // Resolución del nombre de parcela
      const nombreParcela = parcelasCache[cultivo.parcela_id] || `ID: ${cultivo.parcela_id}`;

      tr.innerHTML = `
        <th>${cultivo.id}</th>
        <td><strong>${escapeHTML(cultivo.nombre_cultivo)}</strong></td>
        <td><span class="tag is-success is-light font-semibold">${escapeHTML(nombreParcela)}</span></td>
        <td><span class="tag is-white border-light capitalize">${escapeHTML(cultivo.tipo || "N/A")}</span></td>
        <td>${cultivo.temperatura_optima !== null ? cultivo.temperatura_optima + ' °C' : '—'}</td>
        <td>${cultivo.dias_de_cosecha !== null ? cultivo.dias_de_cosecha + ' días' : '—'}</td>
        <td>${cultivo.mililitros_necesarios !== null ? cultivo.mililitros_necesarios + ' ml' : '—'}</td>
        <td class="has-text-right">
          <div class="buttons is-right">
            <button class="button is-small is-info is-light" onclick="editCultivo(${JSON.stringify(cultivo).replace(/"/g, '&quot;')})" title="Editar cultivo">
              <span class="icon"><i class="material-icons" style="font-size: 16px;">edit</i></span>
            </button>
            <button class="button is-small is-danger is-light" onclick="deleteCultivo(${cultivo.id})" title="Borrar cultivo">
              <span class="icon"><i class="material-icons" style="font-size: 16px;">delete</i></span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="has-text-centered py-5 has-text-danger">
          <span class="material-icons mr-1" style="vertical-align: middle;">cloud_off</span>
          Error al conectar con la base de datos de cultivos en el puerto 8000.
        </td>
      </tr>
    `;
    totalBadge.textContent = "Error de Conexión";
    showNotification("error", `Error de Conexión: No se pudo enlazar al backend. (${err.message})`);
  }
}

/**
 * Guarda un cultivo (Crea si id está vacío, actualiza si hay id presente)
 */
async function saveCultivo(event) {
  event.preventDefault();
  hideNotifications();

  const id = document.getElementById("cultivo-id").value;
  const nombre_cultivo = document.getElementById("nombre_cultivo").value.trim();
  const parcela_id = parseInt(document.getElementById("parcela_id").value);
  const tipo = document.getElementById("tipo").value.trim();
  const temperatura_optima = document.getElementById("temperatura_optima").value;
  const dias_de_cosecha = document.getElementById("dias_de_cosecha").value;
  const mililitros_necesarios = document.getElementById("mililitros_necesarios").value;

  // Agrega esto temporalmente para espiar los valores:
  console.log("Nombre:", nombre_cultivo, " | Parcela ID:", parcela_id);

  if (!nombre_cultivo || isNaN(parcela_id)) {
    showNotification("error", "Los campos Nombre y Parcela son obligatorios.");
    return;
  }

  // Construcción del objeto de payload
  const payload = {
    nombre_cultivo: nombre_cultivo,
    parcela_id: parcela_id,
    tipo: tipo || null,
    temperatura_optima: temperatura_optima ? parseInt(temperatura_optima) : null,
    dias_de_cosecha: dias_de_cosecha ? parseInt(dias_de_cosecha) : null,
    mililitros_necesarios: mililitros_necesarios ? parseInt(mililitros_necesarios) : null
  };

  const isEditing = id !== "";
  const url = isEditing ? `${API_CULTIVOS_URL}/${id}` : API_CULTIVOS_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Servidor denegó la operación (${response.status}): ${response.statusText}`);
    }

    showNotification("success", isEditing ? "Cultivo actualizado exitosamente." : "Cultivo registrado exitosamente.");
    resetForm();
    await getAllCultivos();

  } catch (err) {
    showNotification("error", `Error al guardar registro en la base de datos: ${err.message}`);
  }
}

/**
 * Elimina un cultivo específico por su ID
 */
async function deleteCultivo(id) {
  hideNotifications();
  
  // Simulación limpia de confirmación nativa integrada
  if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el cultivo con ID ${id}?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_CULTIVOS_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`El servidor rechazó la solicitud de borrado (${response.status})`);
    }

    showNotification("success", `El cultivo ID: ${id} fue borrado correctamente.`);
    await getAllCultivos();

  } catch (err) {
    showNotification("error", `Error de borrado: ${err.message}`);
  }
}

/**
 * Carga un cultivo seleccionado en el formulario para proceder con la edición
 */
async function editCultivo(cultivo) {
  hideNotifications();
  
  // Asegurarnos de que las opciones del select existan antes de asignar el valor
  const select = document.getElementById("parcela_id");
  if (select.options.length <= 1) { 
  // Si solo está la opción por defecto, volvemos a cargar las parcelas y esperamos
    await loadParcelas(); 
  }

  document.getElementById("cultivo-id").value = cultivo.id;
  document.getElementById("nombre_cultivo").value = cultivo.nombre_cultivo || "";
  select.value = cultivo.parcela_id ? String(cultivo.parcela_id) : "";
  document.getElementById("tipo").value = cultivo.tipo || "";
  document.getElementById("temperatura_optima").value = cultivo.temperatura_optima !== null ? cultivo.temperatura_optima : "";
  document.getElementById("dias_de_cosecha").value = cultivo.dias_de_cosecha !== null ? cultivo.dias_de_cosecha : "";
  document.getElementById("mililitros_necesarios").value = cultivo.mililitros_necesarios !== null ? cultivo.mililitros_necesarios : "";

  // Cambios estéticos para indicar que se está en modo edición
  document.getElementById("form-header").classList.remove("has-background-light");
  document.getElementById("form-header").style.backgroundColor = "#e8f4fd";
  
  document.getElementById("form-title").innerHTML = `
    <span class="icon mr-2 has-text-info"><i class="material-icons">edit</i></span>
    <span>Editar Cultivo ID: ${cultivo.id}</span>
  `;
  
  document.getElementById("btn-submit").className = "button is-info is-fullwidth";
  document.getElementById("text-submit").textContent = "Guardar Cambios";
  document.getElementById("control-cancelar").classList.remove("is-hidden");
}

/**
 * Restablece el formulario a su estado de inserción por defecto
 */
function resetForm() {
  document.getElementById("form-cultivo").reset();
  document.getElementById("cultivo-id").value = "";

  // Restablecer estilos estéticos del contenedor
  document.getElementById("form-header").style.backgroundColor = "";
  document.getElementById("form-header").classList.add("has-background-light");
  
  document.getElementById("form-title").innerHTML = `
    <span class="icon mr-2 has-text-success"><i class="material-icons">add_box</i></span>
    <span>Registrar Cultivo</span>
  `;
  
  document.getElementById("btn-submit").className = "button is-success is-fullwidth";
  document.getElementById("text-submit").textContent = "Registrar Cultivo";
  document.getElementById("control-cancelar").classList.add("is-hidden");
}

/**
 * Auxiliares visuales para alertas rápidas
 */
function showNotification(type, message) {
  const target = document.getElementById(type);
  if (target) {
    target.textContent = message;
    target.classList.remove("is-hidden");
  }
}

function hideNotifications() {
  document.getElementById("error").classList.add("is-hidden");
  document.getElementById("success").classList.add("is-hidden");
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toggleNavbar() {
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById("navbarMain");
  if (burger && menu) {
    burger.classList.toggle("is-active");
    menu.classList.toggle("is-active");
  }
}


// Lanzador de eventos asíncronos al inicio
window.onload = async function() {
  // 1. Cargar primero las parcelas para poder mapear sus IDs a nombres
  await loadParcelas();
  
  // 2. Cargar cultivos de la tabla Postgres
  await getAllCultivos();

  // 3. CAPTURAR EL ID DE LA URL SI EXISTE
  const urlParams = new URLSearchParams(window.location.search);
  const cultivoId = urlParams.get('id');

  if (cultivoId) {
    try {
      // Hacer un fetch directo a la API para traer solo ese cultivo
      const response = await fetch(`${API_CULTIVOS_URL}/${cultivoId}`);
      
      if (response.ok) {
        const cultivo = await response.json();
        
        // Reutilizamos tu función existente para cargar el formulario
        await editCultivo(cultivo); 
        
        // Hacer scroll suave hasta el formulario para mejor experiencia visual
        document.getElementById("form-cultivo").scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error("No se pudo obtener el cultivo con ID:", cultivoId);
      }
    } catch (err) {
      console.error("Error al cargar el cultivo desde la URL:", err);
    }
  }
};