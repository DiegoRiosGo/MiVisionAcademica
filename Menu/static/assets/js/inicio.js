
// ================= Animacion de inicio =================

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