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
  const areaSelect = document.getElementById("subjectSelect");
  const asignaturaSelect = document.getElementById("asignaturaSelect");
  const siglaSelect = document.getElementById("siglaSelect");
  const estudianteSelect = document.getElementById("studentSelect");
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackTextarea = document.getElementById("feedback");
  const resetBtn = document.getElementById("resetFilters");

  // Gráficos globales
  let lineChart = null;
  let radarChart = null;

  // --- Helper CSRF ---
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
  const csrftoken = getCookie("csrftoken");

  // --- Función para resetear selects dependientes ---
  function resetDependentSelects(select, message = "--") {
    if (select) select.innerHTML = `<option value="">${message}</option>`;
  }

  // --- Función para limpiar gráficos ---
  function limpiarGraficos() {
    if (lineChart) {
      lineChart.destroy();
      lineChart = null;
    }
    if (radarChart) {
      radarChart.destroy();
      radarChart = null;
    }
  }

  // --- Cargar áreas al iniciar ---
  async function cargarAreas() {
    try {
      const res = await fetch("/obtener_areas/");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar áreas");
      areaSelect.innerHTML = '<option value="">Seleccione un área</option>';
      data.areas.forEach(a => {
        areaSelect.innerHTML += `<option value="${a}">${a}</option>`;
      });
    } catch (err) {
      console.error("Error cargando áreas:", err);
      areaSelect.innerHTML = '<option value="">Error cargando áreas</option>';
    }
  }
  if (areaSelect) cargarAreas();

  // --- Cargar asignaturas al cambiar el área ---
  if (areaSelect && asignaturaSelect) {
    areaSelect.addEventListener("change", async () => {
      const area = areaSelect.value;
      resetDependentSelects(asignaturaSelect, "Cargando...");
      resetDependentSelects(siglaSelect);
      resetDependentSelects(estudianteSelect);
      limpiarGraficos();

      if (!area) {
        asignaturaSelect.innerHTML = '<option value="">Seleccione un área primero</option>';
        return;
      }

      try {
        const res = await fetch("/obtener_asignaturas/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify({ area }),
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

  // --- Cargar siglas al cambiar asignatura ---
  if (asignaturaSelect && siglaSelect) {
    asignaturaSelect.addEventListener("change", async () => {
      const asignatura_id = asignaturaSelect.value;
      resetDependentSelects(siglaSelect, "Cargando...");
      resetDependentSelects(estudianteSelect);
      limpiarGraficos();

      if (!asignatura_id) {
        siglaSelect.innerHTML = '<option value="">Seleccione asignatura primero</option>';
        return;
      }

      try {
        const res = await fetch("/obtener_siglas/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify({ asignatura_id }),
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

  // --- Cargar estudiantes al cambiar sigla ---
  if (siglaSelect && estudianteSelect) {
    siglaSelect.addEventListener("change", async () => {
      const sigla = siglaSelect.value;
      const asignatura_id = asignaturaSelect ? asignaturaSelect.value : null;
      resetDependentSelects(estudianteSelect, "Cargando...");
      limpiarGraficos();

      if (!sigla) {
        estudianteSelect.innerHTML = '<option value="">Seleccione una sigla primero</option>';
        return;
      }

      try {
        const res = await fetch("/obtener_estudiantes/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify({ asignatura_id: asignatura_id || null, sigla: sigla || null }),
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

  // --- Cargar gráficos al seleccionar estudiante ---
  if (estudianteSelect) {
    estudianteSelect.addEventListener("change", async () => {
      const estudiante_id = estudianteSelect.value;
      const area = areaSelect.value;

      limpiarGraficos();

      if (!estudiante_id || !area) return;

      try {
        const res = await fetch(`/obtener_notas_estudiante_area/?estudiante_id=${estudiante_id}&area=${encodeURIComponent(area)}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error al obtener notas");

        const etiquetas = data.notas.map(n => n.nombre_asignatura);
        const valores = data.notas.map(n => n.calificacion);

        // --- Gráfico de línea ---
        const ctxLine = document.getElementById("lineChartSubject").getContext("2d");
        lineChart = new Chart(ctxLine, {
          type: "line",
          data: {
            labels: etiquetas,
            datasets: [{
              label: "Evolución de notas",
              data: valores,
              borderColor: "#007bff",
              backgroundColor: "rgba(0,123,255,0.1)",
              tension: 0.3,
              fill: true
            }]
          },
          options: { responsive: true, scales: { y: { beginAtZero: true, max: 7 } } }
        });

        // --- Gráfico de radar ---
        const ctxRadar = document.getElementById("radarChartSubject").getContext("2d");
        radarChart = new Chart(ctxRadar, {
          type: "radar",
          data: {
            labels: etiquetas,
            datasets: [{
              label: "Desempeño por asignatura",
              data: valores,
              borderColor: "#28a745",
              backgroundColor: "rgba(40,167,69,0.2)",
            }]
          },
          options: { responsive: true, scales: { r: { min: 0, max: 7 } } }
        });

      } catch (err) {
        console.error("Error generando gráficos:", err);
      }
    });
  }

  // --- Restablecer filtros ---
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      areaSelect.selectedIndex = 0;
      resetDependentSelects(asignaturaSelect, "Seleccione asignatura");
      resetDependentSelects(siglaSelect, "Seleccione sigla");
      resetDependentSelects(estudianteSelect, "Seleccione estudiante");
      feedbackTextarea.value = "";
      limpiarGraficos();
    });
  }

  // --- Enviar retroalimentación ---
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const docente_id = feedbackForm.dataset.docenteId || null;
      const estudiante_id = estudianteSelect ? estudianteSelect.value : null;
      const contenido = feedbackTextarea ? feedbackTextarea.value.trim() : "";

      if (!docente_id || !estudiante_id || !contenido) {
        Swal.fire("Atención", "Selecciona todos los campos y escribe la retroalimentación.", "warning");
        return;
      }

      try {
        const res = await fetch("/guardar_comentario_docente/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify({ docente_id, estudiante_id, contenido }),
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
