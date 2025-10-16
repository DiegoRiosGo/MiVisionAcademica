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

    // 3️⃣ Función para generar gráfico de línea (evolución)
    function crearGraficoLinea(asignatura) {
        const datos = datosNotas[asignatura].sort((a, b) => a.anio - b.anio || a.semestre - b.semestre);
        const etiquetas = datos.map(d => `${d.anio} - S${d.semestre}`);
        const valores = datos.map(d => d.nota);

        return new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
            label: `Evolución de Notas (${asignatura})`,
            data: valores,
            borderColor: '#7c60ba',
            backgroundColor: 'rgba(124,96,186,0.3)',
            fill: true,
            tension: 0.3
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 7 } },
            plugins: { legend: { display: true } },
            responsive: true,
            maintainAspectRatio: false
        }
        });
    }

    // 4️⃣ Gráfico de radar — comparación promedio por asignatura
    const radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
        labels: Object.keys(promedios),
        datasets: [{
            label: 'Promedio General',
            data: Object.values(promedios),
            backgroundColor: 'rgba(124,96,186,0.4)',
            borderColor: '#7c60ba',
            pointBackgroundColor: '#7c60ba'
        }]
        },
        options: {
        scales: { r: { suggestedMin: 1, suggestedMax: 7 } },
        responsive: true,
        maintainAspectRatio: false
        }
    });

    // 5️⃣ Inicializar primer gráfico de línea
    let lineChart = crearGraficoLinea(Object.keys(datosNotas)[0]);

    // 6️⃣ Cambiar asignatura desde el selector
    subjectSelect.addEventListener('change', function () {
        const asig = this.value;
        lineChart.destroy();
        lineChart = crearGraficoLinea(asig);
    });
    });

/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    