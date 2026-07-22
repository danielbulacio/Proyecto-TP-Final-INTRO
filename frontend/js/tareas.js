
const mapaParcelas = new Map(); // id -> nombre
let tareasActuales = []; 

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada"
};

//  Utilidades 

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  return fechaIso.slice(0, 10);
}

function esVencida(tarea) {
  if (["completada", "cancelada"].includes(tarea.estado)) return false;
  if (!tarea.fecha_limite) return false;
  return tarea.fecha_limite.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

function mostrarNotificacion(mensaje, tipo = "success") {
  const el = document.getElementById("notificacion-global");
  el.className = `notification mx-5 is-${tipo}`;
  el.textContent = mensaje;
  el.classList.remove("is-hidden");
  clearTimeout(mostrarNotificacion._timer);
  mostrarNotificacion._timer = setTimeout(() => el.classList.add("is-hidden"), 4000);
}

function abrirModal(id) {
  document.getElementById(id).classList.add("is-active");
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove("is-active");
}

//  Carga inicial de parcelas (para selects) 

async function cargarParcelas() {
  const respuesta = await fetch("/api/parcelas");
  const parcelas = await respuesta.json();

  mapaParcelas.clear();
  parcelas.forEach((p) => mapaParcelas.set(p.id, p.nombre));

  const opciones = parcelas.map((p) => `<option value="${p.id}">${escapeHtml(p.nombre)}</option>`).join("");
  document.getElementById("input-parcela").innerHTML = opciones;
  document.getElementById("input-nueva-parcela").innerHTML = opciones;
}

//  Carga y render de tareas 

async function cargarTareas() {
  const estado = document.getElementById("filtro-estado").value;
  const prioridad = document.getElementById("filtro-prioridad").value;

  const parametros = new URLSearchParams();
  if (estado) parametros.set("estado", estado);
  if (prioridad) parametros.set("prioridad", prioridad);

  const respuesta = await fetch(`/api/tareas?${parametros.toString()}`);
  tareasActuales = await respuesta.json();

  renderizarTareas(tareasActuales);
}

function renderizarTareas(tareas) {
  const contenedor = document.getElementById("lista-tareas");

  if (!tareas.length) {
    contenedor.innerHTML = `
      <div class="column is-full">
        <div class="estado-vacio">
          <p class="title is-5">Todavía no hay tareas acá</p>
          <p>Creá la primera con "Nueva tarea" para empezar a registrar el trabajo de la parcela.</p>
        </div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = tareas.map(tarjetaTareaHTML).join("");
}

function tarjetaTareaHTML(t) {
  const parcelaNombre = mapaParcelas.get(t.parcela_id) || `Parcela #${t.parcela_id}`;
  const vencida = esVencida(t);

  return `
    <div class="column is-one-third-desktop is-half-tablet is-full-mobile">
      <div class="box tarjeta-tarea ${vencida ? "esta-vencida" : ""}">
        <div class="tags mb-2">
          <span class="tag tag-prioridad-${t.prioridad}">${t.prioridad}</span>
          <span class="tag is-light">${ETIQUETAS_ESTADO[t.estado] || t.estado}</span>
          ${vencida ? '<span class="tag is-danger is-light">Vencida</span>' : ""}
        </div>

        <p class="has-text-weight-semibold descripcion-tarea">${escapeHtml(t.tarea)}</p>
        <p class="is-size-7 has-text-grey mb-3">
          ${escapeHtml(parcelaNombre)}${t.fecha_limite ? " · Vence " + formatFecha(t.fecha_limite) : ""}
        </p>

        <div class="dropdown is-hoverable mb-2">
          <div class="dropdown-trigger">
            <button class="button is-small is-fullwidth" aria-haspopup="true">
              <span>Cambiar estado</span>
            </button>
          </div>
          <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${t.id}" data-estado="pendiente">Pendiente</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${t.id}" data-estado="en_progreso">En progreso</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${t.id}" data-estado="completada">Completada</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${t.id}" data-estado="cancelada">Cancelada</a>
            </div>
          </div>
        </div>

        <div class="buttons are-small">
          <button class="button is-light" data-accion="editar" data-id="${t.id}">Editar</button>
          <button class="button is-light" data-accion="reasignar" data-id="${t.id}">Reasignar</button>
          <button class="button is-light" data-accion="historial" data-id="${t.id}">Historial</button>
          <button class="button is-light is-danger" data-accion="eliminar" data-id="${t.id}">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

// Crear / Editar 

function seleccionarPrioridad(valor) {
  document.getElementById("input-prioridad").value = valor;
  document.querySelectorAll(".opcion-prioridad").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.valor === valor);
  });
}

function abrirModalNueva() {
  document.getElementById("form-tarea").reset();
  document.getElementById("tarea-id").value = "";
  document.getElementById("modal-tarea-titulo").textContent = "Nueva tarea";
  document.getElementById("errores-form-tarea").classList.add("is-hidden");
  seleccionarPrioridad("Media");
  abrirModal("modal-tarea");
}

function abrirModalEditar(id) {
  const tarea = tareasActuales.find((t) => t.id === Number(id));
  if (!tarea) return;

  document.getElementById("modal-tarea-titulo").textContent = "Editar tarea";
  document.getElementById("tarea-id").value = tarea.id;
  document.getElementById("input-parcela").value = tarea.parcela_id;
  document.getElementById("input-tarea").value = tarea.tarea;
  document.getElementById("input-fecha-limite").value = formatFecha(tarea.fecha_limite);
  document.getElementById("errores-form-tarea").classList.add("is-hidden");
  seleccionarPrioridad(tarea.prioridad);

  abrirModal("modal-tarea");
}

function mostrarErroresFormulario(contenedorId, datos) {
  const el = document.getElementById(contenedorId);
  const mensajes = datos.detalles
    ? datos.detalles.map((d) => `${d.campo}: ${d.mensaje}`).join(" | ")
    : datos.message || "Ocurrió un error";
  el.textContent = mensajes;
  el.classList.remove("is-hidden");
}

async function guardarTarea() {
  const id = document.getElementById("tarea-id").value;

  const cuerpo = {
    parcela_id: Number(document.getElementById("input-parcela").value),
    tarea: document.getElementById("input-tarea").value,
    prioridad: document.getElementById("input-prioridad").value,
    fecha_limite: document.getElementById("input-fecha-limite").value || undefined
  };

  const esEdicion = Boolean(id);
  const url = esEdicion ? `/api/tareas/${id}` : "/api/tareas";
  const metodo = esEdicion ? "PUT" : "POST";

  const respuesta = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    mostrarErroresFormulario("errores-form-tarea", datos);
    return;
  }

  cerrarModal("modal-tarea");
  mostrarNotificacion(esEdicion ? "Tarea actualizada" : "Tarea creada", "success");
  await cargarTareas();
}

//  Cambiar estado 

async function cambiarEstado(id, estado) {
  const respuesta = await fetch(`/api/tareas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  });
  const datos = await respuesta.json();

  mostrarNotificacion(datos.message, respuesta.ok ? "success" : "danger");
  if (respuesta.ok) await cargarTareas();
}

