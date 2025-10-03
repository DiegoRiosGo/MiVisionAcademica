
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
