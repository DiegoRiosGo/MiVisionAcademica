    document.addEventListener('DOMContentLoaded', function () {

 // TITULO DE BARRA LATERAL //
            
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
    const contentSections = document.querySelectorAll('.card'); // Asegúrate de que tus secciones tengan clase 'card'

    function showSection(id) {
        contentSections.forEach(section => section.style.display = 'none');
        const target = document.getElementById(id);
        if (target) target.style.display = 'block';
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
        // Si estás usando Django como SPA, descomenta esto:
        // e.preventDefault();

        // Quitar clase 'active' de todos los enlaces
        sidebarLinks.forEach(l => l.classList.remove('active'));
        // Agregar clase 'active' al enlace clickeado
        this.classList.add('active');

        // Mostrar la sección correspondiente si tiene data-view
        const viewId = this.dataset.view;
        if (viewId) showSection(viewId);
        });
    });

    // ---------------- PERSONALIZACION: TABS ----------------
    const tabButtons = document.querySelectorAll('.personal-tab-btn');
    const tabSections = document.querySelectorAll('.personal-tab-section');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.target;
        tabSections.forEach(sec => {
            sec.style.display = (sec.id === target) ? 'block' : 'none';
        });
        });
    });
    });
