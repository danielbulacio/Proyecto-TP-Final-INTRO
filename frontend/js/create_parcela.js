
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

            // Adjuntamos hectáreas si el usuario ingresó un valor
            const inputHectareas = document.getElementById('input-hectareas');
            if (inputHectareas && inputHectareas.value) {
                formData.append('hectareas', inputHectareas.value);
            }

            // Adjuntamos la imagen si el usuario subió una
            if (inputImagen && inputImagen.files.length > 0) {
                formData.append('imagen', inputImagen.files[0]);
            }
            // Enviamos la solicitud POST al servidor
            try {
                const respuesta = await fetch('http://localhost:8000/api/v1/parcelas', {
                    method: 'POST', // Método POST para crear una nueva parcela
                    body: formData // No necesitamos establecer 'Content-Type' ya que FormData lo maneja automáticamente
                });

                if (respuesta.ok) {
                    const nueva = await respuesta.json(); // formateamos como un json la respuesta
                    // cuando el usuario crea la pagina lo rederigimos de create parcelas html a parcelas html
                    window.location.href = 'parcelas.html';
                    // disparamos la insercion de datos del clima
                    await fetch(`http://localhost:8000/api/v1/parcelas/detalle/${nueva.id}/clima`, {
                        method: "POST"
                    });
                    
                    
                } else { // Si la respuesta no es exitosa, mostramos el error
                    const errorData = await respuesta.json().catch(() => ({}));
                    if (mensajeError) {
                        mensajeError.textContent = errorData.error || 'Error al crear la parcela.';
                        mensajeError.style.display = 'block';
                    }
                }
            } catch (error) { // Capturamos errores de red u otros problemas
                console.error("Error en la petición POST:", error);
                if (mensajeError) {
                    mensajeError.textContent = 'Error de conexión con el servidor.';
                    mensajeError.style.display = 'block';
                }
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    // inicializamos el mapa usando Leaflet
    // centrado en Argentina por defecto
    // Centramos por defecto en el centro de Argentina (aprox) con un zoom nivel 5
    const mapa = L.map('mapa-parcela').setView([-34.0, -64.0], 5);
    
    // Cargamos el diseño del mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapa);

    let marcador = null; // Variable para guardar el pin

    // Función para actualizar el pin en el mapa
    function actualizarMarcador(lat, lng) {
        if (marcador) {
            marcador.setLatLng([lat, lng]); // Mueve el pin si ya existe
        } else {
            marcador = L.marker([lat, lng]).addTo(mapa); // Crea el pin si no existe
        }
        mapa.setView([lat, lng], 13); // Acerca el zoom a la ubicación
    }

    // evento click en el mapa para obtener latitud y longitud
    mapa.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6); // Extraemos latitud con 6 decimales
        const lng = e.latlng.lng.toFixed(6); // Extraemos longitud con 6 decimales

        // Escribimos los valores en tus inputs
        document.getElementById('input-latitud').value = lat;
        document.getElementById('input-longitud').value = lng;

        // Ponemos el pin donde el usuario hizo clic
        actualizarMarcador(lat, lng);
    });
});
