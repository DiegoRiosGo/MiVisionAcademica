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