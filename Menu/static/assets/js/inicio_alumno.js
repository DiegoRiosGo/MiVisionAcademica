// ================= PDF / sirve para subir archivos en pdf para el apartado de inicio_alumno=================
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