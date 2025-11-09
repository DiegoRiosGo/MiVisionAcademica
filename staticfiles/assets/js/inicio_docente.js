/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- INICIO inicio_docente .JS --------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    // SIN CODIGO

// TITULO BARRA LATERAL

document.addEventListener('DOMContentLoaded', function () {
  // pestañas
  const tabPendientes = document.getElementById('tabPendientes');
  const tabDescartadas = document.getElementById('tabDescartadas');
  const tabFinalizadas = document.getElementById('tabFinalizadas');
  const lista = document.getElementById('listaNotificaciones');

  let estadoActual = 'pendiente'; // estado por defecto

  function setActiveTab(btn) {
    [tabPendientes, tabDescartadas, tabFinalizadas].forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  // listeners pestañas
  tabPendientes.addEventListener('click', () => { estadoActual = 'pendiente'; setActiveTab(tabPendientes); cargarSolicitudes(); });
  tabDescartadas.addEventListener('click', () => { estadoActual = 'eliminada'; setActiveTab(tabDescartadas); cargarSolicitudes(); });
  tabFinalizadas.addEventListener('click', () => { estadoActual = 'finalizada'; setActiveTab(tabFinalizadas); cargarSolicitudes(); });

  async function cargarSolicitudes() {
    try {
      const res = await fetch(`/obtener_solicitudes_docente/?estado=${encodeURIComponent(estadoActual)}`);
      const data = await res.json();
      lista.innerHTML = "";

      if (!data.success || !data.solicitudes || data.solicitudes.length === 0) {
        lista.innerHTML = `<li class="sin-solicitudes">No hay solicitudes (${estadoActual}).</li>`;
        return;
      }

      data.solicitudes.forEach((s) => {
        const li = document.createElement("li");
        li.className = "solicitud-item mb-2 p-2";

        // contenido base
        li.innerHTML = `
          <div>
            <strong>${s.estudiante}</strong> pide retroalimentación en 
            <em>${s.asignatura}</em> (${s.sigla})<br>
            <small class="text-muted">${new Date(s.creado_en).toLocaleString()}</small>
            <p class="mt-2">${s.mensaje}</p>
          </div>
        `;

        const controls = document.createElement('div');
        controls.className = 'mt-2';

        // comportamiento por estado:
        if (estadoActual === 'pendiente') {
          // Responder
          const btnResponder = document.createElement('button');
          btnResponder.className = 'btn btn-sm btn-primary me-2';
          btnResponder.innerHTML = '<i class="fas fa-reply"></i> Responder';
          btnResponder.addEventListener('click', () => {
            // pasar datos y redirigir a retroalimentacion_docente
            const area = encodeURIComponent(s.area || '');
            const asignatura = encodeURIComponent(s.asignatura || '');
            const sigla = encodeURIComponent(s.sigla || '');
            const estudiante = encodeURIComponent(s.estudiante || '');
            // si deseas pasar id_estudiante o id_sretro, puedes agregarlo
            const url = `/retroalimentacion_docente/?area=${area}&asignatura=${asignatura}&sigla=${sigla}&estudiante=${estudiante}&id_sretro=${s.id}`;
            window.location.href = url;
          });
          controls.appendChild(btnResponder);

          // Finalizar
          const btnFinalizar = document.createElement('button');
          btnFinalizar.className = 'btn btn-sm btn-success me-2';
          btnFinalizar.innerHTML = '<i class="fas fa-check"></i> Finalizar';
          btnFinalizar.addEventListener('click', async () => {
            const conf = await Swal.fire({
              title: '¿Marcar como finalizada?',
              text: 'La solicitud se moverá a Finalizadas.',
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Sí, finalizar'
            });
            if (!conf.isConfirmed) return;
            const resp = await fetch('/actualizar_estado_solicitud/', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ id_sretro: s.id, nuevo_estado: 'finalizada' })
            });
            const d = await resp.json();
            if (d.success) {
              Swal.fire('Finalizada', 'Solicitud marcada como finalizada.', 'success');
              cargarSolicitudes();
            } else {
              Swal.fire('Error', d.error || 'No se pudo finalizar', 'error');
            }
          });
          controls.appendChild(btnFinalizar);

          // Descartar
          const btnDescartar = document.createElement('button');
          btnDescartar.className = 'btn btn-sm btn-danger';
          btnDescartar.innerHTML = '<i class="fas fa-trash-alt"></i> Descartar';
          btnDescartar.addEventListener('click', async () => {
            const conf = await Swal.fire({
              title: '¿Descartar solicitud?',
              text: 'Se moverá a Descartadas (puedes restaurarla luego).',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, descartar'
            });
            if (!conf.isConfirmed) return;
            const resp = await fetch('/actualizar_estado_solicitud/', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ id_sretro: s.id, nuevo_estado: 'eliminada' })
            });
            const d = await resp.json();
            if (d.success) {
              Swal.fire('Descartada', 'Solicitud movida a descartadas.', 'success');
              cargarSolicitudes();
            } else {
              Swal.fire('Error', d.error || 'No se pudo descartar', 'error');
            }
          });
          controls.appendChild(btnDescartar);
        } else if (estadoActual === 'eliminada') {
          // Restaurar -> volver a pendiente
          const btnRestaurar = document.createElement('button');
          btnRestaurar.className = 'btn btn-sm btn-outline-primary';
          btnRestaurar.innerHTML = '<i class="fas fa-undo"></i> Restaurar';
          btnRestaurar.addEventListener('click', async () => {
            const resp = await fetch('/actualizar_estado_solicitud/', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ id_sretro: s.id, nuevo_estado: 'pendiente' })
            });
            const d = await resp.json();
            if (d.success) {
              Swal.fire('Restaurada', 'La solicitud vuelve a pendientes.', 'success');
              cargarSolicitudes();
            } else {
              Swal.fire('Error', d.error || 'No se pudo restaurar', 'error');
            }
          });
          controls.appendChild(btnRestaurar);
        } else if (estadoActual === 'finalizada') {
          // opcional: mostrar fecha finalizado, sin acciones
          const badge = document.createElement('span');
          badge.className = 'text-success small';
          badge.textContent = 'Finalizada';
          controls.appendChild(badge);
        }

        li.appendChild(controls);
        lista.appendChild(li);
      });
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      lista.innerHTML = `<li class="sin-solicitudes">Error cargando solicitudes.</li>`;
    }
  }

  // carga inicial
  setActiveTab(tabPendientes);
  cargarSolicitudes();
  // refrescar cada 10s solo la pestaña actual
  setInterval(cargarSolicitudes, 10000);
});
/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN inicio_docente .JS ----------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */        