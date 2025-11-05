/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- INICIO test_interes_alumno .JS ---------------------------------------
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


//TITULO FORMULARIO

    //SIN CODIGO


//TITULO FORMULARIO DE INTERES   

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("testForm");
        if (!form) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const missing = [];

            // 1) Validar textareas obligatorios
            const textareas = form.querySelectorAll("textarea[required]");
            textareas.forEach((ta, idx) => {
            if (!ta.value.trim()) {
                // Obtenemos el texto de la pregunta (el <p> anterior)
                const p = ta.closest(".pregunta")?.querySelector("p");
                missing.push(p ? p.innerText.trim() : `Pregunta abierta #${idx+1}`);
            }
            });

            // 2) Validar grupos de radio/checkbox
            // Lista de names esperados (según tu HTML)
            const grupos = [
            { name: "interes[]", tipo: "checkbox", label: "1. ¿En qué tipo de asignaturas sientes que desarrollas mejor tus habilidades?" },
            { name: "dificultad", tipo: "radio", label: "2. ¿En cuál de estas asignaturas sientes mayor dificultad?" },
            { name: "contenido[]", tipo: "checkbox", label: "3. ¿Qué tipo de contenido te resulta más útil para aprender?" },
            { name: "area[]", tipo: "checkbox", label: "4. ¿Qué área profesional te atrae más?" },
            { name: "acompanamiento[]", tipo: "checkbox", label: "5. ¿Qué tipo de acompañamiento académico valoras más?" },
            { name: "claridad", tipo: "radio", label: "6. ¿Qué tan claro tienes tu camino profesional?" },
            { name: "motivacion[]", tipo: "checkbox", label: "7. ¿Qué te motiva más a mejorar tu rendimiento académico?" },
            { name: "frecuencia", tipo: "radio", label: "8. ¿Con qué frecuencia revisas tus notas y avances académicos?" },
            { name: "profesional[]", tipo: "checkbox", label: "9. ¿Qué tipo de profesional te gustaría llegar a ser según tus gustos e intereses?" },
            { name: "certificacion[]", tipo: "checkbox", label: "10. ¿Qué tipo de certificación te gustaría obtener al finalizar la carrera?" }
            ];

            grupos.forEach(g => {
            // querySelectorAll por name exacto; si tu HTML usa name sin [], probamos ambos
            let inputs = Array.from(form.querySelectorAll(`[name="${g.name}"]`));
            if (!inputs.length) {
                const alt = g.name.replace("[]", "");
                inputs = Array.from(form.querySelectorAll(`[name="${alt}"]`));
            }

            if (!inputs.length) {
                // si no encuentra inputs, ignora (evita falsos positivos)
                return;
            }

            const anyChecked = inputs.some(i => i.checked);
            if (!anyChecked) {
                missing.push(g.label);
            }
            });

            if (missing.length > 0) {
            // Mostrar listado claro de preguntas faltantes
            const html = `<strong>Por favor responde las siguientes preguntas obligatorias:</strong><ul style="text-align:left;">` +
                        missing.map(m => `<li>${m}</li>`).join("") + `</ul>`;
            Swal.fire({
                icon: "warning",
                title: "Faltan respuestas",
                html: html,
                width: 600
            });
            return;
            }

            // Confirmación y envío
            Swal.fire({
            title: "¿Deseas enviar el test?",
            text: "Una vez enviado no podrás modificar tus respuestas.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, enviar",
            cancelButtonText: "Cancelar"
            }).then((res) => {
            if (res.isConfirmed) {
                form.submit();
            }
            });
        });
        });
    
        //para retroalimentación
        document.addEventListener("DOMContentLoaded", () => {
            const modal = document.getElementById("modalSolicitud");
            const btnAbrir = document.getElementById("btnSolicitud");
            const btnCerrar = document.getElementById("cancelarModal");
            const btnEnviar = document.getElementById("enviarSolicitud");
            const areaSelect = document.getElementById("subjectSelect");
            const asignaturaSelect = document.getElementById("asignaturaSelect");
            const siglaSelect = document.getElementById("siglaSelect");

            btnAbrir.addEventListener("click", () => modal.style.display = "block");
            btnCerrar.addEventListener("click", () => modal.style.display = "none");

            // --- Helper CSRF ---
            function getCookie(name) {
                let cookieValue = null;
                if (document.cookie && document.cookie !== "") {
                const cookies = document.cookie.split(";");
                for (let cookie of cookies) {
                    cookie = cookie.trim();
                    if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                    }
                }
                }
                return cookieValue;
            }
            const csrftoken = getCookie("csrftoken");

            // --- Función para resetear selects dependientes ---
            function resetDependentSelects(select, message = "--") {
                if (select) select.innerHTML = `<option value="">${message}</option>`;
            }

            // --- Cargar áreas al iniciar ---
            async function cargarAreas() {
                try {
                const res = await fetch("/obtener_areas/");
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Error al cargar áreas");
                areaSelect.innerHTML = '<option value="">Seleccione un área</option>';
                data.areas.forEach(a => {
                    areaSelect.innerHTML += `<option value="${a}">${a}</option>`;
                });
                } catch (err) {
                console.error("Error cargando áreas:", err);
                areaSelect.innerHTML = '<option value="">Error cargando áreas</option>';
                }
            }
            if (areaSelect) cargarAreas();

            // --- Cargar asignaturas al cambiar el área ---
            if (areaSelect && asignaturaSelect) {
                areaSelect.addEventListener("change", async () => {
                const area = areaSelect.value;
                resetDependentSelects(asignaturaSelect, "Cargando...");
                resetDependentSelects(siglaSelect);

                if (!area) {
                    asignaturaSelect.innerHTML = '<option value="">Seleccione un área primero</option>';
                    return;
                }

                try {
                    const res = await fetch("/obtener_asignaturas/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
                        body: JSON.stringify({ area }),
                    });
                    
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || "Error al obtener asignaturas");
                    asignaturaSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';
                    data.asignaturas.forEach(a => {
                        asignaturaSelect.innerHTML += `<option value="${a.asignatura_id}">${a.nombre_asignatura}</option>`;
                    });
                } catch (err) {
                    console.error("Error cargando asignaturas:", err);
                    asignaturaSelect.innerHTML = '<option value="">Error cargando</option>';
                }
                });
            }

            // --- Cargar siglas al cambiar asignatura ---
            if (asignaturaSelect && siglaSelect) {
                asignaturaSelect.addEventListener("change", async () => {
                const asignatura_id = asignaturaSelect.value;
                resetDependentSelects(siglaSelect, "Cargando...");

                if (!asignatura_id) {
                    siglaSelect.innerHTML = '<option value="">Seleccione asignatura primero</option>';
                    return;
                }

                try {
                    const res = await fetch("/obtener_siglas/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
                    body: JSON.stringify({ asignatura_id }),
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || "Error al obtener siglas");
                    siglaSelect.innerHTML = '<option value="">Seleccione una sigla</option>';
                    data.siglas.forEach(s => {
                    siglaSelect.innerHTML += `<option value="${s}">${s}</option>`;
                    });
                } catch (err) {
                    console.error("Error cargando siglas:", err);
                    siglaSelect.innerHTML = '<option value="">Error</option>';
                }
                });
            }
        });


