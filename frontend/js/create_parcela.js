// Este código va en el JS de tu NUEVA página

const formAgregar = document.getElementById('form-agregar-parcela');

if (formAgregar) {
    formAgregar.addEventListener('submit', async (e) => {
        // 1. IMPORTANTE: Evitamos que la página se recargue al enviar el formulario
        e.preventDefault(); 

        // 2. Recolectamos los datos de los inputs
        const nuevaParcela = {
            nombre: document.getElementById('input-nombre').value,
            latitud: parseFloat(document.getElementById('input-latitud').value), 
            longitud: parseFloat(document.getElementById('input-longitud').value),
        };

        // 3. Enviamos los datos al backend
        try {
            const response = await fetch("http://localhost:8000/api/parcelas", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevaParcela)
            });

            if (response.status === 201 || response.status === 200) {
                window.location.href = 'parcelas.html'; // Ajusta al nombre de tu página principal
            } else {
                // Mostramos el error en pantalla si algo falló
                const errorMsg = document.getElementById("mensaje-error");
                errorMsg.textContent = "Error al guardar: " + response.statusText;
            }
        } catch (err) {
            console.error("Hubo un problema de conexión:", err);
            document.getElementById("mensaje-error").textContent = "Error de conexión con el servidor.";
        }
    });
}