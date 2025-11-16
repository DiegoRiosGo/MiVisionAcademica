document.addEventListener("DOMContentLoaded", () => {
    const universidad = document.getElementById("selectUniversidad");
    const sede = document.getElementById("selectSede");
    const escuela = document.getElementById("selectEscuela");
    const carrera = document.getElementById("selectCarrera");
    const csvFile = document.getElementById("csvFile");
    const btnSubir = document.getElementById("btnSubirCSV");
    const resultadoDiv = document.getElementById("resultadoCarga");

    // SEDE ↓
    universidad.addEventListener("change", () => {
        sede.innerHTML = "";
        escuela.innerHTML = "";
        carrera.innerHTML = "";

        sede.disabled = true;
        escuela.disabled = true;
        carrera.disabled = true;
        csvFile.disabled = true;
        btnSubir.disabled = true;

        if (universidad.value === "duoc") {
            sede.disabled = false;
            sede.innerHTML = `
                <option value="">Seleccione...</option>
                <option value="plazaNorte">Plaza Norte</option>
                <option value="plazaOeste">Plaza Oeste</option>
                <option value="antonioVaras">Antonio Varas</option>
                <option value="alameda">Alameda</option>
                <option value="sanJoaquin">San Joaquín</option>
            `;
        }
    });

    // ESCUELA ↓
    sede.addEventListener("change", () => {
        escuela.disabled = sede.value === "";
        escuela.innerHTML = `
            <option value="">Seleccione...</option>
            <option value="informatica">Escuela de Informática y Telecomunicaciones</option>
        `;
    });

    // CARRERA ↓
    escuela.addEventListener("change", () => {
        carrera.disabled = escuela.value === "";
        carrera.innerHTML = `
            <option value="">Seleccione...</option>
            <option value="ingeInfo">Ingeniería en Informática</option>
        `;
    });

    // HABILITAR CSV ↓
    carrera.addEventListener("change", () => {
        const enable = carrera.value !== "";
        csvFile.disabled = !enable;
        btnSubir.disabled = !enable;
    });

    // ------------------------------------------------------
    // VALIDAR Y ENVIAR CSV AL BACKEND
    // ------------------------------------------------------


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

    btnSubir.addEventListener("click", async () => {
        const file = csvFile.files[0];

        if (!file) {
            Swal.fire("Error", "Debes seleccionar un archivo CSV.", "error");
            return;
        }

        // Validación extensión
        if (!file.name.endsWith(".csv")) {
            Swal.fire("Error", "El archivo debe ser un CSV.", "error");
            return;
        }

        // Validación nombre correcto
        if (file.name !== "asignaturas_inge_informatica.csv") {
            Swal.fire(
                "Archivo Incorrecto",
                "El archivo debe llamarse exactamente <b>asignaturas_inge_informatica.csv</b>.",
                "error"
            );
            return;
        }
        

        const formData = new FormData();
        formData.append("csv", file);

        Swal.fire({
            title: "Procesando...",
            text: "Subiendo asignaturas, por favor espera",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch("/subirCSV/", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
                body: formData,
            });

            const data = await response.json();
            Swal.close();

            resultadoDiv.innerHTML = `
                <div class="alert alert-info">
                    <h5>Resultado del proceso</h5>
                    <p><b>Asignaturas creadas:</b> ${data.creadas}</p>
                    <p><b>Asignaturas ya existentes:</b> ${data.existentes}</p>
                </div>
            `;

        } catch (e) {
            Swal.fire("Error", "Hubo un problema con la carga del archivo.", "error");
        }
    });

});