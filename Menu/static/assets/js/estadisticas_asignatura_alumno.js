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

// TITULO GRAFICOS 

    document.addEventListener('DOMContentLoaded', function () {
    const subjectSelect = document.getElementById('subjectSelect');
    const lineCtx = document.getElementById('lineChartSubject').getContext('2d');
    const radarCtx = document.getElementById('radarChartSubject').getContext('2d');

    // Datos simulados de notas por semestre
    const lineData = {
        analisis: [12, 14, 13, 15],
        calidad: [15, 16, 14, 17],
        gestion: [13, 15, 14, 18],
        programacion: [14, 13, 15, 16],
        inteligencia: [16, 17, 15, 18],
        modelos: [14, 15, 16, 17],
        arquitectura: [13, 14, 15, 16]
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

    const radarValues = [75, 70, 80, 60, 65, 85, 78];

    // Inicializar gráfico de línea
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
        labels: ['Semestre 1', 'Semestre 2', 'Semestre 3', 'Semestre 4'],
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
