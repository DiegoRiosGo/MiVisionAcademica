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

// TITULO PERFIL

    // SIN CODIGO

// TITULO FOTO DE PERFIL
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

                    // Alerta de confirmación
                    alert('✅ Foto de perfil actualizada correctamente');
                };
                reader.readAsDataURL(file);
            }
        });
    }

// TITULO INFORMACION PERSONAL

    // SIN CODIGO