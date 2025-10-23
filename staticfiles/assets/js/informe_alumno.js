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

    function renderAnalisisIA(analisis) {
    const container = document.getElementById("iaResult");
    container.innerHTML = "";

    // 🎓 Crear una función auxiliar para las tarjetas
    const crearTarjeta = (titulo, contenido, colorClase) => {
        const card = document.createElement("div");
        card.className = `ia-card ${colorClase}`;
        card.innerHTML = `<h5>${titulo}</h5>${contenido}`;
        return card;
    };

    // 🧠 Resumen corto
    if (analisis.resumen_corto) {
        container.appendChild(
        crearTarjeta("Resumen General", `<p>${analisis.resumen_corto}</p>`, "resumen")
        );
    }

    // ✅ Fortalezas
    if (analisis.fortalezas?.length) {
        const list = analisis.fortalezas.map(f => `<li>${f}</li>`).join("");
        container.appendChild(crearTarjeta("Fortalezas", `<ul>${list}</ul>`, "fortalezas"));
    }

    // ⚠️ Debilidades
    if (analisis.debilidades?.length) {
        const list = analisis.debilidades.map(d => `<li>${d}</li>`).join("");
        container.appendChild(crearTarjeta("Debilidades", `<ul>${list}</ul>`, "debilidades"));
    }

    // 💡 Recomendaciones académicas
    if (analisis.recomendaciones?.length) {
        const list = analisis.recomendaciones.map(r => `<li>${r}</li>`).join("");
        container.appendChild(crearTarjeta("Recomendaciones Académicas", `<ul>${list}</ul>`, "recomendaciones"));
    }

    // 🧭 Recomendaciones laborales
    if (analisis.recomendaciones_laborales?.length) {
        const list = analisis.recomendaciones_laborales.map(r => `<li>${r}</li>`).join("");
        container.appendChild(crearTarjeta("Recomendaciones Laborales", `<ul>${list}</ul>`, "laborales"));
    }

    // 🧰 Herramientas de mejora
    if (analisis.herramietas_de_mejora?.length) {
        const list = analisis.herramietas_de_mejora.map(r => `<li>${r}</li>`).join("");
        container.appendChild(crearTarjeta("Herramientas de Mejora", `<ul>${list}</ul>`, "herramientas"));
    }

    // 📘 Recursos recomendados
    if (analisis.recomendaciones_recursos?.length) {
    const list = analisis.recomendaciones_recursos.map(r => `<li>${r}</li>`).join("");
    container.appendChild(crearTarjeta("Recursos Recomendados", `<ul>${list}</ul>`, "recursos"));
    }
    }

/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN informe_alumno .JS ----------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */