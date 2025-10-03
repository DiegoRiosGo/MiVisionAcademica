// ================= Animacion de inicio / va en inicio.js =================

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector(".container");
    const btnSignIn = document.getElementById("btn-sign-in");
    const btnSignUp = document.getElementById("btn-sign-up");

    // Botón "Registrarse" muestra el formulario Sign Up
    btnSignUp.addEventListener('click', () => {
        container.classList.add('toggle');
    });

    // Botón "Iniciar Sesión" muestra el formulario Sign In
    btnSignIn.addEventListener('click', () => {
        container.classList.remove('toggle');
    });
});


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

// ================= Foto de Perfil / va en perfil_docente y perfil_alumno para subir foto de perfil =================
const newProfile = document.getElementById('newProfile');
const profileImg = document.getElementById('profileImg');
const sidebarProfiles = document.querySelectorAll('#sidebarProfile');

if(newProfile){
    newProfile.addEventListener('change', () => {
        const file = newProfile.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = function(e){
                profileImg.src = e.target.result;
                sidebarProfiles.forEach(img => img.src = e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });
}

// ================= Nav link active / sidebar de todas las paginas menos de inicio ================= 
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    navLinks.forEach(link => {
        // Quitar cualquier active existente
        link.classList.remove('active');

        // Comparar href del link con window.location.href
        const linkHref = link.getAttribute('href');
        const currentUrl = window.location.href;

        // Si el href está contenido en la URL actual, marcarlo
        if(currentUrl.includes(linkHref)){
            link.classList.add('active');
        }

        // Opcional: marcar también al hacer click antes de navegar
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
});
