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
    card.className = "card";

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
    

   // --- GRUPO DE BOTONES (ACCIONES CRUD) ---
    const grupoBotones = document.createElement("div");
    grupoBotones.className = "buttons mt-4";

    // Botón Ver Detalle
    const botonVer = document.createElement("button");
    botonVer.className = "button is-info is-small";
    botonVer.textContent = "Ver Detalle";
    botonVer.addEventListener('click', () => {
        verDetalle(parcela.id);
    });

    // Botón Eliminar con tu Modal Personalizado
    const botonEliminar = document.createElement("button");
    botonEliminar.className = "button is-danger is-small";
    botonEliminar.textContent = "Eliminar";
    
    botonEliminar.addEventListener('click', () => {
        // 1. Buscamos los elementos del modal en el HTML
        const modal = document.getElementById('modal-confirmacion');
        const textoModal = document.getElementById('texto-confirmacion');
        const btnAceptarModal = document.getElementById('btn-aceptar-modal');
        const btnCancelarModal = document.getElementById('btn-cancelar-modal');

        // 2. Seteamos el texto dinámico
        textoModal.textContent = `¿Estás seguro de que deseas eliminar la parcela "${parcela.nombre}"?`;
        
        // 3. Abrimos el modal (aplica el difuminado)
        modal.showModal();

        // 4. IMPORTANTE: Usamos un onclick directo para LIMPIAR cualquier ID anterior de la memoria
        btnAceptarModal.onclick = async () => {
            modal.close(); // Cerramos el modal primero
            await deleteParcela(parcela.id); // Llama a tu función de abajo pasándole el ID limpio
        };

        btnCancelarModal.onclick = () => {
            modal.close();
        };
    });

    // Botón Editar
    const botonEditar = document.createElement("button");
    botonEditar.className = "button is-warning is-small";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener('click', () => {
        abrirEditar(parcela.id);
    });

    // Botón Agregar Tarea
    const botonTarea = document.createElement("button");
    botonTarea.className = "button is-success is-small";
    botonTarea.textContent = "Agregar Tarea";
    botonTarea.addEventListener('click', () => {
        agregarTareaA(parcela.id);
    });


    // ENSAMBLAJE DE LA ESTRUCTURA 
    grupoBotones.appendChild(botonVer);
    grupoBotones.appendChild(botonEliminar);
    grupoBotones.appendChild(botonEditar);
    grupoBotones.appendChild(botonTarea);
    
    contentText.appendChild(grupoBotones);

    cardContent.appendChild(title);
    cardContent.appendChild(contentText);

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
} // Llamada de prueba para eliminar la parcela con ID 1