document.addEventListener("DOMContentLoaded", () => {
  const inputDoc = document.getElementById("buscarDocente");

  // No validar aquí, se validará al enviar el formulario
  if (!inputDoc) {
    console.error("No se encontró el campo buscarDocente.");
    return;
  } 

  // crear wrapper relativo para posicionamiento correcto
  const wrapper = document.createElement("div");
  wrapper.className = "autocomplete-wrapper";
  wrapper.style.position = "relative";
  inputDoc.parentNode.insertBefore(wrapper, inputDoc);
  wrapper.appendChild(inputDoc);

  // crear campo hidden para almacenar usuario_id seleccionado
  let hiddenId = document.getElementById("docenteIdSelected");
  if (!hiddenId) {
    hiddenId = document.createElement("input");
    hiddenId.type = "hidden";
    hiddenId.id = "docenteIdSelected";
    hiddenId.name = "docente_id";
    wrapper.appendChild(hiddenId);
  }

  const sugerencias = document.createElement("div");
  sugerencias.className = "sugerencias-docente";
  // estilos basicos para que quede debajo del input
  sugerencias.style.position = "absolute";
  sugerencias.style.left = "0";
  sugerencias.style.right = "0";
  sugerencias.style.top = (inputDoc.offsetHeight + 6) + "px";
  sugerencias.style.zIndex = "9999";
  sugerencias.style.background = "#fff";
  sugerencias.style.border = "1px solid #ddd";
  sugerencias.style.borderRadius = "6px";
  sugerencias.style.maxHeight = "220px";
  sugerencias.style.overflowY = "auto";
  sugerencias.style.display = "none";
  wrapper.appendChild(sugerencias);

  let lastTimeout = null;
  inputDoc.addEventListener("input", () => {
    const q = inputDoc.value.trim();
    hiddenId.value = ""; // reset selection when user edits text
    sugerencias.innerHTML = "";
    sugerencias.style.display = "none";

    if (lastTimeout) clearTimeout(lastTimeout);
    if (q.length < 2) return;

    lastTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/buscar_docentes/?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.docentes && data.docentes.length > 0) {
          sugerencias.style.display = "block";
          data.docentes.forEach(d => {
            const item = document.createElement("div");
            item.className = "sugerencia-item";
            item.style.padding = "8px 12px";
            item.style.cursor = "pointer";
            item.textContent = d.nombre;
            item.dataset.id = d.usuario_id;
            item.addEventListener("click", () => {
              inputDoc.value = d.nombre;
              hiddenId.value = d.usuario_id;
              sugerencias.innerHTML = "";
              sugerencias.style.display = "none";
            });
            sugerencias.appendChild(item);
          });
        } else {
          sugerencias.style.display = "block";
          const no = document.createElement("div");
          no.className = "sin-resultados";
          no.style.padding = "8px 12px";
          no.style.color = "#666";
          no.textContent = "No se encontraron docentes";
          sugerencias.appendChild(no);
        }
      } catch (err) {
        console.error("Error buscar_docentes:", err);
      }
    }, 250); // debounce 250ms
  });

  // click fuera cierra
  document.addEventListener("click", (ev) => {
    if (!wrapper.contains(ev.target)) {
      sugerencias.innerHTML = "";
      sugerencias.style.display = "none";
    }
  });

  // Manejo del envío: usar id en lugar de nombre si existe
  const btnEnviar = document.getElementById("enviarSolicitud");
  if (btnEnviar && !btnEnviar.dataset.listenerAdded) {
    btnEnviar.dataset.listenerAdded = true;
    btnEnviar.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id_docente = document.getElementById("docenteIdSelected").value;
      const docente_text = document.getElementById("buscarDocente").value.trim();
      const asignatura = document.getElementById("asignaturaSelect").value;
      const sigla = document.getElementById("siglaSelect").value;
      const mensaje = document.getElementById("mensaje").value.trim();

      function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
          const cookies = document.cookie.split(";");
          for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      }
      const csrftoken = getCookie("csrftoken");

      if ((!id_docente && !docente_text) || !asignatura || !sigla || !mensaje) {
        Swal.fire("Completa todos los campos antes de enviar.");
        return;
      }

      const payload = {
        id_docente: id_docente || null,
        docente: !id_docente ? docente_text : null,
        asignatura,
        sigla,
        mensaje,
      };

      try {
        const res = await fetch("/enviar_solicitud/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(payload), // ✅ corregido
        });

        if (!res.ok) {
          Swal.fire({
            icon: "error",
            title: "No se pudo enviar la solicitud",
            text: `Error HTTP ${res.status}: ${res.statusText}`,
          });
          return;
        }

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Solicitud enviada con éxito",
            timer: 2500,
            showConfirmButton: false,
          });
          document.getElementById("modalSolicitud").style.display = "none";
          document.getElementById("buscarDocente").value = "";
          document.getElementById("docenteIdSelected").value = "";
          document.getElementById("mensaje").value = "";
        } else {
          const errMsg = data.error || "Error al enviar la solicitud.";
          let html = errMsg;
          if (data.candidatos) {
            html +=
              "<br><br>Coincidencias encontradas:<ul>" +
              data.candidatos.map((c) => `<li>${c}</li>`).join("") +
              "</ul>";
          }
          Swal.fire({
            icon: "error",
            title: "No se pudo enviar",
            html,
          });
        }
      } catch (err) {
        console.error("Error fetch enviar_solicitud:", err);
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor.",
        });
      }
    });
  }
});
/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- FIN test_interes_alumno .JS ------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */