// Configuración de API con URL completa
const API_BASE_URL = "http://localhost:8000/api/v1";

const mapaParcelas = new Map(); // id -> nombre
let tareasActuales = [];

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada"
};

//  Utilidades 

// Escapa texto para prevenir XSS
function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(texto);
  return div.innerHTML;
}

// Formatea fecha ISO a YYYY-MM-DD
function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  return String(fechaIso).slice(0, 10);
}

// Determina si una tarea está vencida según su fecha límite y estado
function esVencida(tarea) {
  if (["completada", "cancelada"].includes(tarea.estado)) return false;
  if (!tarea.fecha_limite) return false;
  
  // Comparación en zona horaria local limpia
  const fechaLimiteStr = String(tarea.fecha_limite).slice(0, 10);
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  
  return fechaLimiteStr < hoyStr;
}


//  Notificaciones y modales
function mostrarNotificacion(mensaje, tipo = "success") {
  const el = document.getElementById("notificacion-global");
  if (!el) return;
  el.className = `notification mx-5 is-${tipo}`;
  el.textContent = mensaje;
  el.classList.remove("is-hidden");
  clearTimeout(mostrarNotificacion._timer);
  mostrarNotificacion._timer = setTimeout(() => el.classList.add("is-hidden"), 4000);
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("is-active");
}

function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("is-active");
}

//  Carga inicial de parcelas (para selects) 

async function cargarParcelas() {
  try {
    // Fetch seguro con manejo de errores
    const respuesta = await fetch(`${API_BASE_URL}/parcelas`);
    if (!respuesta.ok) throw new Error("No se pudieron obtener las parcelas");
    
    // Parseamos la respuesta JSON y llenamos el mapa de parcelas
    const parcelas = await respuesta.json();

    mapaParcelas.clear();
    parcelas.forEach((p) => mapaParcelas.set(p.id, p.nombre));

    // Llenamos los selects de parcela en el formulario de tareas
    const opciones = `
      <option value="" disabled selected>-- Seleccione una parcela --</option>
      ${parcelas.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.nombre)}</option>`).join("")}
    `;

    const selectParcela = document.getElementById("input-parcela");
    const selectNuevaParcela = document.getElementById("input-nueva-parcela");

    if (selectParcela) selectParcela.innerHTML = opciones;
    if (selectNuevaParcela) selectNuevaParcela.innerHTML = opciones;
  } catch (error) {
    console.error("Error cargando parcelas:", error);
    mostrarNotificacion("Error al obtener la lista de parcelas", "danger");
  }
} 

//  Carga y render de tareas 

async function cargarTareas() {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/tareas`);
    if (!respuesta.ok) throw new Error("Error al obtener tareas");

    const todasLasTareas = await respuesta.json();

    // Leemos los valores de los selects
    const filtroEstado = document.getElementById("filtro-estado")?.value;
    const filtroPrioridad = document.getElementById("filtro-prioridad")?.value;

    // Filtramos en memoria
    tareasActuales = todasLasTareas.filter((t) => {
      const cumpleEstado = !filtroEstado || t.estado === filtroEstado;
      const cumplePrioridad = !filtroPrioridad || t.prioridad === filtroPrioridad;
      return cumpleEstado && cumplePrioridad;
    });

    // Renderizamos las tareas filtradas
    renderizarTareas(tareasActuales);
  } catch (error) {
    console.error("Error cargando tareas:", error);
    mostrarNotificacion("No se pudieron cargar las tareas", "danger");
  }
}

