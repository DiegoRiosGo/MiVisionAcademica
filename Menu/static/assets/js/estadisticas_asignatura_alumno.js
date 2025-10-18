/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- INICIO estadisticas_asignatura_alumno .JS --------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    //SIN CODIGO


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


    //nuevos gráficos
    document.addEventListener('DOMContentLoaded', async function () {
    const subjectSelect = document.getElementById('subjectSelect');
    const lineCtx = document.getElementById('lineChartSubject').getContext('2d');
    const radarCtx = document.getElementById('radarChartSubject').getContext('2d');

    let datosNotas = {};
    let promedios = {};

    // 1️⃣ Cargar datos reales desde el backend
    try {
        const res = await fetch(urlEstadisticasNotas);
        const data = await res.json();

        if (!data.success) {
        Swal.fire("Error", "No se pudieron cargar las estadísticas.", "error");
        return;
        }

        datosNotas = data.notas;
        promedios = data.promedios;

    } catch (err) {
        console.error("Error cargando estadísticas:", err);
        Swal.fire("Error", "Fallo al obtener datos del servidor.", "error");
        return;
    }

    // 2️⃣ Llenar el selector con las asignaturas reales
    subjectSelect.innerHTML = "";
    Object.keys(datosNotas).forEach(asig => {
        const option = document.createElement("option");
        option.value = asig;
        option.textContent = asig;
        subjectSelect.appendChild(option);
    });

    if (Object.keys(datosNotas).length === 0) {
        Swal.fire("Sin datos", "No hay notas registradas aún.", "info");
        return;
    }

    fetch(`/estadisticas_notas_alumno/?estudiante_id=1`)
    .then(res => res.json())
    .then(data => {
        // === Gráfico 1: Evolución por semestre ===
        const ctx1 = document.getElementById('graficoEvolucion').getContext('2d');
        new Chart(ctx1, {
        type: 'line',
        data: {
            labels: Object.keys(data.promedios_semestre),
            datasets: [{
            label: 'Promedio por Semestre',
            data: Object.values(data.promedios_semestre),
            borderWidth: 2,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            tension: 0.3
            }]
        }
        });

        // === Gráfico 2: Radar por áreas ===
        const ctx2 = document.getElementById('graficoRadar').getContext('2d');
        new Chart(ctx2, {
        type: 'radar',
        data: {
            labels: Object.keys(data.promedios_areas),
            datasets: [{
            label: 'Rendimiento por Área',
            data: Object.values(data.promedios_areas),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }]
        }
        });
    });
    });

/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    