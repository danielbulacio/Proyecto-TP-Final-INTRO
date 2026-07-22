async function getAllParcelas(){
    const url = "http://localhost:8000/api/v1/parcelas";
    const response = await fetch(url);
    const parcelas = await response.json();
    console.log(parcelas)
    const tarjetasParcelas = document.getElementById("tarjetas-parcelas");
    tarjetasParcelas.innerHTML = "";
    const error = document.getElementById("error");
    error.innerHTML = "";

parcelas.forEach(parcela => {
    // 1. Creamos la columna contenedora (Controla el tamaño)
    const col = document.createElement("div");
    col.className = "column is-12-mobile is-6-tablet is-4-desktop";

    // 2. Creamos la Tarjeta Principal
    const card = document.createElement("div");
    card.className = "card tag-parcelas"; 

    // --- SECCIÓN DE LA IMAGEN ---
    const cardImage = document.createElement("div");
    cardImage.className = "card-image";

    const figure = document.createElement("figure");
    figure.className = "image is-4by3";

    const img = document.createElement("img");
    img.src = parcela.imagen || 'https://bulma.io/assets/images/placeholders/1280x960.png';
    img.alt = parcela.nombre;
    img.style.objectFit = "cover"; // Evita que la imagen de prueba se deforme

    figure.appendChild(img);
    cardImage.appendChild(figure);


   // --- SECCIÓN DEL CONTENIDO ---
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    // Título de la parcela
    const title = document.createElement("p");
    title.className = "title is-4 mb-3";
    title.textContent = parcela.nombre; // Esto se mantiene igual

    // Bloque de texto para las COORDENADAS (Reemplazamos la descripción)
    const contentText = document.createElement("div");
    contentText.className = "content";

    const coordenadas = document.createElement("p");
    coordenadas.className = "has-text-grey";
    // Usamos innerHTML para poder poner las negritas (<strong>) y el salto de línea (<br>)
    coordenadas.innerHTML = `
        <strong>Latitud:</strong> ${parcela.latitud} <br>
        <strong>Longitud:</strong> ${parcela.longitud}
    `;
    
    contentText.appendChild(coordenadas);

    // --- GRUPO DE BOTONES (ACCIONES CRUD) ---
    const footerBotones = document.createElement("div");
    footerBotones.className = "is-flex is-justify-content-space-between is-align-items-center mt-4";

    // 2. Contenedor izquierdo para los botones principales
    const divBotonesPrincipales = document.createElement("div");
    divBotonesPrincipales.className = "buttons mb-0"; // mb-0 para que no agregue margen extra abajo

    // Botón Ver Detalle (Igual que antes)
    const botonVer = document.createElement("button");
    botonVer.className = "button is-white is-outlined";
    botonVer.textContent = "Ver Detalle";
    botonVer.addEventListener('click', () => {
        verDetalle(parcela.id);
    });

    // Botón Agregar Tarea (Igual que antes)
    const botonTarea = document.createElement("button");
    botonTarea.className = "button is-white is-outlined";
    botonTarea.textContent = "Agregar Tarea";
    botonTarea.addEventListener('click', () => {
        agregarTareaA(parcela.id);
    });

    divBotonesPrincipales.appendChild(botonVer);
    divBotonesPrincipales.appendChild(botonTarea);

    // 3. Contenedor derecho: Dropdown de Opciones (Lápiz)
    const dropdown = document.createElement("div");
    // "is-right" asegura que el menú se abra hacia la izquierda y no se desborde de la tarjeta
    dropdown.className = "dropdown is-right is-up"; // is-up si quieres que abra hacia arriba, quítalo si prefieres hacia abajo

    // Disparador del dropdown (El botón con el lápiz)
    const dropdownTrigger = document.createElement("div");
    dropdownTrigger.className = "dropdown-trigger";
    
    const botonOpciones = document.createElement("button");
    botonOpciones.className = "button is-white is-outlined";
    botonOpciones.setAttribute("aria-haspopup", "true");
    botonOpciones.setAttribute("aria-controls", "dropdown-menu");
    // Usamos un emoji de lápiz, si usas FontAwesome puedes cambiarlo por <i class="fas fa-pencil-alt"></i>
    botonOpciones.innerHTML = `<span class="icon"><i class="material-icons">edit</i></span>`; 
    
    // Funcionalidad para abrir/cerrar el menú desplegable
    botonOpciones.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que otros clics cierren esto de inmediato
        dropdown.classList.toggle('is-active');
    });
    
    dropdownTrigger.appendChild(botonOpciones);

    // Contenido del dropdown
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.id = "dropdown-menu";
    dropdownMenu.setAttribute("role", "menu");

    const dropdownContent = document.createElement("div");
    dropdownContent.className = "dropdown-content";

    // Opción: Editar
    const itemEditar = document.createElement("a");
    itemEditar.className = "dropdown-item has-text-warning has-text-weight-bold";
    itemEditar.textContent = "Editar";
    itemEditar.addEventListener('click', () => {
        dropdown.classList.remove('is-active'); // Cerramos el menú
        window.location.href = `update_parcela.html?id=${parcela.id}`; 
        console.log("Se hizo clic en Editar Parcela");
        abrirEditar(parcela.id);
    });

    // Separador visual
    const divider = document.createElement("hr");
    divider.className = "dropdown-divider";

    // Opción: Eliminar
    const itemEliminar = document.createElement("a");
    itemEliminar.className = "dropdown-item has-text-danger has-text-weight-bold";
    itemEliminar.textContent = "Eliminar";
    itemEliminar.addEventListener('click', () => {
        dropdown.classList.remove('is-active'); // Cerramos el menú
        
        const modal = document.getElementById('modal-confirmacion');
        const textoModal = document.getElementById('texto-confirmacion');
        const btnAceptarModal = document.getElementById('btn-aceptar-modal');
        const btnCancelarModal = document.getElementById('btn-cancelar-modal');

        textoModal.textContent = `¿Estás seguro de que deseas eliminar la parcela "${parcela.nombre}"?`;
        modal.showModal();

        btnAceptarModal.onclick = async () => {
            modal.close();
            await deleteParcela(parcela.id);
        };

        btnCancelarModal.onclick = () => {
            modal.close();
        };
    });

    // Ensamblamos el dropdown
    dropdownContent.appendChild(itemEditar);
    dropdownContent.appendChild(divider);
    dropdownContent.appendChild(itemEliminar);
    
    dropdownMenu.appendChild(dropdownContent);
    dropdown.appendChild(dropdownTrigger);
    dropdown.appendChild(dropdownMenu);

    // 4. ENSAMBLAJE FINAL
    footerBotones.appendChild(divBotonesPrincipales);
    footerBotones.appendChild(dropdown);
    
    // Lo inyectamos en el contenido de la tarjeta
    contentText.appendChild(footerBotones);

    cardContent.appendChild(title);
    cardContent.appendChild(contentText);
    // ... el resto sigue igual (card.appendChild...)

    card.appendChild(cardImage);
    card.appendChild(cardContent);

    col.appendChild(card);

    // Finalmente lo inyectamos en tu contenedor de la grilla
    tarjetasParcelas.appendChild(col);
  });
}
getAllParcelas();

async function deleteParcela(id){
    const response = await fetch(`http://localhost:8000/api/v1/parcelas/${id}`, {
        method: 'DELETE'
    });

    if (response.status == 200) {
        await getAllParcelas();
    } else {
        const error = document.getElementById("error");
        error.textContent = response.statusText;
    }
} 

const btnAgregar = document.getElementById('btn-agregar-parcela');

if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
        window.location.href = 'create_parcela.html'; 
        console.log("Se hizo clic en Agregar Parcela");
    });
}
async function createParcela(datosNuevaParcela) {
    try {
        const response = await fetch("http://localhost:8000/api/parcelas", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convertimos el objeto de datos a un string JSON
            body: JSON.stringify(datosNuevaParcela)
        });

        if (response.status === 201 || response.status === 200) {
            console.log("Parcela creada con éxito");
            // Volvemos a cargar las parcelas para que aparezca la nueva
            await getAllParcelas();
            
        } else {
            const error = document.getElementById("error");
            error.textContent = "Error al crear la parcela: " + response.statusText;
        }
    } catch (err) {
        console.error("Hubo un problema con la petición:", err);
    }
}