function renderizarTareas(tareas) {
  const contenedor = document.getElementById("lista-tareas");
  if (!contenedor) return;

  if (!tareas || !tareas.length) {
    contenedor.innerHTML = `
      <div class="column is-full">
        <div class="estado-vacio">
          <p class="title is-5 has-text-grey">Todavía no hay tareas</p>
          <p class="has-text-grey">Creá la primera con "Nueva tarea" para empezar a registrar el trabajo de la parcela.</p>
        </div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = tareas.map(tarjetaTareaHTML).join("");
}

//  Generación de HTML de tarjeta de tarea
function tarjetaTareaHTML(t) {
  const parcelaNombre = mapaParcelas.get(t.parcela_id) || `Parcela #${t.parcela_id}`;
  const vencida = esVencida(t);

  // Escapamos todas las variables para evitar XSS
  const tId = escapeHtml(t.id);
  const tPrioridad = escapeHtml(t.prioridad);
  const tEstado = escapeHtml(t.estado);
  const tEstadoEtiqueta = escapeHtml(ETIQUETAS_ESTADO[t.estado] || t.estado);

  return `
    <div class="column is-one-third-desktop is-half-tablet is-full-mobile">
      <div class="box tarjeta-tarea ${vencida ? "esta-vencida" : ""}">
        <div class="tags mb-2">
          <span class="tag tag-prioridad-${tPrioridad}">${tPrioridad}</span>
          <span class="tag is-light">${tEstadoEtiqueta}</span>
          ${vencida ? '<span class="tag is-danger is-light">Vencida</span>' : ""}
        </div>

        <p class="has-text-weight-semibold descripcion-tarea">${escapeHtml(t.tarea)}</p>
        <p class="is-size-7 has-text-grey mb-3">
          ${escapeHtml(parcelaNombre)}${t.fecha_limite ? " · Vence " + escapeHtml(formatFecha(t.fecha_limite)) : ""}
        </p>

        <div class="dropdown is-hoverable mb-2">
          <div class="dropdown-trigger">
            <button class="button is-small is-fullwidth has-text-white" aria-haspopup="true">
              <span>Cambiar estado</span>
            </button>
          </div>
          <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="pendiente">Pendiente</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="en_progreso">En progreso</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="completada">Completada</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="cancelada">Cancelada</a>
            </div>
          </div>
        </div>

        <div class="buttons are-small">
          <button class="button is-light" data-accion="editar" data-id="${tId}">Editar</button>
          <button class="button is-light" data-accion="historial" data-id="${tId}">Historial</button>
          <button class="button is-light is-danger" data-accion="eliminar" data-id="${tId}">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

//  Crear / Editar 

//  Función para seleccionar la prioridad y actualizar el input oculto
function seleccionarPrioridad(valor) {
  const input = document.getElementById("input-prioridad");
  if (input) input.value = valor;
  
  document.querySelectorAll(".opcion-prioridad").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.valor === valor);
  });
}

function abrirModalNueva() {
  const form = document.getElementById("form-tarea");
  if (form) form.reset();
  
  document.getElementById("tarea-id").value = "";
  document.getElementById("modal-tarea-titulo").textContent = "Nueva tarea";
  
  const errores = document.getElementById("errores-form-tarea");
  if (errores) errores.classList.add("is-hidden");
  
  seleccionarPrioridad("Media");
  abrirModal("modal-tarea");
}

function abrirModalEditar(id) {
  // Conversión segura para encontrar la tarea independiente de si es número o string
  const tarea = tareasActuales.find((t) => String(t.id) === String(id));
  if (!tarea) return;

  document.getElementById("modal-tarea-titulo").textContent = "Editar tarea";
  document.getElementById("tarea-id").value = tarea.id;
  
  // Asignación segura del select (convertido a String para coincidir con el option value)
  const selectParcela = document.getElementById("input-parcela");
  if (selectParcela) {
    selectParcela.value = String(tarea.parcela_id ?? "");
  }

  document.getElementById("input-tarea").value = tarea.tarea || "";
  document.getElementById("input-fecha-limite").value = formatFecha(tarea.fecha_limite);
  
  const errores = document.getElementById("errores-form-tarea");
  if (errores) errores.classList.add("is-hidden");
  
  seleccionarPrioridad(tarea.prioridad);

  abrirModal("modal-tarea");
}

function mostrarErroresFormulario(contenedorId, datos) {
  const el = document.getElementById(contenedorId);
  if (!el) return;

  const mensajes = datos?.detalles
    ? datos.detalles.map((d) => `${d.campo}: ${d.mensaje}`).join(" | ")
    : datos?.message || "Ocurrió un error inesperado";

  el.textContent = mensajes;
  el.classList.remove("is-hidden");
}

async function guardarTarea() {
  const btnGuardar = document.getElementById("guardar-tarea");
  if (btnGuardar) btnGuardar.disabled = true; // Bloqueo de doble clic

  try {
    const id = document.getElementById("tarea-id").value;

    // Construimos el cuerpo de la solicitud con validación mínima
    const cuerpo = {
      parcela_id: Number(document.getElementById("input-parcela").value),
      tarea: document.getElementById("input-tarea").value,
      prioridad: document.getElementById("input-prioridad").value,
      fecha_limite: document.getElementById("input-fecha-limite").value || undefined
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_BASE_URL}/tareas/${id}` : `${API_BASE_URL}/tareas`;
    const metodo = esEdicion ? "PUT" : "POST";

    // Enviamos la solicitud al backend
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });

    // Manejo seguro por si la API no devuelve contenido en JSON
    const datos = respuesta.status !== 204 ? await respuesta.json() : {};

    if (!respuesta.ok) {
      mostrarErroresFormulario("errores-form-tarea", datos);
      return;
    }

    cerrarModal("modal-tarea");
    mostrarNotificacion(esEdicion ? "Tarea actualizada" : "Tarea creada", "success");
    await cargarTareas();
  } catch (error) {
    console.error("Error guardando tarea:", error);
    mostrarNotificacion("No se pudo conectar con el servidor", "danger");
  } finally {
    if (btnGuardar) btnGuardar.disabled = false;
  }
}


//  Cambia el estado de una tarea y recarga la lista

