/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- INICIO estadisticas_asignatura_alumno .JS --------------------------------
   ------------------------------------------------------------------------------------------------------------- */

// TITULO BODY

    //SIN CODIGO


// Personalización de tabs
document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".personal-tab-btn");
    const tabSections = document.querySelectorAll(".personal-tab-section");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.dataset.target;
            tabSections.forEach(sec => {
                sec.style.display = (sec.id === target) ? "block" : "none";
            });
        });
    });
});

// ================== GESTIÓN DE GRÁFICOS ==================

document.addEventListener("DOMContentLoaded", () => {
    const estudianteId = localStorage.getItem("estudiante_id") || 1;
    const urlBase = `/api/estadisticas_alumno/?estudiante_id=${estudianteId}`;

    const filtroAnio = document.getElementById("filtroAnio");
    const filtroArea = document.getElementById("filtroArea");
    const btnRestablecer = document.getElementById("btnRestablecer");

    if (btnRestablecer) {
        btnRestablecer.addEventListener("click", () => {
            filtroAnio.value = "";
            filtroArea.value = "todas";
            cargarDatos(true);
        });
    }

    let graficoEvolucion, graficoRadar, graficoBarras, graficoComparacion;

    const PALETA = [
        "#8A35C3", "#5B27CC", "#A74EEF", "#F39C12",
        "#3498DB", "#2ECC71", "#E74C3C", "#1ABC9C",
        "#9B59B6", "#F1C40F", "#34495E"
    ];

    function obtenerColor(index) {
        return PALETA[index % PALETA.length];
    }

    function cargarDatos(reset = false) {
        const url = `${urlBase}&anio=${reset ? "" : (filtroAnio.value || "")}&area=${reset ? "" : (filtroArea.value || "")}`;

        fetch(url)
            .then(async res => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch {
                    console.error("Respuesta inesperada:", text);
                    throw new Error("No es JSON válido");
                }
            })
            .then(data => {
                if (data.error) {
                    Swal.fire("Error", data.error, "error");
                    return;
                }

                if (filtroAnio.options.length === 0 || reset) {
                    filtroAnio.innerHTML = `<option value="">Todos</option>`;
                    data.anios.forEach(a => {
                        filtroAnio.innerHTML += `<option value="${a}">${a}</option>`;
                    });
                }

                if (filtroArea.options.length === 0 || reset) {
                    filtroArea.innerHTML = `<option value="todas">Todas</option>`;
                    data.areas.forEach(a => {
                        filtroArea.innerHTML += `<option value="${a}">${a}</option>`;
                    });
                }

                actualizarGraficos(data);
            })
            .catch(err => {
                Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
                console.error(err);
            });
    }

    function actualizarGraficos(data) {
        [graficoEvolucion, graficoRadar, graficoBarras, graficoComparacion].forEach(g => g?.destroy());

        graficoEvolucion = crearGraficoEvolucion(data.promedios_semestre);
        graficoRadar = crearGraficoRadar(data.promedios_area);
        graficoBarras = crearGraficoBarras(data.promedios_area_anio);
        graficoComparacion = crearGraficoComparacion(
            data.promedios_semestre,
            data.promedios_general_semestre
        );
    }

    filtroAnio.addEventListener("change", () => cargarDatos());
    filtroArea.addEventListener("change", () => cargarDatos());
    cargarDatos();

    // ================== FUNCIONES DE ESCALA ==================

    function ajustarEscalaY(datos) {
        const valores = Object.values(datos).map(Number).filter(v => !isNaN(v));
        if (valores.length === 0) return { min: 2, max: 7, step: 0.5 };

        const min = Math.min(...valores);
        const max = Math.max(...valores);
        const margen = (max - min) * 0.1 || 0.1;
        const yMin = Math.max(1, Math.floor((min - margen) * 4) / 4);
        const yMax = Math.min(7, Math.ceil((max + margen) * 4) / 4);
        const step = (yMax - yMin <= 2) ? 0.25 : 0.5;

        return { min: yMin, max: yMax, step };
    }

    // ================== GRÁFICOS ==================

    function crearGraficoEvolucion(datos) {
        const ctx = document.getElementById("graficoEvolucion");
        const escala = ajustarEscalaY(datos);

        return new Chart(ctx, {
            type: "line",
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    label: "Promedio por semestre",
                    data: Object.values(datos),
                    borderColor: "#8A35C3",
                    backgroundColor: "rgba(138, 53, 195, 0.2)",
                    pointBackgroundColor: "#8A35C3",
                    pointRadius: 4,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                interaction: { mode: "nearest", intersect: false },
                plugins: {
                    title: { display: true, text: "📈 Evolución de notas por semestre" },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: escala.min,
                        max: escala.max,
                        ticks: { stepSize: escala.step },
                        title: { display: true, text: "Promedio" }
                    },
                    x: {
                        ticks: { maxRotation: 45, minRotation: 30, autoSkip: true }
                    }
                }
            }
        });
    }

    function crearGraficoRadar(datos) {
        const ctx = document.getElementById("graficoRadar");
        return new Chart(ctx, {
            type: "radar",
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    label: "Promedio por área",
                    data: Object.values(datos),
                    borderColor: "#5B27CC",
                    backgroundColor: "rgba(91, 39, 204, 0.2)",
                    pointBackgroundColor: "#5B27CC"
                }]
            },
            options: {
                responsive: true,
                interaction: { mode: "nearest", intersect: false },
                plugins: {
                    title: { display: true, text: "🎯 Rendimiento por área" }
                },
                scales: {
                    r: {
                        min: 2,
                        max: 7,
                        ticks: { stepSize: 0.5 }
                    }
                }
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
        const escala = ajustarEscalaY(datos);

        const datasets = areas.map((area, i) => ({
            label: area,
            data: anios.map(a => agrupado[a][area] || 0),
            backgroundColor: obtenerColor(i)
        }));

        const ctx = document.getElementById("graficoBarras");
        return new Chart(ctx, {
            type: "bar",
            data: { labels: anios, datasets },
            options: {
                responsive: true,
                interaction: { mode: "nearest", intersect: false },
                plugins: {
                    title: { display: true, text: "📊 Promedio por área y año" },
                    legend: { position: "bottom" }
                },
                scales: {
                    y: {
                        min: escala.min,
                        max: escala.max,
                        ticks: { stepSize: escala.step },
                        title: { display: true, text: "Promedio" }
                    },
                    x: {
                        ticks: { maxRotation: 45, minRotation: 30, autoSkip: true }
                    }
                }
            }
        });
    }

    function crearGraficoComparacion(promediosAlumno, promediosGeneral) {
        const ctx = document.getElementById("graficoComparacion");
        const semestres = Object.keys(promediosAlumno).sort();
        const datosCombinados = {};

        semestres.forEach(s => {
            if (promediosAlumno[s]) datosCombinados[s + "_a"] = promediosAlumno[s];
            if (promediosGeneral[s]) datosCombinados[s + "_g"] = promediosGeneral[s];
        });

        const escala = ajustarEscalaY(datosCombinados);

        return new Chart(ctx, {
            type: "line",
            data: {
                labels: semestres,
                datasets: [
                    {
                        label: "Promedio del alumno",
                        data: semestres.map(s => promediosAlumno[s] || null),
                        borderColor: "#2ECC71",
                        backgroundColor: "rgba(46, 204, 113, 0.2)",
                        pointBackgroundColor: "#27AE60",
                        pointRadius: 4,
                        tension: 0.3
                    },
                    {
                        label: "Promedio general",
                        data: semestres.map(s => promediosGeneral[s] || null),
                        borderColor: "#E67E22",
                        backgroundColor: "rgba(230, 126, 34, 0.2)",
                        borderDash: [5, 5],
                        pointBackgroundColor: "#E67E22",
                        pointRadius: 4,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: { mode: "nearest", intersect: false },
                plugins: {
                    title: { display: true, text: "⚖️ Comparación: Alumno vs Promedio General" },
                    legend: { position: "bottom" }
                },
                scales: {
                    y: {
                        min: escala.min,
                        max: escala.max,
                        ticks: { stepSize: escala.step },
                        title: { display: true, text: "Promedio" }
                    }
                }
            }
        });
    }
});
/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    