// TITULO BODY

    // SIN CODIGO

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

// TITULO BIENVENIDA

    //SIN CODIGO

// TITULO PDF

    const uploadPDF = document.getElementById('uploadPDF');
    const viewPDF = document.getElementById('viewPDF');
    const downloadPDF = document.getElementById('downloadPDF');
    const pdfViewer = document.getElementById('pdfViewer');

    if(uploadPDF){
        uploadPDF.addEventListener('change', () => {
            const file = uploadPDF.files[0];
            if(file){
                const fileURL = URL.createObjectURL(file);
                pdfViewer.src = fileURL;
                pdfViewer.style.display = 'none';
                downloadPDF.onclick = () => {
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.download = file.name;
                    a.click();
                };
                viewPDF.onclick = () => {
                    pdfViewer.style.display = 'block';
                };
            }
        });
    }