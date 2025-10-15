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

// TITULO APARTADO GRAFICOS 

    document.addEventListener('DOMContentLoaded', function () {
    const subjectSelect = document.getElementById('subjectSelect');
    const lineCtx = document.getElementById('lineChartSubject').getContext('2d');
    const radarCtx = document.getElementById('radarChartSubject').getContext('2d');

    // Datos simulados de notas por semestre
    const lineData = {
        analisis: [5.2, 5.5, 5.8, 6.0, 6.2, 6.5, 6.8, 7.0],
        calidad: [4.8, 5.0, 5.3, 5.6, 5.9, 6.1, 6.4, 6.7],
        gestion: [4.5, 4.8, 5.1, 5.4, 5.7, 6.0, 6.3, 6.6],
        programacion: [4.4, 4.9, 5.3, 5.7, 6.1, 6.4, 6.8, 7.0],
        inteligencia: [4.1, 4.5, 5.0, 5.4, 5.8, 6.2, 6.6, 7.0],
        modelos: [5.0, 5.3, 5.7, 7.0, 6.1, 6.4, 6.7, 6.9],
        arquitectura: [7.0, 2.3, 3.0, 7.0, 4.6, 5.4, 6.1, 6.8]
    };

    // Datos simulados de certificación por asignatura
    const radarLabels = [
        'Análisis y Planificación',
        'Calidad de Software',
        'Gestión de Proyectos',
        'Programación',
        'Inteligencia de Negocios',
        'Modelos de Datos',
        'Arquitectura de Software'
    ];

    const radarValues = [1, 2, 3, 4, 5, 6, 7];

    // Inicializar gráfico de línea
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
        labels: ['Semestre I','II','III','IV','V','VI','VII','VIII'],
        datasets: [{
            label: 'Notas por Semestre',
            data: lineData.analisis,
            borderColor: '#ff69b4',
            backgroundColor: 'rgba(255,105,180,0.2)',
            fill: true,
            tension: 0.3
        }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
        }
    });

    // Inicializar gráfico de radar
    const radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
        labels: radarLabels,
        datasets: [{
            label: 'Nivel de Certificación',
            data: radarValues,
            backgroundColor: 'rgba(124,96,186,0.5)',
            borderColor: '#7c60ba',
            pointBackgroundColor: '#7c60ba'
        }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
        }
    });

    // Actualizar gráfico de línea al cambiar asignatura
    subjectSelect.addEventListener('change', function () {
        const selected = this.value;
        lineChart.data.datasets[0].data = lineData[selected];
        lineChart.update();
    });
    });

/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    