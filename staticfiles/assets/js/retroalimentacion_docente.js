/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- INICIO retroalimentacion_docente .JS -------------------------------------
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


        const sectionSelect = document.getElementById('sectionSelect');
        const subjectSelect = document.getElementById('subjectSelect');
        const studentSelect = document.getElementById('studentSelect');
        const feedbackForm = document.getElementById('feedbackForm');
        const feedbackInput = document.getElementById('feedback');
        const popup = document.getElementById('confirmationPopup');

        // Datos simulados por sección, asignatura y estudiante
        const studentData = {
        "001D": {
            "ITadori": {
            programacion: [5.2, 5.5, 5.8, 6.0, 6.2, 6.5, 6.8, 7.0],
            inteligencia: [4.8, 5.0, 5.3, 5.6, 5.9, 6.1, 6.4, 6.7],
            gestion: [5.0, 5.3, 5.6, 5.9, 6.1, 6.4, 6.7, 7.0],
            calidad: [5.5, 5.7, 5.9, 6.2, 6.4, 6.6, 6.8, 7.0],
            modelos: [5.1, 5.4, 5.7, 6.0, 6.3, 6.6, 6.9, 7.0],
            arquitectura: [4.9, 5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7.0],
            analisis: [5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0, 7.0]
            },
            "Maki": {
            programacion: [4.5, 4.8, 5.1, 5.4, 5.7, 6.0, 6.3, 6.6],
            inteligencia: [5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0],
            gestion: [4.8, 5.1, 5.4, 5.7, 6.0, 6.3, 6.6, 6.9],
            calidad: [5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7.0, 7.0],
            modelos: [4.9, 5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7.0],
            arquitectura: [5.1, 5.4, 5.7, 6.0, 6.3, 6.6, 6.9, 7.0],
            analisis: [4.7, 5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8]
            }
        },
        "001V": {
            "Toji": {
            programacion: [5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0],
            inteligencia: [4.5, 4.8, 5.1, 5.4, 5.7, 6.0, 6.3, 6.6],
            gestion: [5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7.0, 7.0],
            calidad: [4.8, 5.1, 5.4, 5.7, 6.0, 6.3, 6.6, 6.9],
            modelos: [5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0],
            arquitectura: [4.6, 4.9, 5.2, 5.5, 5.8, 6.1, 6.4, 6.7],
            analisis: [5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0, 7.0]
            },
            "Hinata": {
            programacion: [4.2, 4.5, 4.8, 5.1, 5.4, 5.7, 6.0, 6.3],
            inteligencia: [5.1, 5.4, 5.7, 6.0, 6.3, 6.6, 6.9, 7.0],
            gestion: [4.9, 5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7.0],
            calidad: [5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.0],
            modelos: [4.7, 5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8],
            arquitectura: [5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7.0, 7.0],
            analisis: [4.6, 4.9, 5.2, 5.5, 5.8, 6.1, 6.4, 6.7]
            }
        }
        };

        // Radar fijo por certificados
        const radarLabels = [
        'Análisis y Planificación de Requerimientos Informáticos',
        'Calidad de Software',
        'Gestión de Proyectos Informáticos',
        'Programación de Software',
        'Inteligencia de Negocios',
        'Modelos de Datos',
        'Arquitectura de Software'
        ];

        const lineCtx = document.getElementById('lineChartSubject').getContext('2d');
        const radarCtx = document.getElementById('radarChartSubject').getContext('2d');

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

        function updateStudentOptions() {
        const section = sectionSelect.value;
        studentSelect.innerHTML = '';
        Object.keys(studentData[section]).forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            studentSelect.appendChild(opt);
        });
        updateCharts();
        }

        function updateCharts() {
        const section = sectionSelect.value;
        const student = studentSelect.value;
        const subject = subjectSelect.value;

        if (!studentData[section][student] || !studentData[section][student][subject]) return;

        const lineData = studentData[section][student][subject];
        lineChart.data.datasets[0].data = lineData;
        lineChart.update();
        }

        sectionSelect.addEventListener('change', updateStudentOptions);
        subjectSelect.addEventListener('change', updateCharts);
        studentSelect.addEventListener('change', updateCharts);

        feedbackForm.addEventListener('submit', e => {
        e.preventDefault();
        popup.style.display = 'block';
        setTimeout(() => { popup.style.display = 'none'; }, 2000);
        feedbackInput.value = '';
        });

        updateStudentOptions();




        
document.addEventListener("DOMContentLoaded", () => {
  const areaSelect = document.getElementById("subjectSelect");
  const asignaturaSelect = document.getElementById("asignaturaSelect");
  const siglaSelect = document.getElementById("siglaSelect");
  const estudianteSelect = document.getElementById("studentSelect");
  const feedbackForm = document.getElementById("feedbackForm");

  // 🔹 Cargar asignaturas según área
  areaSelect.addEventListener("change", async () => {
    const area = areaSelect.value;
    const res = await fetch("/obtener_asignaturas/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ area })
    });
    const data = await res.json();
    asignaturaSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';
    data.asignaturas.forEach(a => {
      asignaturaSelect.innerHTML += `<option value="${a.asignatura_id}">${a.nombre_asignatura}</option>`;
    });
  });

  // 🔹 Cargar siglas según asignatura
  asignaturaSelect.addEventListener("change", async () => {
    const asignatura_id = asignaturaSelect.value;
    const res = await fetch("/obtener_siglas/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ asignatura_id })
    });
    const data = await res.json();
    siglaSelect.innerHTML = '<option value="">Seleccione una sigla</option>';
    data.siglas.forEach(s => {
      siglaSelect.innerHTML += `<option value="${s.sigla}">${s.sigla}</option>`;
    });
  });

  // 🔹 Cargar estudiantes según sigla
  siglaSelect.addEventListener("change", async () => {
    const sigla = siglaSelect.value;
    const res = await fetch("/obtener_estudiantes/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ sigla })
    });
    const data = await res.json();
    estudianteSelect.innerHTML = '<option value="">Seleccione estudiante</option>';
    data.estudiantes.forEach(e => {
      estudianteSelect.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
    });
  });

  // 🔹 Enviar retroalimentación
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const estudiante_id = estudianteSelect.value;
    const contenido = document.getElementById("feedback").value;

    if (!estudiante_id || !contenido.trim()) {
      Swal.fire("⚠️", "Selecciona un estudiante y escribe la retroalimentación.", "warning");
      return;
    }

    const res = await fetch("/guardar_comentario_docente/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        docente_id: "{{ docente_id }}",
        estudiante_id,
        contenido
      })
    });

    const data = await res.json();
    if (data.success) {
      Swal.fire("✅ Éxito", "Retroalimentación enviada correctamente.", "success");
      document.getElementById("feedback").value = "";
    } else {
      Swal.fire("❌ Error", "No se pudo guardar la retroalimentación.", "error");
    }
  });
});


/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN retroalimentacion_docente .JS ----------------------------------------
   ------------------------------------------------------------------------------------------------------------- */
