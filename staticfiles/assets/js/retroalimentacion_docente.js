/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- INICIO retroalimentacion_docente .JS -------------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    // SIN CODIGO

// TITULO BARRA LATERAL

    //personalizacion de tabs

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
  
  // --- Autocompletar si vienen datos por URL ---
  const params = new URLSearchParams(window.location.search);
  const areaParam = params.get("area");
  const asignaturaParam = params.get("asignatura");
  const siglaParam = params.get("sigla");
  const estudianteParam = params.get("estudiante");

  async function precargarCampos() {
    if (areaParam) {
      await cargarAreas();
      await new Promise(r => setTimeout(r, 600));
      if ([...areaSelect.options].some(opt => opt.value === areaParam)) {
        areaSelect.value = areaParam;
      }

      // Cargar asignaturas de esa área
      const resA = await fetch("/obtener_asignaturas/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
        body: JSON.stringify({ area: areaParam }),
      });
      const dataA = await resA.json();
      if (dataA.success) {
        asignaturaSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';
        dataA.asignaturas.forEach(a => {
          const selected = a.nombre_asignatura === asignaturaParam ? "selected" : "";
          asignaturaSelect.innerHTML += `<option value="${a.asignatura_id}" ${selected}>${a.nombre_asignatura}</option>`;
        });
      }

      await new Promise(r => setTimeout(r, 300));

      // Cargar siglas de la asignatura seleccionada
      if (asignaturaSelect.value) {
        const resS = await fetch("/obtener_siglas/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify({ asignatura_id: asignaturaSelect.value }),
        });
        const dataS = await resS.json();
        if (dataS.success) {
          siglaSelect.innerHTML = '<option value="">Seleccione una sigla</option>';
          dataS.siglas.forEach(s => {
            const selected = s === siglaParam ? "selected" : "";
            siglaSelect.innerHTML += `<option value="${s}" ${selected}>${s}</option>`;
          });
        }
      }
    }

    // Estudiante
    if (estudianteParam) {
      // Cargar estudiantes reales si hay sigla seleccionada
      if (siglaParam && asignaturaSelect.value) {
        try {
          const resE = await fetch("/obtener_estudiantes/", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
            body: JSON.stringify({
              asignatura_id: asignaturaSelect.value,
              sigla: siglaParam
            }),
          });
          const dataE = await resE.json();

          if (dataE.success && dataE.estudiantes.length > 0) {
            estudianteSelect.innerHTML = '<option value="">Seleccione estudiante</option>';

            dataE.estudiantes.forEach(e => {
              const selected = e.nombre === estudianteParam ? "selected" : "";
              estudianteSelect.innerHTML += `<option value="${e.id}" ${selected}>${e.nombre}</option>`;
            });
          }
        } catch (err) {
          console.error("Error cargando estudiantes en precarga:", err);
        }
      } else {
        // Si no hay sigla, al menos mostrar el nombre temporalmente
        estudianteSelect.innerHTML = `<option value="">${estudianteParam}</option>`;
      }

      // Obtener el ID real del estudiante seleccionado
      const estudiante_id = estudianteSelect.value;
      const area = areaParam;

      limpiarGraficos();

      if (!estudiante_id || !area) return;

      try {
        const res = await fetch(
          `/obtener_notas_estudiante_area/?estudiante_id=${estudiante_id}&area=${encodeURIComponent(area)}`
        );
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
              borderColor: '#5d2fb2',
              backgroundColor: '#9c7fdc',
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
              backgroundColor: 'rgba(124,96,186,0.5)',
              borderColor: '#7c60ba'
            }]
          },
          options: { responsive: true, scales: { r: { min: 2, max: 7 } } }
        });

      } catch (err) {
        console.error("Error generando gráficos precargados:", err);
      }
    }

  }

  precargarCampos();

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

      // Filtramos para evitar “sin asignatura”
      const notasValidas = data.notas.filter(n => n.nombre_asignatura && n.nombre_asignatura.toLowerCase() !== "sin asignatura");

      const etiquetas = notasValidas.map(n => n.nombre_asignatura);
      const valores = notasValidas.map(n => n.calificacion);
      const promedios = notasValidas.map(n => n.promedio_general || 0); // se usará si backend entrega promedio general

      // 🔹 Escala automática para el gráfico de línea
      const minY = Math.min(...valores, ...promedios) - 0.3;
      const maxY = Math.max(...valores, ...promedios) + 0.3;

      
      // --- Gráfico de línea (Evolución del estudiante + promedio general) ---
      const ctxLine = document.getElementById("lineChartSubject").getContext("2d");
      lineChart = new Chart(ctxLine, {
        type: "line",
        data: {
          labels: etiquetas.map((e, i) => `${e} (${valores[i]})`),
          datasets: [
            {
              label: "Evolución del estudiante",
              data: valores,
              borderColor: "#5d2fb2",
              backgroundColor: "rgba(93,47,178,0.2)",
              tension: 0.3,
              fill: true,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
            {
              label: "Promedio general",
              data: promedios,
              borderColor: "#b39ddb",
              backgroundColor: "rgba(179,157,219,0.1)",
              borderDash: [5, 5],
              tension: 0.3,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              labels: { boxWidth: 15, color: "#333" }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: minY > 2 ? minY : 2,
              max: maxY < 7 ? maxY : 7,
              title: { display: true, text: "Calificación" }
            },
            x: {
              title: { display: true, text: "Asignaturas" }
            }
          }
        }
      });

      // --- Gráfico de radar (Desempeño por asignatura) ---
      const ctxRadar = document.getElementById("radarChartSubject").getContext("2d");

      // 🔹 Si hay 2 o menos elementos → agregar datos ficticios
      const cantidadNecesaria = 3;
      if (etiquetas.length < cantidadNecesaria) {
          const faltantes = cantidadNecesaria - etiquetas.length;
          for (let i = 1; i <= faltantes; i++) {
              etiquetas.push(`Valor adicional ${i}`);
              valores.push(7);  // valor ficticio para completar la figura
          }
      }

      radarChart = new Chart(ctxRadar, {
        type: "radar",
        data: {
          labels: etiquetas.map((e, i) => `${e} (${valores[i]})`),
          datasets: [{
            label: "Desempeño por asignatura",
            data: valores,
            backgroundColor: "rgba(124,96,186,0.5)",
            borderColor: "#7c60ba",
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              min: 2,
              max: 7,
              ticks: { display: false }, // 🔹 Oculta los números de escala
              grid: { color: "rgba(0,0,0,0.1)" },
              angleLines: { color: "rgba(0,0,0,0.1)" },
              pointLabels: {
                font: { size: 12 },
                color: "#333"
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
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

      const docente_id = feedbackForm.dataset.docenteId;
      const estudiante_id = estudianteSelect?.value;
      const asignatura_id = asignaturaSelect?.value;
      const contenido = feedbackTextarea?.value.trim();
      const id_sretro = document.getElementById("id_sretro")?.value || null;
      const sigla = siglaSelect?.value || null;
      
      if (!docente_id || !estudiante_id || !contenido || !asignatura_id) {
        Swal.fire("Atención", "Completa todos los campos antes de enviar.", "warning");
        return;
      }

      const csrftoken = getCookie("csrftoken");

      // Si existe id_sretro → respuesta formal
      const url = id_sretro ? "/enviar_retroalimentacion/" : "/guardar_comentario_docente/";

      const bodyData = id_sretro
        ? { id_sretro, respuesta: contenido } // respuesta formal
        : { docente_id, estudiante_id, contenido, asignatura_id, sigla  }; // comentario libre

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
          body: JSON.stringify(bodyData),
        });


        const data = await res.json();
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: id_sretro ? "Respuesta enviada correctamente." : "Comentario guardado con éxito.",
            timer: 2500,
            showConfirmButton: false
          });

          // ✅ Limpiar todos los campos del formulario
          feedbackTextarea.value = "";
          document.getElementById("id_sretro").value = "";

          if (areaSelect) areaSelect.selectedIndex = 0;
          if (asignaturaSelect) resetDependentSelects(asignaturaSelect, "Seleccione asignatura");
          if (siglaSelect) resetDependentSelects(siglaSelect, "Seleccione sigla");
          if (estudianteSelect) resetDependentSelects(estudianteSelect, "Seleccione estudiante");

          limpiarGraficos();
        } else {
          Swal.fire("❌", data.error || "Error al guardar la retroalimentación.", "error");
        }
      } catch (err) {
        console.error("Error:", err);
        Swal.fire("❌", "Error inesperado al enviar la retroalimentación.", "error");
      }
    });
  }
});



/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN retroalimentacion_docente .JS ----------------------------------------
   ------------------------------------------------------------------------------------------------------------- */
