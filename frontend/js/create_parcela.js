document.addEventListener("DOMContentLoaded", () => {
    const formAgregar = document.getElementById('form-agregar-parcela');
    const inputImagen = document.getElementById("input-imagen");
    const nombreArchivo = document.getElementById("nombre-archivo");
    const mensajeError = document.getElementById("mensaje-error");

    // 1. Mostrar dinámicamente el nombre de la imagen seleccionada
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

    // 2. Procesar el envío del formulario (POST)
    if (formAgregar) {
        formAgregar.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita recargar la página

            if (mensajeError) mensajeError.style.display = 'none';

            // Empaquetamos los datos del formulario con FormData
            const formData = new FormData();
            formData.append('nombre', document.getElementById('input-nombre').value);
            formData.append('latitud', document.getElementById('input-latitud').value);
            formData.append('longitud', document.getElementById('input-longitud').value);

            const inputHectareas = document.getElementById('input-hectareas');
            if (inputHectareas && inputHectareas.value) {
                formData.append('hectareas', inputHectareas.value);
            }

            // Adjuntamos la imagen si el usuario subió una
            if (inputImagen && inputImagen.files.length > 0) {
                formData.append('imagen', inputImagen.files[0]);
            }

            try {
                const respuesta = await fetch('http://localhost:8000/api/parcelas', {
                    method: 'POST',
                    body: formData
                });

                if (respuesta.ok) {
                    // Redirigimos al listado principal de parcelas al guardar con éxito
                    window.location.href = 'parcelas.html';
                } else {
                    const errorData = await respuesta.json().catch(() => ({}));
                    if (mensajeError) {
                        mensajeError.textContent = errorData.error || 'Error al crear la parcela.';
                        mensajeError.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error("Error en la petición POST:", error);
                if (mensajeError) {
                    mensajeError.textContent = 'Error de conexión con el servidor.';
                    mensajeError.style.display = 'block';
                }
            }
        });
    }
});