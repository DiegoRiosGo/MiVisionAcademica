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

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validar preguntas abiertas
        const textareas = form.querySelectorAll("textarea[required]");
        for (const textarea of textareas) {
        if (!textarea.value.trim()) {
            Swal.fire("Falta responder", "Por favor completa todas las respuestas abiertas.", "warning");
            textarea.focus();
            return;
        }
        }

        // Validar preguntas cerradas (radio o checkbox)
        const groups = {};
        form.querySelectorAll("input[type=radio], input[type=checkbox]").forEach((input) => {
        const name = input.name;
        if (!groups[name]) groups[name] = [];
        groups[name].push(input);
        });

        for (const [name, inputs] of Object.entries(groups)) {
        const checked = inputs.some((i) => i.checked);
        if (!checked) {
            Swal.fire("Falta responder", "Por favor selecciona una opción en todas las preguntas.", "warning");
            inputs[0].focus();
            return;
        }
        }

        // Confirmación de envío
        Swal.fire({
        title: "¿Deseas enviar el test?",
        text: "Una vez enviado no podrás modificar tus respuestas.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
        }).then((result) => {
        if (result.isConfirmed) {
            form.submit(); // Envío final
        }
        });
    });
    });

/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- FIN test_interes_alumno .JS ------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */