const formAgregar = document.getElementById('form-agregar-parcela');
const mensajeError = document.getElementById('mensaje-error');

if (formAgregar) {
    formAgregar.addEventListener('submit', async (e) => {
        // 1. Evitamos que la página se recargue
        e.preventDefault(); 
        
        // Limpiamos errores previos
        if (mensajeError) {
            mensajeError.style.display = 'none';
            mensajeError.innerText = "";
        }

        // 2. Recolectamos los datos de los inputs
        const nuevaParcela = {
            nombre: document.getElementById('input-nombre').value,
            latitud: parseFloat(document.getElementById('input-latitud').value), 
            longitud: parseFloat(document.getElementById('input-longitud').value),
        };

        // 3. Enviamos los datos al backend usando POST (Crear)
        try {
            const response = await fetch("http://localhost:8000/api/parcelas", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevaParcela)
            });

            // Si el backend responde que se creó correctamente (200 o 201)
            if (response.ok) {
                alert('¡Parcela creada con éxito!');
                window.location.href = 'parcelas.html'; 
            } else {
                // Mostramos el error si el backend rechaza la creación
                const errorData = await response.json();
                if (mensajeError) {
                    mensajeError.style.display = 'block';
                    mensajeError.innerText = errorData.mensaje || "Error al crear la parcela.";
                }
            }
        } catch (err) {
            console.error("Hubo un problema de conexión:", err);
            if (mensajeError) {
                mensajeError.style.display = 'block';
                mensajeError.innerText = "Error de conexión con el servidor. Verifica que el backend esté encendido.";
            }
        }
    });
}