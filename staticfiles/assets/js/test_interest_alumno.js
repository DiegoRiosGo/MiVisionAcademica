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

            btnAbrir.addEventListener("click", () => modal.style.display = "block");
            btnCerrar.addEventListener("click", () => modal.style.display = "none");

            async function cargarAsignaturas() {
                const res = await fetch("/obtener_asignaturas/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Error al obtener asignaturas");
                const select = document.getElementById("asignaturaSelect");
                select.innerHTML = '<option value="">Seleccione asignatura</option>';
                data.asignaturas.forEach(a => {
                    select.innerHTML += `<option value="${a.nombre_asignatura}">${a.nombre_asignatura}</option>`;
                });
            }
            cargarAsignaturas();

            btnEnviar.addEventListener("click", async () => {
                const docente = document.getElementById("buscarDocente").value;
                const asignatura = document.getElementById("asignaturaSelect").value;
                const sigla = document.getElementById("siglaSelect").value;
                const mensaje = document.getElementById("mensaje").value;

                if (!docente || !asignatura || !sigla || !mensaje) {
                Swal.fire("Completa todos los campos antes de enviar.");
                return;
                }

                const res = await fetch("/enviar_solicitud/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docente, asignatura, sigla, mensaje }),
                });

                const data = await res.json();
                if (data.success) {
                Swal.fire("Solicitud enviada con éxito");
                modal.style.display = "none";
                } else {
                Swal.fire("Error al enviar la solicitud");
                }
            });
        });

/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- FIN test_interes_alumno .JS ------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */