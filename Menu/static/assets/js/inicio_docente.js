/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- INICIO inicio_docente .JS --------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    // SIN CODIGO

// TITULO BARRA LATERAL

    //personalizacion de tabs
    document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.personal-tab-btn');
    const tabSections = document.querySelectorAll('.personal-tab-section');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
        // Quitar clase 'active' de todos los botones
        tabButtons.forEach(b => b.classList.remove('active'));
        // Activar el botón clickeado
        btn.classList.add('active');

        // Mostrar la sección correspondiente
        const target = btn.dataset.target;
        tabSections.forEach(sec => {
            sec.style.display = (sec.id === target) ? 'block' : 'none';
        });
        });
    });
    });

    async function cargarNotificaciones() {
        const res = await fetch("/obtener_notificaciones_docente/");
        const data = await res.json();
        const lista = document.getElementById("listaNotificaciones");
        lista.innerHTML = "";

        if (!data.success || !data.solicitudes) {
            lista.innerHTML = `<li class="sin-solicitudes">No hay solicitudes nuevas.</li>`;
            return;
        }

        data.solicitudes.forEach(s => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${s.estudiante}</strong> pide retroalimentación en 
            <em>${s.asignatura}</em> (${s.sigla})<br>${s.mensaje}`;
            lista.appendChild(li);
        });
    }
    cargarNotificaciones();
    setInterval(cargarNotificaciones, 15000);
/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN inicio_docente .JS ----------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */        