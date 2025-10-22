/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- INICIO retroalimentacion_docente .JS -------------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    // SIN CODIGO

// TITULO BARRA LATERAL

    //personalizacion de tabs

    /*
        const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Semestre I','II','III','IV','V','VI','VII','VIII'],
            datasets: [{
            label: 'Notas por Semestre',
            data: [],
            borderColor: '#5d2fb2',
            backgroundColor: '#9c7fdc',
            fill: false
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
        });

        const radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: radarLabels,
            datasets: [{
            label: 'Certificados',
            data: [1, 2, 3, 4, 5, 6, 7],
            backgroundColor: 'rgba(124,96,186,0.5)',
            borderColor: '#7c60ba'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
        });
    */








document.addEventListener("DOMContentLoaded", () => {
  const areaSelect = document.getElementById("subjectSelect");       // en tu HTML es #subjectSelect
  // crea selects faltantes en el HTML o ajusta ids si los nombraste distinto:
  // <select id="asignaturaSelect">, <select id="siglaSelect">, <select id="studentSelect">
  const asignaturaSelect = document.getElementById("asignaturaSelect");
  const siglaSelect = document.getElementById("siglaSelect");
  const estudianteSelect = document.getElementById("studentSelect");
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackTextarea = document.getElementById("feedback");

  // helper CSRF (si usas cookies csrftoken)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  const csrftoken = getCookie('csrftoken');

  // Seguridad: comprueba existencia de elementos antes de operar
  if (areaSelect && asignaturaSelect) {
    areaSelect.addEventListener("change", async () => {
      const area = areaSelect.value;
      // limpiar selects dependientes
      asignaturaSelect.innerHTML = '<option value="">Cargando...</option>';
      siglaSelect && (siglaSelect.innerHTML = '<option value="">--</option>');
      estudianteSelect && (estudianteSelect.innerHTML = '<option value="">--</option>');

      try {
        const res = await fetch("/obtener_asignaturas/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
          },
          body: JSON.stringify({ area })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error al obtener asignaturas");
        asignaturaSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';
        data.asignaturas.forEach(a => {
          asignaturaSelect.innerHTML += `<option value="${a.asignatura_id}">${a.nombre_asignatura}</option>`;
        });
      } catch (err) {
        console.error("Error cargando asignaturas:", err);
        asignaturaSelect.innerHTML = '<option value="">Error cargando</option>';
      }
    });
  }

  if (asignaturaSelect && siglaSelect) {
    asignaturaSelect.addEventListener("change", async () => {
      const asignatura_id = asignaturaSelect.value;
      siglaSelect.innerHTML = '<option value="">Cargando...</option>';
      estudianteSelect && (estudianteSelect.innerHTML = '<option value="">--</option>');

      try {
        const res = await fetch("/obtener_siglas/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
          },
          body: JSON.stringify({ asignatura_id })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error al obtener siglas");
        siglaSelect.innerHTML = '<option value="">Seleccione una sigla</option>';
        data.siglas.forEach(s => {
          siglaSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });
      } catch (err) {
        console.error("Error cargando siglas:", err);
        siglaSelect.innerHTML = '<option value="">Error</option>';
      }
    });
  }

  if (siglaSelect && estudianteSelect) {
    siglaSelect.addEventListener("change", async () => {
      const sigla = siglaSelect.value;
      const asignatura_id = asignaturaSelect ? asignaturaSelect.value : null;
      estudianteSelect.innerHTML = '<option value="">Cargando...</option>';

      try {
        const res = await fetch("/obtener_estudiantes/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
          },
          body: JSON.stringify({ asignatura_id: asignatura_id || null, sigla: sigla || null })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error al obtener estudiantes");
        estudianteSelect.innerHTML = '<option value="">Seleccione estudiante</option>';
        data.estudiantes.forEach(e => {
          estudianteSelect.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
        });
      } catch (err) {
        console.error("Error cargando estudiantes:", err);
        estudianteSelect.innerHTML = '<option value="">Error</option>';
      }
    });
  }

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const estudiante_id = estudianteSelect ? estudianteSelect.value : null;
      const contenido = feedbackTextarea ? feedbackTextarea.value.trim() : "";
      if (!estudiante_id || !contenido) {
        Swal.fire("Atención", "Selecciona un estudiante y escribe la retroalimentación.", "warning");
        return;
      }
      // docente_id: si tienes el id del docente en el template, pásalo como variable
      const docente_id = feedbackForm.dataset.docenteId || null;

      try {
        const res = await fetch("/guardar_comentario_docente/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
          },
          body: JSON.stringify({
            docente_id: docente_id,
            estudiante_id: estudiante_id,
            contenido: contenido
          })
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("✅", "Retroalimentación enviada correctamente.", "success");
          feedbackTextarea.value = "";
        } else {
          Swal.fire("❌", data.error || "No se pudo guardar la retroalimentación.", "error");
        }
      } catch (err) {
        console.error("Error guardando retroalimentación:", err);
        Swal.fire("❌", "Ocurrió un error al enviar la retroalimentación.", "error");
      }
    });
  }
});


/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN retroalimentacion_docente .JS ----------------------------------------
   ------------------------------------------------------------------------------------------------------------- */
