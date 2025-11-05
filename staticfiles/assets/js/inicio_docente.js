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
    try {
        const res = await fetch("/obtener_notificaciones_docente/");
        const data = await res.json();
        const lista = document.getElementById("listaNotificaciones");
        lista.innerHTML = "";

        if (!data.success || !data.solicitudes || data.solicitudes.length === 0) {
        lista.innerHTML = `<li class="sin-solicitudes">No hay solicitudes nuevas.</li>`;
        return;
        }

        data.solicitudes.forEach((s) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${s.estudiante}</strong> pide retroalimentación en 
                <em>${s.asignatura}</em> (${s.sigla})<br>
                ${s.mensaje}
            </div>
            <div class="mt-2">
                <button class="btn btn-sm btn-primary responder-solicitud me-2" 
                        data-area="${s.area || ''}" 
                        data-asignatura="${s.asignatura}" 
                        data-sigla="${s.sigla}" 
                        data-estudiante="${s.estudiante}">
                    <i class="fas fa-reply"></i> Responder
                </button>
                <button class="btn btn-sm btn-danger mt-2 eliminar-solicitud" data-id="${s.id}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        `;
        lista.appendChild(li);
        });

        // Asignar eventos a los botones eliminar
        document.querySelectorAll(".eliminar-solicitud").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const confirm = await Swal.fire({
            title: "¿Eliminar solicitud?",
            text: "Esta solicitud se ocultará del listado.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            });
            if (confirm.isConfirmed) {
            const res = await fetch("/eliminar_solicitud/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_sretro: id }),
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire("Eliminada", "La solicitud fue eliminada correctamente.", "success");
                cargarNotificaciones(); // refrescar lista
            } else {
                Swal.fire("Error", data.error || "No se pudo eliminar", "error");
            }
            }
        });
        });

        // --- Evento para responder ---
        document.querySelectorAll(".responder-solicitud").forEach((btn) => {
            btn.addEventListener("click", () => {
                const area = encodeURIComponent(btn.dataset.area || "");
                const asignatura = encodeURIComponent(btn.dataset.asignatura || "");
                const sigla = encodeURIComponent(btn.dataset.sigla || "");
                const estudiante = encodeURIComponent(btn.dataset.estudiante || "");

                const url = `/retroalimentacion_docente/?area=${area}&asignatura=${asignatura}&sigla=${sigla}&estudiante=${estudiante}`;
                window.location.href = url;
            });
        });
    } catch (err) {
        console.error("Error cargando notificaciones:", err);
    }
    }
    cargarNotificaciones();
    setInterval(cargarNotificaciones, 1000);
/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN inicio_docente .JS ----------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */        