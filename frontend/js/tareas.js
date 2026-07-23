const API_BASE_URL = "http://localhost:8000/api/v1";

const mapaParcelas = new Map();
let tareasActuales = [];

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

// cuando seleccionamos la fecha, nos devuelve una fecha muy larga algo asi026-07-20T00:00:00.000Z . Esto lo formateea en formato legible
function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  return String(fechaIso).slice(0, 10);
}

//  Notificaciones y modales
// Un solo estilo de aviso: solo cambia el texto que se muestra
function mostrarNotificacion(mensaje) {
  const elementodondeaparecealerta = document.getElementById("notificacion-global");
  elementodondeaparecealerta.textContent = mensaje;
  elementodondeaparecealerta.classList.remove("is-hidden");
  
  // basicamente el modal de notificacion desaparece luego de 2 segundos
  clearTimeout(mostrarNotificacion._timer);
  mostrarNotificacion._timer = setTimeout(() => elementodondeaparecealerta.classList.add("is-hidden"), 2000);
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
  
  const respuesta = await fetch(`${API_BASE_URL}/parcelas`); // quiere listar todas las parcelas
  
  // parseamos el json
  const parcelas = await respuesta.json();

  // mapa parcelas es una variable que declaramos arrriba
  // sirve para en este caso guardar las parcelas que estan activas

  mapaParcelas.clear();
  // Recorro una por una todas las parcelas que llegaron
  for (const p of parcelas) {
  // A cada parcela le la guardo clave valor
    mapaParcelas.set(p.id, p.nombre);
  }

  // basicamente abajo sirve para listar las parcelas cuando agregamos una parcela\

  // Empezamos con la opción fija 
  let opciones = '<option value="" disabled selected>Selecciona una parcela</option>';

  // Por cada parcela le sumamos su propio <option>
  for (const p of parcelas) {
    opciones += `<option value="${p.id}">${p.nombre}</option>`;
  }

  // ponemos las opciones en el select de parcela del formulario
  const select = document.getElementById("input-parcela");
  if (select) select.innerHTML = opciones;
}

//  Carga y render de tareas 

async function cargarTareas() {
  const respuesta = await fetch(`${API_BASE_URL}/tareas`);
  tareasActuales = await respuesta.json();

  renderizarTareas(tareasActuales);
}

// Cartel que se muestra cuando todavía no hay ninguna tarea
const HTML_SIN_TAREAS = `
  <div class="column is-full">
    <div class="estado-vacio">
      <p class="title is-5 has-text-grey">Todavía no hay tareas</p>
      <p class="has-text-grey">Creá la primera con "Nueva tarea" para empezar a registrar el trabajo de la parcela.</p>
    </div>
  </div>
`;

function renderizarTareas(tareas) {
  const contenedor = document.getElementById("lista-tareas");

  // Hay al menos una tarea?
  const hayTareas = tareas.length > 0;

  if (hayTareas) {
    // Convertimos cada tarea en su tarjeta y las mostramos
    contenedor.innerHTML = tareas.map(tarjetaTareaHTML).join(""); // ESTA FUNCION ES LA QUE SE LLAMA ABAJO
  } else {
    // No hay tareas: mostramos el cartel
    contenedor.innerHTML = HTML_SIN_TAREAS;
  }
}