async function cambiarEstado(id, estado) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/tareas/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado })
    });
    
    const datos = respuesta.status !== 204 ? await respuesta.json() : {};

    mostrarNotificacion(
      datos.message || (respuesta.ok ? "Estado actualizado" : "Error al cambiar estado"),
      respuesta.ok ? "success" : "danger"
    );
    if (respuesta.ok) await cargarTareas();
  } catch (error) {
    console.error("Error cambiando estado:", error);
    mostrarNotificacion("Error de conexión al actualizar el estado", "danger");
  }
}

//  Historial 

async function abrirModalHistorial(id) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/tareas/${id}/historial`);
    if (!respuesta.ok) throw new Error("Error al obtener historial");

    const historial = await respuesta.json();
    const contenedor = document.getElementById("contenido-historial");
    if (!contenedor) return;


    if (!historial || !historial.length) {
      contenedor.innerHTML = `<p class="has-text-grey">Todavía no hay acciones registradas.</p>`;
    } else {
      contenedor.innerHTML = `
        <div class="linea-tiempo">
          ${historial
            .map(
              (h) => `
                <div class="evento">
                  <span class="tag is-light">${escapeHtml(h.accion ? h.accion.replace("_", " ") : "")}</span>
                  <p>${escapeHtml(h.detalle || "")}</p>
                  <p class="fecha-evento">${escapeHtml(new Date(h.fecha).toLocaleString())}</p>
                </div>
              `
            )
            .join("")}
        </div>
      `;
    }

    abrirModal("modal-historial");
  } catch (error) {
    console.error("Error al cargar historial:", error);
    mostrarNotificacion("No se pudo cargar el historial de la tarea", "danger");
  }
}

//  Eliminar 

function abrirModalConfirmarEliminar(id) {
  document.getElementById("eliminar-tarea-id").value = id;
  abrirModal("modal-confirmar-eliminar");
}

async function confirmarEliminacion() {
  const btnEliminar = document.getElementById("confirmar-eliminar");
  if (btnEliminar) btnEliminar.disabled = true;

  try {
    const id = document.getElementById("eliminar-tarea-id").value;

    const respuesta = await fetch(`${API_BASE_URL}/tareas/${id}`, { method: "DELETE" });
    const datos = respuesta.status !== 204 ? await respuesta.json() : {};

    cerrarModal("modal-confirmar-eliminar");
    mostrarNotificacion(
      datos.message || (respuesta.ok ? "Tarea eliminada correctamente" : "Error al eliminar"),
      respuesta.ok ? "success" : "danger"
    );
    if (respuesta.ok) await cargarTareas();
  } catch (error) {
    console.error("Error al eliminar:", error);
    mostrarNotificacion("Error de conexión al intentar eliminar", "danger");
  } finally {
    if (btnEliminar) btnEliminar.disabled = false;
  }
}

//  Delegacion de eventos de las tarjetas 

document.addEventListener("click", (evento) => {
  const objetivo = evento.target.closest("[data-accion]");
  if (!objetivo) return;

  const accion = objetivo.dataset.accion;
  const id = objetivo.dataset.id;

  if (accion === "editar") abrirModalEditar(id);
  if (accion === "historial") abrirModalHistorial(id);
  if (accion === "eliminar") abrirModalConfirmarEliminar(id);
  if (accion === "estado") {
    evento.preventDefault();
    cambiarEstado(id, objetivo.dataset.estado);
  }
});

//  Listeners con validación de existencia en DOM 

const selectorPrioridad = document.getElementById("selector-prioridad");
if (selectorPrioridad) {
  selectorPrioridad.addEventListener("click", (evento) => {
    const opcion = evento.target.closest(".opcion-prioridad");
    if (opcion) seleccionarPrioridad(opcion.dataset.valor);
  });
}

//  Eventos de cierre de modales y toggles de navbar

document.querySelectorAll("[data-cerrar]").forEach((el) => {
  el.addEventListener("click", () => cerrarModal(el.dataset.cerrar));
});

document.querySelectorAll(".navbar-burger").forEach((burger) => {
  burger.addEventListener("click", () => {
    const destino = document.getElementById(burger.dataset.target);
    if (destino) {
      burger.classList.toggle("is-active");
      destino.classList.toggle("is-active");
    }
  });
});

//  Asignación de eventos principales
const btnNuevaTarea = document.getElementById("btn-nueva-tarea");
if (btnNuevaTarea) btnNuevaTarea.addEventListener("click", abrirModalNueva);

const btnGuardarTarea = document.getElementById("guardar-tarea");
if (btnGuardarTarea) btnGuardarTarea.addEventListener("click", guardarTarea);

const btnConfirmarEliminar = document.getElementById("confirmar-eliminar");
if (btnConfirmarEliminar) btnConfirmarEliminar.addEventListener("click", confirmarEliminacion);

const filtroEstado = document.getElementById("filtro-estado");
if (filtroEstado) filtroEstado.addEventListener("change", cargarTareas);

const filtroPrioridad = document.getElementById("filtro-prioridad");
if (filtroPrioridad) filtroPrioridad.addEventListener("change", cargarTareas);

//  Arranque seguro
(async function iniciar() {
  await cargarParcelas();
  await cargarTareas();
})();