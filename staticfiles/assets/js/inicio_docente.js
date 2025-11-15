/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- INICIO inicio_docente .JS --------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    // SIN CODIGO

// TITULO BARRA LATERAL

document.addEventListener('DOMContentLoaded', function () {
  const tabPendientes = document.getElementById('tabPendientes');
  const tabDescartadas = document.getElementById('tabDescartadas');
  const tabFinalizadas = document.getElementById('tabFinalizadas');
  const lista = document.getElementById('listaNotificaciones');

  let estadoActual = 'pendiente';
  let cargando = false;
  let cacheSolicitudes = []; // 🔹 cache local para comparar cambios

  function setActiveTab(btn) {
    [tabPendientes, tabDescartadas, tabFinalizadas].forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  function mostrarCargando() {
    lista.innerHTML = `
      <li class="sin-solicitudes text-center text-muted" style="padding: 20px;">
        <div class="spinner-border violeta" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando solicitudes (${estadoActual})...</p>
      </li>
    `;
  }

  // listeners pestañas
  tabPendientes.addEventListener('click', () => cambiarEstado('pendiente', tabPendientes));
  tabDescartadas.addEventListener('click', () => cambiarEstado('eliminada', tabDescartadas));
  tabFinalizadas.addEventListener('click', () => cambiarEstado('finalizada', tabFinalizadas));

  // 🔹 Comparar si hay cambios reales antes de recargar
  function hayCambios(nuevas, antiguas) {
    if (nuevas.length !== antiguas.length) return true;
    for (let i = 0; i < nuevas.length; i++) {
      if (nuevas[i].id !== antiguas[i].id || nuevas[i].estado !== antiguas[i].estado) {
        return true;
      }
    }
    return false;
  }

  async function cambiarEstado(estado, boton) {
    if (cargando) return;
    estadoActual = estado;
    setActiveTab(boton);
    await cargarSolicitudes(true); // loader visible solo en cambio manual
  }

  async function cargarSolicitudes(showLoader = false) { //forceRefresh 
    try {
      cargando = true;
      if (showLoader) mostrarCargando();

      const res = await fetch(`/obtener_solicitudes_docente/?estado=${encodeURIComponent(estadoActual)}`);
      const data = await res.json();

      const nuevasSolicitudes = (data.solicitudes || []).sort((a, b) => b.id - a.id);

      // 🔹 Si no hay cambios, no tocar el DOM
      if (!hayCambios(nuevasSolicitudes, cacheSolicitudes)) {
        cargando = false;
        return;
      }

      cacheSolicitudes = nuevasSolicitudes;
      lista.innerHTML = "";

      if (!data.success || nuevasSolicitudes.length === 0) {
        lista.innerHTML = `<li class="sin-solicitudes">No hay solicitudes (${estadoActual}).</li>`;
        cargando = false;
        return;
      }

      nuevasSolicitudes.forEach((s) => {
        const li = document.createElement("li");
        li.className = "solicitud-item mb-2 p-2 fade-in";

        let contenidoHTML = `<div>`;

        // 🟣 Caso 1: Comentario libre (tipo = comentario)
        if (s.tipo === "comentario") {

            contenidoHTML += `
                <strong>Comentario libre enviado por el docente</strong><br>
                <em>${s.asignatura}</em> (${s.sigla})<br>
                <small class="text-muted">${new Date(s.creado_en).toLocaleString()}</small>

                <div class="mt-3 p-2 bg-light rounded border">
                  <strong>Contenido del comentario:</strong>
                  <blockquote class="mb-0 text-secondary" style="font-style: italic;">
                    ${s.respuesta}
                  </blockquote>
                </div>
            `;

        } else {

            // 🟩 Caso 2: Solicitud tradicional del estudiante
            contenidoHTML += `
                <strong>${s.estudiante}</strong> pidió retroalimentación en 
                <em>${s.asignatura}</em> (${s.sigla})<br>
                <small class="text-muted">${new Date(s.creado_en).toLocaleString()}</small>
                <p class="mt-2">${s.mensaje}</p>
            `;

            if (estadoActual === "finalizada" && s.respuesta) {
                contenidoHTML += `
                  <div class="mt-3 p-2 bg-light rounded border">
                    <strong>Respuesta enviada:</strong>
                    <blockquote class="mb-0 text-secondary" style="font-style: italic;">
                      ${s.respuesta}
                    </blockquote> 
                  </div>
                `;
            }
        }

        if (estadoActual === 'pendiente') {
          const btnResponder = document.createElement('button');
          btnResponder.className = 'btn btn-sm btn-responder';
          btnResponder.innerHTML = '<i class="fas fa-reply"></i> Responder';
          btnResponder.addEventListener('click', () => {
            const area = encodeURIComponent(s.area || '');
            const asignatura = encodeURIComponent(s.asignatura || '');
            const sigla = encodeURIComponent(s.sigla || '');
            const estudiante = encodeURIComponent(s.estudiante || '');
            const url = `/retroalimentacion_docente/?id_sretro=${s.id}&area=${area}&asignatura=${asignatura}&sigla=${sigla}&estudiante=${estudiante}`;
            window.location.href = url;
          });
          controls.appendChild(btnResponder);

          const btnDescartar = document.createElement('button');
          btnDescartar.className = 'btn btn-sm btn-descartar';
          btnDescartar.innerHTML = '<i class="fas fa-trash-alt"></i> Descartar';

          btnDescartar.addEventListener('click', async () => {

            const { value: motivo } = await Swal.fire({
              title: "Motivo del descarte",
              input: "textarea",
              inputLabel: "Explica brevemente por qué descartas esta solicitud",
              inputPlaceholder: "Escribe el motivo...",
              inputAttributes: { "aria-label": "Motivo" },
              showCancelButton: true,
              confirmButtonText: "Descartar",
              cancelButtonText: "Cancelar",
              inputValidator: (value) => {
                if (!value || value.trim().length < 3) {
                  return "Debes ingresar un motivo válido.";
                }
              }
            });

            if (!motivo) return;

            const resp = await fetch('/actualizar_estado_solicitud/', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id_sretro: s.id,
                nuevo_estado: 'eliminada',
                motivo: motivo.trim()
              })
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
          const btnRestaurar = document.createElement('button');
          
          if (estadoActual === "eliminada" && s.respuesta) {
            contenidoHTML += `
                <div class="mt-3 p-2 bg-light rounded border border-danger">
                    <strong>Motivo del descarte:</strong>
                    <blockquote class="mb-0 text-danger" style="font-style: italic;">
                        ${s.respuesta}
                    </blockquote> 
                </div>
            `;
          }

          btnRestaurar.className = 'btn btn-sm btn-responder';
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
          const badge = document.createElement('span');
          badge.className = 'text-success small';
          badge.textContent = 'Finalizada';
          controls.appendChild(badge);
        }

        li.appendChild(controls);
        lista.appendChild(li);
      });

      cargando = false;
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      cargando = false;
    }
  }

  setActiveTab(tabPendientes);
  cargarSolicitudes(true);

  // 🔹 actualización silenciosa cada 10s
  setInterval(() => {
    if (!cargando) cargarSolicitudes(false);
  }, 10000);
});
/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN inicio_docente .JS ----------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */        