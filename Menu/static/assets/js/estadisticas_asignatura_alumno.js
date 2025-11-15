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
    const estudianteId = localStorage.getItem("estudiante_id") || 1;
    const urlBase = `/api/estadisticas_alumno/?estudiante_id=${estudianteId}`;

    const filtroAnio = document.getElementById("filtroAnio");
    const filtroArea = document.getElementById("filtroArea");
    const btnRestablecer = document.getElementById("btnRestablecer");
    if (btnRestablecer) {
    btnRestablecer.addEventListener("click", () => {
        document.getElementById("filtroAnio").value = "";
        document.getElementById("filtroArea").value = "";
        cargarEstadisticas();
    });
    }

    let graficoRadar, graficoBarras, graficoComparacion;

    function cargarDatos(reset = false) {
        const url = `${urlBase}&anio=${reset ? "" : (filtroAnio.value || "")}&area=${reset ? "" : (filtroArea.value || "")}`;

        fetch(url)
            .then(async (res) => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch {
                    console.error("Respuesta inesperada:", text);
                    throw new Error("No es JSON");
                }
            })
            .then((data) => {
                if (data.error) {
                    Swal.fire("Error", data.error, "error");
                    return;
                }

                // --- llenar selectores sólo si están vacíos ---
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

                // --- actualizar gráficos ---
                actualizarGraficos(data);
            })
            .catch((err) => {
                Swal.fire("Error", "No se pudieron cargar las estadísticas", "error");
                console.error(err);
            });
    }

    function actualizarGraficos(data) {
    if (graficoRadar) graficoRadar.destroy();
    if (graficoBarras) graficoBarras.destroy();
    if (graficoComparacion) graficoComparacion.destroy();

    graficoComparacion = crearGraficoComparacion(
        data.promedios_semestre,
        data.promedios_general_semestre
    );

    // 🔹 Cambia los títulos según el tipo de datos
    if (data.tipo_datos === "area") {
        graficoRadar = crearGraficoRadar(data.promedios_especifico, "Promedio por área");
        graficoBarras = crearGraficoBarras(data.promedios_especifico_anio, "Promedio por área y año");
    } else {
        graficoRadar = crearGraficoRadar(data.promedios_especifico, "Promedio por asignatura");
        graficoBarras = crearGraficoBarras(data.promedios_especifico_anio, "Promedio por asignatura y año");
    }
}

    // --- Eventos de filtros ---
    filtroAnio.addEventListener("change", () => cargarDatos());
    filtroArea.addEventListener("change", () => cargarDatos());

    // --- Botón de restablecer ---
    btnRestablecer.addEventListener("click", () => {
        filtroAnio.value = "";
        filtroArea.value = "todas";
        cargarDatos(true);
    });

    cargarDatos(); // primera carga
});


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


// --- Función de gráfico Radar (Promedio por Área) ---
function crearGraficoRadar(datos) {
    const ctx = document.getElementById("graficoRadar");

    // 🔹 Filtrar valores válidos
    let etiquetas = Object.keys(datos).filter(k => k.toLowerCase() !== "sin asignatura");
    let valores = etiquetas.map(k => datos[k]);

    // 🔹 Si hay 2 o menos elementos → agregar datos ficticios
    const cantidadNecesaria = 3;
    if (etiquetas.length < cantidadNecesaria) {
        const faltantes = cantidadNecesaria - etiquetas.length;
        for (let i = 1; i <= faltantes; i++) {
            etiquetas.push(`Valor adicional ${i}`);
            valores.push(7);  // valor ficticio para completar la figura
        }
    }

    return new Chart(ctx, {
        type: "radar",
        data: {
            labels: etiquetas.map((e, i) => `${e} (${valores[i]})`),
            datasets: [{
                label: "Promedio por asignatura",
                data: valores,
                borderColor: "rgba(167, 78, 239, 1)",
                backgroundColor: "rgba(54,162,235,0.2)"
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                title: { display: true, text: "Rendimiento por asignatura" },
                legend: { position: "bottom" }
            },
            scales: { 
                r: { 
                    min: 2,
                    max: 7,
                    ticks: { display: false }
                }
            }
        }
    });
}

// --- Función de gráfico de barras (Promedio por Área y Año) ---
function crearGraficoBarras(datos) {
    const agrupado = {};
    for (let clave in datos) {
        const [anio, area] = clave.split("-");
        if (area && area.toLowerCase() !== "sin asignatura") {
            agrupado[anio] = agrupado[anio] || {};
            agrupado[anio][area] = datos[clave];
        }
    }

    // 🔹 Solo usar años con datos válidos
    const anios = Object.keys(agrupado).filter(a => Object.keys(agrupado[a]).length > 0);
    const areas = [...new Set(Object.values(agrupado).flatMap(Object.keys))];

    const datasets = areas.map((area) => ({
        label: area,
        data: anios.map((a) => agrupado[a][area] || null),
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
                    beginAtZero: false,
                    min: Math.min(...datasets.flatMap(d => d.data.filter(v => v !== null))) - 0.25,
                    max: 7,
                    ticks: { display: true } 
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
            labels: semestres.map(s => `${s} (${promediosAlumno[s] || "-"})`),
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

function obtenerImagenGrafico(idCanvas) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
}

const imageBarras = obtenerImagenGrafico("graficoBarras");
const imagenRadar = obtenerImagenGrafico("graficoRadar");
const imagenComparacion = obtenerImagenGrafico("graficoComparacion");

// Enviar al backend junto con el JSON del análisis IA
const payload = {
    analisis: data.analisis,
    imagenes: {
        barras: imageBarras,
        radar: imagenRadar,
        comparacion: imagenComparacion
    }
};
/* -------------------------------------------------------------------------------------------------------------
   ---------------------------------- FIN estadisticas_asignatura_alumno .JS -----------------------------------
   ------------------------------------------------------------------------------------------------------------- */    