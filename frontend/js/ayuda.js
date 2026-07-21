// Funcionalidad para abrir/cerrar acordeón de FAQ
function toggleFaq(element) {
const card = element.parentElement;
const isActive = card.classList.contains('is-active');

// Cerrar todos los demás activos para mantener orden
const activeCards = document.querySelectorAll('.faq-card.is-active');
activeCards.forEach(c => {
    if (c !== card) {
    c.classList.remove('is-active');
    }
});

// Alternar el actual
if (isActive) {
    card.classList.remove('is-active');
} else {
    card.classList.add('is-active');
}
}

// Buscador interactivo en tiempo real y filtrado por categoría
document.addEventListener('DOMContentLoaded', () => {
const searchInput = document.getElementById('faqSearch');
const filterButtons = document.querySelectorAll('.custom-tab');
const faqCards = document.querySelectorAll('.faq-card');
const noResults = document.getElementById('noResults');

let currentFilter = 'all';
let searchQuery = '';

// Función unificada de filtrado
function applyFilters() {
    let visibleCount = 0;

    faqCards.forEach(card => {
    const category = card.getAttribute('data-category');
    const textContent = card.innerText.toLowerCase();
    
    const matchesCategory = (currentFilter === 'all' || category === currentFilter);
    const matchesSearch = textContent.includes(searchQuery);

    if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
    } else {
        card.style.display = 'none';
        card.classList.remove('is-active'); // Cerrar si se oculta
    }
    });

    // Mostrar mensaje de sin resultados si corresponde
    if (visibleCount === 0) {
    noResults.style.display = 'block';
    } else {
    noResults.style.display = 'none';
    }
}

// Listener de Búsqueda
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    applyFilters();
});

// Listener de Botones de Filtro (Categorías)
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
    // Activar botón visualmente
    filterButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    currentFilter = btn.getAttribute('data-filter');
    applyFilters();
    });
});

// Toggle del menú hamburguesa en móviles
const burger = document.querySelector('.navbar-burger');
const menu = document.getElementById('navbarMenu');
if (burger && menu) {
    burger.addEventListener('click', () => {
    burger.classList.toggle('is-active');
    menu.classList.toggle('is-active');
    });
}
});

// Función unificada de envío de correo clásica (mailto)
function sendSupportMail() {
const nombre = document.getElementById('supportName').value.trim();
const emailUsuario = document.getElementById('supportEmail').value.trim();
const subjectSelect = document.getElementById('supportSubject').value;
const msg = document.getElementById('supportMsg').value.trim();
const toast = document.getElementById('toastNotification');

// Validaciones básicas de campos vacíos
if (nombre === '' || emailUsuario === '' || msg === '') {
    toast.className = "notification is-danger mt-3";
    toast.querySelector('span').innerText = "Por favor, completa todos los campos antes de continuar.";
    toast.style.display = 'block';
    return;
}

// Validación simple de estructura de correo
if (!emailUsuario.includes('@') || emailUsuario.length < 5) {
    toast.className = "notification is-danger mt-3";
    toast.querySelector('span').innerText = "Por favor, introduce un correo electrónico válido.";
    toast.style.display = 'block';
    return;
}

// Simular envío de forma visual avisando que se abrirá el correo
toast.className = "notification is-success mt-3";
toast.querySelector('span').innerText = `¡Abriendo tu cliente de correo para enviar a equipo.uno.aura@gmail.com!`;
toast.style.display = 'block';

// Configuración de los parámetros para el mailto
const correoSoporte = "equipo.uno.aura@gmail.com"; 
const asunto = encodeURIComponent(`Soporte AgroTech - [${subjectSelect}] de ${nombre}`);
const cuerpo = encodeURIComponent(
    `Hola equipo de AgroTech,\n\n` +
    `Has recibido una nueva consulta desde el formulario de soporte de la app:\n\n` +
    `Nombre: ${nombre}\n` +
    `Correo de contacto: ${emailUsuario}\n` +
    `Categoría del problema: ${subjectSelect}\n\n` +
    `Mensaje:\n${msg}\n\n` +
    `--- Enviado desde el panel de control agrícola.`
);

// Abrir el enlace mailto del cliente local del dispositivo tras un breve lapso
setTimeout(() => {
    window.location.href = `mailto:${correoSoporte}?subject=${asunto}&body=${cuerpo}`;
}, 1000);

// Limpiar formulario tras procesar la acción
document.getElementById('supportName').value = '';
document.getElementById('supportEmail').value = '';
document.getElementById('supportMsg').value = '';

// Ocultar notificación tras 6 segundos automáticamente
setTimeout(() => {
    hideToast();
}, 6000);
}

function hideToast() {
document.getElementById('toastNotification').style.display = 'none';
}