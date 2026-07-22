document.addEventListener("DOMContentLoaded", async () => {
    // 1. Obtenemos el ID de la parcela desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParcela = urlParams.get('id');

    // Elementos del DOM
    const formEditar = document.getElementById('form-editar-parcela');
    const inputImagen = document.getElementById("input-imagen");
    const nombreArchivo = document.getElementById("nombre-archivo");
    const mensajeError = document.getElementById("mensaje-error");

    // 2. Cargamos los datos actuales de la parcela en los inputs
    if (idParcela) {
        try {
            const respuesta = await fetch(`http://localhost:8000/api/v1/parcelas/${idParcela}`);
            
            if (respuesta.ok) {
                const parcela = await respuesta.json();
                
                // Rellenamos los campos
                document.getElementById('input-nombre').value = parcela.nombre || '';
                document.getElementById('input-latitud').value = parcela.latitud || '';
                document.getElementById('input-longitud').value = parcela.longitud || '';
                
                const inputHectareas = document.getElementById('input-hectareas');
                if (inputHectareas) {
                    inputHectareas.value = parcela.hectareas || '';
                }
                
                console.log("Datos cargados exitosamente en el formulario:", parcela);
            } else {
                console.error("No se pudo cargar la parcela para editarla.");
            }
        } catch (error) {
            console.error("Error al obtener los datos de la parcela:", error);
        }
    }

    // 3. Listener para actualizar dinámicamente el nombre de la imagen elegida
    if (inputImagen && nombreArchivo) {
        inputImagen.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                nombreArchivo.textContent = e.target.files[0].name;
                nombreArchivo.style.color = "#000000";
                nombreArchivo.style.fontWeight = "600";
            } else {
                nombreArchivo.textContent = "Sin archivo seleccionado";
                nombreArchivo.style.color = "#4a4a4a";
                nombreArchivo.style.fontWeight = "normal";
            }
        });
    }

    // 4. A QUÍ VA EL ENVÍO DEL FORMULARIO (PETICIÓN PUT)
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita recargar la página

            if (!idParcela) {
                alert("Error: No se encontró el ID de la parcela.");
                return;
            }

            if (mensajeError) mensajeError.style.display = 'none';

            // Usamos FormData para enviar texto + archivo adjunto
            const formData = new FormData();
            formData.append('nombre', document.getElementById('input-nombre').value);
            formData.append('latitud', document.getElementById('input-latitud').value);
            formData.append('longitud', document.getElementById('input-longitud').value);
            
            const hectareasVal = document.getElementById('input-hectareas').value;
            if (hectareasVal) {
                formData.append('hectareas', hectareasVal);
            }

            // Solo agregamos la imagen si seleccionó una nueva
            if (inputImagen && inputImagen.files.length > 0) {
                formData.append('imagen', inputImagen.files[0]);
            }

            try {
                const respuesta = await fetch(`http://localhost:8000/api/v1/parcelas/${idParcela}`, {
                    method: 'PUT',
                    body: formData // Fetch asigna automáticamente el encabezado multipart/form-data
                });

                if (respuesta.ok) {
                    // Redirigimos al usuario a la lista principal
                    window.location.href = 'parcelas.html';
                } else {
                    const errorData = await respuesta.json().catch(() => ({}));
                    if (mensajeError) {
                        mensajeError.textContent = errorData.error || 'Error al actualizar la parcela.';
                        mensajeError.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error("Error en la petición PUT:", error);
                if (mensajeError) {
                    mensajeError.textContent = 'Error de conexión con el servidor.';
                    mensajeError.style.display = 'block';
                }
            }
        });
    }
});