//  Reasignar 

function abrirModalReasignar(id) {
  document.getElementById("reasignar-tarea-id").value = id;
  document.getElementById("errores-reasignar").classList.add("is-hidden");
  abrirModal("modal-reasignar");
}

async function confirmarReasignacion() {
  const id = document.getElementById("reasignar-tarea-id").value;
  const nueva_parcela_id = Number(document.getElementById("input-nueva-parcela").value);

  const respuesta = await fetch(`/api/tareas/${id}/asignar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nueva_parcela_id })
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    mostrarErroresFormulario("errores-reasignar", datos);
    return;
  }

  cerrarModal("modal-reasignar");
  mostrarNotificacion("Tarea reasignada", "success");
  await cargarTareas();
}

//  Historial 

async function abrirModalHistorial(id) {
  const respuesta = await fetch(`/api/tareas/${id}/historial`);
  const historial = await respuesta.json();

  const contenedor = document.getElementById("contenido-historial");

  if (!historial.length) {
    contenedor.innerHTML = `<p class="has-text-grey">Todavía no hay acciones registradas.</p>`;
  } else {
    contenedor.innerHTML = `
      <div class="linea-tiempo">
        ${historial
          .map(
            (h) => `
              <div class="evento">
                <span class="tag is-light">${h.accion.replace("_", " ")}</span>
                <p>${escapeHtml(h.detalle || "")}</p>
                <p class="fecha-evento">${new Date(h.fecha).toLocaleString()}</p>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  abrirModal("modal-historial");
}

//  Eliminar 

function abrirModalConfirmarEliminar(id) {
  document.getElementById("eliminar-tarea-id").value = id;
  abrirModal("modal-confirmar-eliminar");
}

async function confirmarEliminacion() {
  const id = document.getElementById("eliminar-tarea-id").value;

  const respuesta = await fetch(`/api/tareas/${id}`, { method: "DELETE" });
  const datos = await respuesta.json();

  cerrarModal("modal-confirmar-eliminar");
  mostrarNotificacion(datos.message, respuesta.ok ? "success" : "danger");
  if (respuesta.ok) await cargarTareas();
}

//  Delegacion de eventos de las tarjetas 

document.addEventListener("click", (evento) => {
  const objetivo = evento.target.closest("[data-accion]");
  if (!objetivo) return;

  const accion = objetivo.dataset.accion;
  const id = objetivo.dataset.id;

  if (accion === "editar") abrirModalEditar(id);
  if (accion === "reasignar") abrirModalReasignar(id);
  if (accion === "historial") abrirModalHistorial(id);
  if (accion === "eliminar") abrirModalConfirmarEliminar(id);
  if (accion === "estado") {
    evento.preventDefault();
    cambiarEstado(id, objetivo.dataset.estado);
  }
});

//  Selector de prioridad  

document.getElementById("selector-prioridad").addEventListener("click", (evento) => {
  const opcion = evento.target.closest(".opcion-prioridad");
  if (opcion) seleccionarPrioridad(opcion.dataset.valor);
});

//  Cierre de modales 

document.querySelectorAll("[data-cerrar]").forEach((el) => {
  el.addEventListener("click", () => cerrarModal(el.dataset.cerrar));
});

//  Burger del navbar 

document.querySelectorAll(".navbar-burger").forEach((burger) => {
  burger.addEventListener("click", () => {
    const destino = document.getElementById(burger.dataset.target);
    burger.classList.toggle("is-active");
    destino.classList.toggle("is-active");
  });
});

//  Botones principales 

document.getElementById("btn-nueva-tarea").addEventListener("click", abrirModalNueva);
document.getElementById("guardar-tarea").addEventListener("click", guardarTarea);
document.getElementById("confirmar-reasignar").addEventListener("click", confirmarReasignacion);
document.getElementById("confirmar-eliminar").addEventListener("click", confirmarEliminacion);
document.getElementById("filtro-estado").addEventListener("change", cargarTareas);
document.getElementById("filtro-prioridad").addEventListener("change", cargarTareas);

//  Arranque 

(async function iniciar() {
  await cargarParcelas();
  await cargarTareas();
})();