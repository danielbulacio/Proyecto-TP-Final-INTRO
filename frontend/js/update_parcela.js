// =================================================================
// 1. CARGAR LOS DATOS CUANDO SE ABRE LA PÁGINA
// =================================================================
document.addEventListener("DOMContentLoaded", async () => {
    // Obtenemos el ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParcela = urlParams.get('id');

    // Si hay un ID, buscamos los datos de esa parcela en el backend
    if (idParcela) {
        try {
            const respuesta = await fetch(`http://localhost:8000/api/parcelas/${idParcela}`);
            
            if (respuesta.ok) {
                const parcela = await respuesta.json();
                
                // Rellenamos los inputs
                document.getElementById('input-nombre').value = parcela.nombre;
                document.getElementById('input-latitud').value = parcela.latitud;
                document.getElementById('input-longitud').value = parcela.longitud;
                
                console.log("Datos cargados exitosamente en el formulario:", parcela);
            } else {
                console.error("No se pudo cargar la parcela para editarla.");
            }
        } catch (error) {
            console.error("Error al obtener los datos de la parcela:", error);
        }
    }
});

// =================================================================
// 2. INTERCEPTAR EL BOTÓN "GUARDAR" (¡ESTO ES LO QUE FALTABA!)
// =================================================================
const formularioEditar = document.getElementById('form-editar-parcela');

if (formularioEditar) {
    formularioEditar.addEventListener('submit', async (e) => {
        // ¡ESTO EVITA QUE LA PÁGINA SE RECARGUE Y SE BORREN LOS CAMPOS!
        e.preventDefault(); 

        const urlParams = new URLSearchParams(window.location.search);
        const idParcela = urlParams.get('id');

        if (!idParcela) {
            console.error("Falta el ID en la URL.");
            return;
        }

        // Capturamos los datos actuales de los inputs
        const datosActualizados = {
            nombre: document.getElementById('input-nombre').value,
            latitud: parseFloat(document.getElementById('input-latitud').value),
            longitud: parseFloat(document.getElementById('input-longitud').value)
        };

        // Llamamos a la función que se comunica con el backend
        await updateParcela(idParcela, datosActualizados);
    });
}

// =================================================================
// 3. ENVIAR LOS DATOS AL BACKEND (Tu función intacta)
// =================================================================
async function updateParcela(id, datosActualizados) {
    console.log("Datos que se están enviando al backend:", datosActualizados);

    try {
        const response = await fetch(`http://localhost:8000/api/parcelas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            console.log("Parcela actualizada con éxito");
            alert("Parcela actualizada con éxito!");
            window.location.href = 'parcelas.html'; 
        } else {
            const errorData = await response.json().catch(() => ({})); 
            console.error("El backend rechazó los datos (400). Razón:", errorData);

            const errorElement = document.getElementById("mensaje-error");
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = "Error del servidor: " + (errorData.message || response.statusText);
            } else {
                alert("Error al actualizar la parcela. Revisa la consola.");
            }
        }
    } catch (err) {
        console.error("Hubo un problema de conexión:", err);
        const errorElement = document.getElementById("mensaje-error");
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = "Error de conexión con el servidor.";
        }
    }
}