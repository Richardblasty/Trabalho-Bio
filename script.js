document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // THEME SWITCHER
    // =====================================================

    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    function getCurrentLanguage() {
        return document.documentElement.lang === "pt-BR"
            ? "pt"
            : "en";
    }

    function updateTheme() {
        const isDark = document.body.classList.contains("dark-mode");
        const language = getCurrentLanguage();

        if (themeIcon) {
            themeIcon.textContent = isDark ? "☀" : "☾";
        }

        if (themeToggle) {
            const label = language === "pt"
                ? (isDark ? "Mudar para tema claro" : "Mudar para tema escuro")
                : (isDark ? "Switch to light theme" : "Switch to dark theme");

            themeToggle.setAttribute("aria-label", label);
            themeToggle.setAttribute("title", label);
        }
    }

    // Restore the saved theme.
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("project-theme") || "light";
    } catch (error) {
        // The theme still works without local storage.
    }

    document.body.classList.toggle(
        "dark-mode",
        savedTheme === "dark"
    );

    updateTheme();

    // Toggle the theme.
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");

            const isDark =
                document.body.classList.contains("dark-mode");

            try {
                localStorage.setItem(
                    "project-theme",
                    isDark ? "dark" : "light"
                );
            } catch (error) {
                // The theme still works without local storage.
            }

            updateTheme();
        });
    }


    // =====================================================
    // LANGUAGE SWITCHER
    // =====================================================

    const languageToggle = document.getElementById("language-toggle");

    function setLanguage(language) {
        const selectedLanguage = language === "pt" ? "pt" : "en";

        document.documentElement.lang =
            selectedLanguage === "pt" ? "pt-BR" : "en";

        // Translate elements with language attributes.
        document.querySelectorAll("[data-en][data-pt]").forEach(function (element) {
            element.textContent =
                selectedLanguage === "pt"
                    ? element.dataset.pt
                    : element.dataset.en;
        });

        // Translate placeholders.
        document.querySelectorAll(
            "[data-placeholder-en][data-placeholder-pt]"
        ).forEach(function (element) {
            element.placeholder =
                selectedLanguage === "pt"
                    ? element.dataset.placeholderPt
                    : element.dataset.placeholderEn;
        });

        // Translate accessibility labels.
        document.querySelectorAll(
            "[data-aria-label-en][data-aria-label-pt]"
        ).forEach(function (element) {
            element.setAttribute(
                "aria-label",
                selectedLanguage === "pt"
                    ? element.dataset.ariaLabelPt
                    : element.dataset.ariaLabelEn
            );
        });

        // Translate image alternative text.
        document.querySelectorAll(
            "[data-alt-en][data-alt-pt]"
        ).forEach(function (element) {
            element.setAttribute(
                "alt",
                selectedLanguage === "pt"
                    ? element.dataset.altPt
                    : element.dataset.altEn
            );
        });

        // Update the language button.
        if (languageToggle) {
            languageToggle.textContent =
                selectedLanguage === "en" ? "EN | PT" : "PT | EN";

            const languageLabel = selectedLanguage === "en"
                ? "Switch language to Portuguese"
                : "Mudar idioma para inglês";

            languageToggle.setAttribute("aria-label", languageLabel);
            languageToggle.setAttribute("title", languageLabel);
        }

        // Update the page title.
        const pageTitle = document.querySelector("title");

        if (pageTitle) {
            pageTitle.textContent =
                selectedLanguage === "pt"
                    ? "Documentação do Projeto"
                    : "Project Documentation";
        }

        // Refresh theme labels in the selected language.
        updateTheme();

        // Save the selected language.
        try {
            localStorage.setItem(
                "project-language",
                selectedLanguage
            );
        } catch (error) {
            // The language switch still works without storage.
        }
    }

    if (languageToggle) {
        languageToggle.addEventListener("click", function () {
            const currentLanguage = getCurrentLanguage();

            setLanguage(
                currentLanguage === "en" ? "pt" : "en"
            );
        });
    }

    // Restore the saved language.
    let savedLanguage = "en";

    try {
        savedLanguage =
            localStorage.getItem("project-language") === "pt"
                ? "pt"
                : "en";
    } catch (error) {
        // English is the default language.
    }

    setLanguage(savedLanguage);

});


// =====================================================
// HERO IMAGE INTERACTION
// =====================================================

const heroVisual = document.querySelector(".hero-visual");

if (heroVisual) {
    const visualElements = heroVisual.querySelectorAll(".protein-image");

    heroVisual.addEventListener("mousemove", function (event) {
        const rect = heroVisual.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

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
