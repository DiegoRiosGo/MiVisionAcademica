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

// Nuevos gráficos
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
        // Destruir los gráficos anteriores
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
});

// ================== FUNCIONES DE GRÁFICOS ==================

function ajustarEscalaY(datos) {
    const valores = Object.values(datos).map(Number).filter(v => !isNaN(v));
    if (valores.length === 0) return { min: 2, max: 7, step: 0.5 };

    const min = Math.min(...valores);
    const max = Math.max(...valores);

    // Margen visual leve
    let margen = (max - min) * 0.1 || 0.1;
    let yMin = Math.max(1, Math.floor((min - margen) * 4) / 4);
    let yMax = Math.min(7, Math.ceil((max + margen) * 4) / 4);

    // Si rango pequeño, usar pasos de 0.25
    const step = (yMax - yMin <= 2) ? 0.25 : 0.5;

    return { min: yMin, max: yMax, step };
}

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
                borderColor: "rgba(138, 53, 195, 1)",
                backgroundColor: "rgba(138, 53, 195, 0.2)",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: "Evolución de notas por semestre" } },
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

function crearGraficoRadar(datos) {
    const ctx = document.getElementById("graficoRadar");
    const escala = ajustarEscalaY(datos);

    return new Chart(ctx, {
        type: "radar",
        data: {
            labels: Object.keys(datos),
            datasets: [{
                label: "Promedio por área",
                data: Object.values(datos),
                borderColor: "rgba(167, 78, 239, 1)",
                backgroundColor: "rgba(167, 78, 239, 0.2)"
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: "Rendimiento por área" } },
            scales: {
                r: {
                    min: escala.min,
                    max: escala.max,
                    ticks: { stepSize: escala.step }
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

    const datasets = areas.map(area => ({
        label: area,
        data: anios.map(a => agrupado[a][area] || 0),
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    const ctx = document.getElementById("graficoBarras");
    return new Chart(ctx, {
        type: "bar",
        data: { labels: anios, datasets },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Promedio por área y año" },
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

function crearGraficoComparacion(promediosAlumno, promediosGeneral) {
    const ctx = document.getElementById("graficoComparacion");

    // 🔹 Solo los semestres cursados por el alumno
    const semestres = Object.keys(promediosAlumno).sort();

    // 🔹 Escala combinada alumno + general (solo en esos semestres)
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
                    borderColor: "rgba(91, 39, 204, 1)",
                    backgroundColor: "rgba(91, 39, 204, 0.2)",
                    tension: 0.3,
                    fill: false
                },
                {
                    label: "Promedio general",
                    data: semestres.map(s => promediosGeneral[s] || null),
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Comparación: Alumno vs Promedio General" },
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
/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    