document.addEventListener("DOMContentLoaded", () => {

    const universidad = document.getElementById("selectUniversidad");
    const sede = document.getElementById("selectSede");
    const escuela = document.getElementById("selectEscuela");
    const carrera = document.getElementById("selectCarrera");
    const csvFile = document.getElementById("csvFile");
    const btnSubir = document.getElementById("btnSubirCSV");

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

    // ESCUELA prueba ↓
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

});