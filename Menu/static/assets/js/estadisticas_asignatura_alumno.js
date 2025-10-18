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
   document.addEventListener("DOMContentLoaded", () => {
    const estudianteId = localStorage.getItem("estudiante_id") || 1; // ejemplo
    const url = `/estadisticas_asignatura_alumno/?estudiante_id=${estudianteId}`;

    fetch(url)
        .then((res) => res.json())
        .then((data) => {
        if (data.error) {
            Swal.fire("Error", data.error, "error");
            return;
        }

        crearGraficoEvolucion(data.promedios_semestre);
        crearGraficoRadar(data.promedios_area);
        crearGraficoBarras(data.promedios_area_anio);
        })
        .catch((err) => {
        Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
        console.error(err);
        });
    });

    function crearGraficoEvolucion(datos) {
    const ctx = document.getElementById("graficoEvolucion");
    new Chart(ctx, {
        type: "line",
        data: {
        labels: Object.keys(datos),
        datasets: [{
            label: "Promedio por semestre",
            data: Object.values(datos),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            tension: 0.3
        }]
        },
        options: {
        responsive: true,
        plugins: {
            title: { display: true, text: "Evolución de notas por semestre" }
        }
        }
    });
    }

    function crearGraficoRadar(datos) {
    const ctx = document.getElementById("graficoRadar");
    new Chart(ctx, {
        type: "radar",
        data: {
        labels: Object.keys(datos),
        datasets: [{
            label: "Promedio por área",
            data: Object.values(datos),
            borderColor: "rgba(54,162,235,1)",
            backgroundColor: "rgba(54,162,235,0.2)"
        }]
        },
        options: {
        responsive: true,
        plugins: {
            title: { display: true, text: "Rendimiento por área" }
        },
        scales: { r: { min: 0, max: 7 } }
        }
    });
    }

    function crearGraficoBarras(datos) {
    const agrupado = {};
    for (let clave in datos) {
        const [anio, area] = clave.split("-");
        agrupado[anio] = agrupado[anio] || {};
        agrupado[anio][area] = datos[clave];
    }

    const anios = Object.keys(agrupado);
    const areas = [...new Set(Object.values(agrupado).flatMap(Object.keys))];

    const datasets = areas.map((area) => ({
        label: area,
        data: anios.map((a) => agrupado[a][area] || 0),
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    const ctx = document.getElementById("graficoBarras");
    new Chart(ctx, {
        type: "bar",
        data: { labels: anios, datasets },
        options: {
        responsive: true,
        plugins: {
            title: { display: true, text: "Promedio por área y año" },
            legend: { position: "bottom" }
        },
        scales: {
            y: { beginAtZero: true, max: 7 }
        }
        }
    });
    }

/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    