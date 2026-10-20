document.addEventListener("DOMContentLoaded", function () {

    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    if (!themeToggle) {
        console.error("Botão de tema não encontrado.");
        return;
    }

    function updateTheme() {
        const isDark = document.body.classList.contains("dark-mode");

        if (themeIcon) {
            themeIcon.textContent = isDark ? "☀" : "☾";
        }

        themeToggle.setAttribute(
            "aria-label",
            isDark
                ? "Mudar para tema claro"
                : "Mudar para tema escuro"
        );

        themeToggle.setAttribute(
            "title",
            isDark
                ? "Mudar para tema claro"
                : "Mudar para tema escuro"
        );
    }

    // Recupera o tema salvo
    const savedTheme = localStorage.getItem("project-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    updateTheme();

    // Alterna o tema ao clicar
    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        const isDark =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "project-theme",
            isDark ? "dark" : "light"
        );

        updateTheme();
    });

});

// =====================================================
// EFEITO DE INTERAÇÃO DO HERO
// =====================================================

const heroVisual = document.querySelector(".hero-visual");

if (heroVisual) {
   const visualElements = heroVisual.querySelectorAll(
    ".protein-image"
);

    heroVisual.addEventListener("mousemove", function (event) {
        const rect = heroVisual.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        visualElements.forEach(function (element, index) {
            const strength = 8 + (index % 4) * 3;

            const moveX = x * strength;
            const moveY = y * strength;

            element.style.transform =
                `translate(${moveX}px, ${moveY}px)`;
        });
    });

    heroVisual.addEventListener("mouseleave", function () {
        visualElements.forEach(function (element) {
            element.style.transform = "";
        });
    });
}