// ACA
//  GENERAR HTML DE TARJETA
function tarjetaTareaHTML(t) {
  const parcelaNombre = mapaParcelas.get(t.parcela_id) || `Parcela #${t.parcela_id}`;

  const tId = t.id;
  const tPrioridad = t.prioridad;
  const tEstado = t.estado;
  const tEstadoEtiqueta = ETIQUETAS_ESTADO[t.estado] || t.estado;

  return `
    <div class="column is-one-third-desktop is-half-tablet is-full-mobile">
      <div class="box tarjeta-tarea">
        <div class="tags mb-2">
          <span class="tag tag-prioridad-${tPrioridad}">${tPrioridad}</span>
          <span class="tag is-light">${tEstadoEtiqueta}</span>
        </div>

        <p class="has-text-weight-semibold descripcion-tarea">${t.tarea}</p>
        <p class="is-size-7 has-text-grey mb-3">
          ${parcelaNombre}${t.fecha_limite ? " · Vence " + formatFecha(t.fecha_limite) : ""}
        </p>

        <div class="dropdown mb-2">
          <div class="dropdown-trigger">
            <button class="button is-small is-fullwidth has-text-white" aria-haspopup="true" data-accion="toggle-estado">
              <span>Cambiar estado</span>
            </button>
          </div>
          <div class="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="pendiente">Pendiente</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="en_progreso">En progreso</a>
              <a href="#" class="dropdown-item" data-accion="estado" data-id="${tId}" data-estado="completada">Completada</a>

            </div>
          </div>
        </div>

        <div class="buttons are-small">
          <button class="button is-light" data-accion="editar" data-id="${tId}">Editar</button>
          <button class="button is-light is-danger" data-accion="eliminar" data-id="${tId}">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function abrirModalNueva() {
  const form = document.getElementById("form-tarea");
  if (form) form.reset();
  
  document.getElementById("tarea-id").value = "";
  document.getElementById("modal-tarea-titulo").textContent = "Nueva tarea";
  
  const errores = document.getElementById("errores-form-tarea");
  if (errores) errores.classList.add("is-hidden");
  
  document.getElementById("input-prioridad").value = "Media";
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
  
  document.getElementById("input-prioridad").value = tarea.prioridad;

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
  const id = document.getElementById("tarea-id").value;
  const esEdicion = id !== ""; // si existe el id estamos editando sino creando

  // Armamos los datos de la tarea leyendo el formulario
  const cuerpo = {
    parcela_id: Number(document.getElementById("input-parcela").value),
    tarea: document.getElementById("input-tarea").value,
    prioridad: document.getElementById("input-prioridad").value,
    fecha_limite: document.getElementById("input-fecha-limite").value || undefined
  };

  let url;
  let metodo;

  if (esEdicion) { // es edicion
    url = `${API_BASE_URL}/tareas/${id}`;
    metodo = "PUT";
  } else {
    url = `${API_BASE_URL}/tareas`; // no es edicion osea lo esta creando
    metodo = "POST";
  }

  const respuesta = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });

  if (respuesta.ok) {
    cerrarModal("modal-tarea");

    // Elegimos el mensaje segun si editamos o creamos
    let mensaje;
    if (esEdicion) {
      mensaje = "Tarea actualizada";
    } else {
      mensaje = "Tarea creada";
    }
    mostrarNotificacion(mensaje);

    await cargarTareas();
  } else {
    const datos = await respuesta.json();
    mostrarErroresFormulario("errores-form-tarea", datos);
  }
}


//  Cambia el estado de una tarea y recarga la lista

async function cambiarEstado(id, estado) {
  const respuesta = await fetch(`${API_BASE_URL}/tareas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  });

  if (respuesta.ok) {
    mostrarNotificacion("Estado actualizado");
    await cargarTareas();
  } else {
    mostrarNotificacion("Error al cambiar estado");
  }
}

//  Eliminar

function abrirModalConfirmarEliminar(id) {
  document.getElementById("eliminar-tarea-id").value = id;
  abrirModal("modal-confirmar-eliminar");
}

async function confirmarEliminacion() {
  const id = document.getElementById("eliminar-tarea-id").value;

  const respuesta = await fetch(`${API_BASE_URL}/tareas/${id}`, { method: "DELETE" });

  cerrarModal("modal-confirmar-eliminar");

  if (respuesta.ok) {
    mostrarNotificacion("Tarea eliminada correctamente");
    await cargarTareas();
  } else {
    mostrarNotificacion("Error al eliminar la tarea");
  }
}

//  aca basicamente si toca alguno de los 3 botones de la tarea le redeirigfmoas hacia
// la funcion que esta seleccionando
document.addEventListener("click", function (evento) {
  // Buscamos si el clic fue sobre un elemento con data-accion
  const objetivo = evento.target.closest("[data-accion]");

  const accion = objetivo ? objetivo.dataset.accion : null;

  // Cerramos los dropdown abiertos, salvo el que acabamos de tocar para abrir
  document.querySelectorAll(".dropdown.is-active").forEach((d) => {
    if (accion === "toggle-estado" && d.contains(objetivo)) return;
    d.classList.remove("is-active");
  });

  // si el clic no fue sobre nada con data-accion, no hacemos nada mas
  if (!objetivo) {
    return;
  }

  const id = objetivo.dataset.id;

  // abre/cierra el menu de "cambiar estado" con un click
  if (accion === "toggle-estado") {
    objetivo.closest(".dropdown").classList.toggle("is-active");
  }

  if (accion === "editar") {
    abrirModalEditar(id);
  }

  if (accion === "eliminar") {
    abrirModalConfirmarEliminar(id);
  }

  if (accion === "estado") {
    cambiarEstado(id, objetivo.dataset.estado);
  }
});

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


// NUEVA TAREA
const btnNuevaTarea = document.getElementById("btn-nueva-tarea");
if (btnNuevaTarea) {
  btnNuevaTarea.addEventListener("click", abrirModalNueva);
}

// Guardar
const btnGuardarTarea = document.getElementById("guardar-tarea");
if (btnGuardarTarea) {
  btnGuardarTarea.addEventListener("click", guardarTarea);
}

// CONFRIMAR ELIMINAR TAREA
const btnConfirmarEliminar = document.getElementById("confirmar-eliminar");
if (btnConfirmarEliminar) {
  btnConfirmarEliminar.addEventListener("click", confirmarEliminacion);
}

// CUANDO ABRIMOS LA PAGINA
async function iniciar() {
  await cargarParcelas();
  await cargarTareas();
}

iniciar();
