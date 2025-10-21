/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- INICIO informe_alumno .JS --------------------------------------------
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

// TITULO DE INFORMES 

    // SIN CODIGO


    document.getElementById("btnAnalizarIA").addEventListener("click", async () => {
    const btn = document.getElementById("btnAnalizarIA");
    btn.disabled = true;
    btn.innerText = "Analizando...";

    try {
    const response = await fetch("{% url 'analizar_perfil_ia' %}", {
      method: "POST",
      headers: {
        "X-CSRFToken": "{{ csrf_token }}",
      },
    });

    if (!response.ok) throw new Error("Respuesta inválida del servidor");
    const data = await response.json();

    if (data.success) {
      Swal.fire({
        title: "✅ Análisis completado",
        html: `<pre>${JSON.stringify(data.analisis, null, 2)}</pre>`,
        icon: "success"
      });
    } else {
      Swal.fire("Error", data.error || "Ocurrió un error desconocido", "error");
    }
    } catch (err) {
        console.error("Error al pedir IA:", err);
        Swal.fire("Error", "No se pudo conectar al servidor para el análisis IA.", "error");
    } finally {
        btn.disabled = false;
        btn.innerText = "🔎 Analizar mi perfil con IA";
    }
    });

    function renderAnalisisIA(analisis) {
    const container = document.getElementById("iaResult");
    container.innerHTML = "";

    // resumen
    const resumen = document.createElement("div");
    resumen.className = "card p-3 mb-3";
    resumen.innerHTML = `<h5>Resumen</h5><p>${analisis.resumen_corto || "Sin resumen."}</p>`;
    container.appendChild(resumen);

    // fortalezas
    const fortalezas = document.createElement("div");
    fortalezas.className = "card p-3 mb-3";
    fortalezas.innerHTML = `<h5>Fortalezas</h5><ul>${(analisis.fortalezas||[]).map(x=>`<li>${x}</li>`).join("")}</ul>`;
    container.appendChild(fortalezas);

    // debilidades
    const debs = document.createElement("div");
    debs.className = "card p-3 mb-3";
    debs.innerHTML = `<h5>Debilidades</h5><ul>${(analisis.debilidades||[]).map(x=>`<li>${x}</li>`).join("")}</ul>`;
    container.appendChild(debs);

    // recomendaciones
    const rec = document.createElement("div");
    rec.className = "card p-3 mb-3";
    rec.innerHTML = `<h5>Recomendaciones</h5><ul>${(analisis.recomendaciones||[]).map(r=>`<li><strong>${r.tipo}</strong>: ${r.texto}</li>`).join("")}</ul>`;
    container.appendChild(rec);

    // recursos
    if (analisis.recomendaciones_recursos && analisis.recomendaciones_recursos.length) {
        const resDiv = document.createElement("div");
        resDiv.className = "card p-3 mb-3";
        resDiv.innerHTML = `<h5>Recursos recomendados</h5><ul>${analisis.recomendaciones_recursos.map(r=>`<li><a href="${r.url}" target="_blank">${r.titulo}</a> (${r.tipo})</li>`).join("")}</ul>`;
        container.appendChild(resDiv);
    }
    }

    // helper CSRF
    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
        const c = cookie.trim();
        if (c.startsWith(name + "=")) {
            cookieValue = decodeURIComponent(c.substring(name.length + 1));
            break;
        }
        }
    }
    return cookieValue;
    }
/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN informe_alumno .JS ----------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */