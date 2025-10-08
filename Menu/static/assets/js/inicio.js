/* -------------------------------------------------------------------------------------------------------------
   -------------------------------------- INICIO inicio .JS ----------------------------------------------------
   ------------------------------------------------------------------------------------------------------------- */

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


// ================================
// Medidor de fuerza de contraseña
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("contrasena");
    const strengthBar = document.getElementById("strength-bar");
    const strengthText = document.getElementById("strength-text");

    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            const value = passwordInput.value;
            let strength = 0;

            // Reglas de validación
            if (value.length >= 8) strength++;
            if (/[A-Z]/.test(value)) strength++;
            if (/[a-z]/.test(value)) strength++;
            if (/[0-9]/.test(value)) strength++;
            if (/[!@#$%^&*(),.?\":{}|<>-_]/.test(value)) strength++;

            // Determinar nivel de seguridad
            let color = "";
            let text = "";

            switch (strength) {
                case 0:
                case 1:
                    color = "#ff4b5c";
                    text = "Muy débil";
                    break;
                case 2:
                    color = "#ffa534";
                    text = "Débil";
                    break;
                case 3:
                    color = "#ffd234";
                    text = "Media";
                    break;
                case 4:
                    color = "#9acd32";
                    text = "Fuerte";
                    break;
                case 5:
                    color = "#00c851";
                    text = "Muy fuerte";
                    break;
            }

            strengthBar.style.width = (strength * 20) + "%";
            strengthBar.style.backgroundColor = color;
            strengthText.textContent = text;
        });
    }
});
/* --------------------------------------------------------------------------------------------------------------
   ---------------------------------------- FIN inicio .JS ------------------------------------------------------
   -------------------------------------------------------------------------------------------------------------- */