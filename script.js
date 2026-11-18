document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // THEME SWITCHER
    // =====================================================

    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    function getCurrentLanguage() {
        return document.documentElement.lang === "pt-BR"
            ? "pt"
            : document.documentElement.lang === "es"
                ? "es"
                : "en";
    }

    function updateTheme() {
        const isDark = document.body.classList.contains("dark-mode");
        const language = getCurrentLanguage();

        if (themeIcon) {
            themeIcon.textContent = isDark ? "☀" : "☾";
        }

        if (themeToggle) {
            const labels = {
                en: isDark ? "Switch to light theme" : "Switch to dark theme",
                pt: isDark ? "Mudar para tema claro" : "Mudar para tema escuro",
                es: isDark ? "Cambiar al tema claro" : "Cambiar al tema oscuro"
            };

            themeToggle.setAttribute("aria-label", labels[language]);
            themeToggle.setAttribute("title", labels[language]);
        }
    }

    // Restore the saved theme.
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("project-theme") || "light";
    } catch (error) {}

    document.body.classList.toggle(
        "dark-mode",
        savedTheme === "dark"
    );

    updateTheme();

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");

            const isDark = document.body.classList.contains("dark-mode");

            try {
                localStorage.setItem(
                    "project-theme",
                    isDark ? "dark" : "light"
                );
            } catch (error) {}

            updateTheme();
        });
    }


    // =====================================================
    // LANGUAGE SWITCHER
    // =====================================================

    const languageSelector = document.getElementById("language-selector");

    function setLanguage(language) {

        const selectedLanguage = ["en", "pt", "es"].includes(language)
            ? language
            : "en";

        const suffix = {
            en: "en",
            pt: "pt",
            es: "es"
        };

        document.documentElement.lang =
            selectedLanguage === "pt"
                ? "pt-BR"
                : selectedLanguage;

        // Translate text content.
        document.querySelectorAll("[data-en]").forEach(function (element) {

            const translation = element.dataset["" + suffix[selectedLanguage]];

            if (translation !== undefined) {
                element.textContent = translation;
            }
        });

        // Translate placeholders.
        document.querySelectorAll("[data-placeholder-en]").forEach(function (element) {

            const key = "placeholder" + selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1);
            const translation = element.dataset[key];

            if (translation !== undefined) {
                element.placeholder = translation;
            }
        });

        // Translate accessibility labels.
        document.querySelectorAll("[data-aria-label-en]").forEach(function (element) {

            const key = "ariaLabel" + selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1);
            const translation = element.dataset[key];

            if (translation !== undefined) {
                element.setAttribute("aria-label", translation);
            }
        });

        // Translate image alternative text.
        document.querySelectorAll("[data-alt-en]").forEach(function (element) {

            const key = "alt" + selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1);
            const translation = element.dataset[key];

            if (translation !== undefined) {
                element.setAttribute("alt", translation);
            }
        });

        // Update language buttons.
        if (languageSelector) {
            languageSelector.querySelectorAll(".language-option").forEach(function (button) {

                const isActive = button.dataset.language === selectedLanguage;

                button.classList.toggle("active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });
        }

        // Update page title.
        const pageTitle = document.querySelector("title");

        if (pageTitle) {
            const titles = {
                en: "Project Documentation",
                pt: "Documentação do Projeto",
                es: "Documentación del Proyecto"
            };

            pageTitle.textContent = titles[selectedLanguage];
        }

        // Refresh theme labels.
        updateTheme();

        // Save selected language.
        try {
            localStorage.setItem(
                "project-language",
                selectedLanguage
            );
        } catch (error) {}
    }

    // Language button events.
    if (languageSelector) {
        languageSelector.querySelectorAll(".language-option").forEach(function (button) {

            button.addEventListener("click", function () {
                setLanguage(this.dataset.language);
            });
        });
    }

    // Restore saved language.
    let savedLanguage = "en";

    try {
        savedLanguage = localStorage.getItem("project-language") || "en";
    } catch (error) {}

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

// =====================================================
// NAVEGAÇÃO ENTRE HOME E DOCUMENTAÇÃO
// =====================================================

function initializeNavigation() {

    const navigationLinks = document.querySelectorAll(
        ".nav-link, .hero-buttons a, .sidebar-link, .footer-links a"
    );

    const homeLinks = document.querySelectorAll(".logo");

    // Exibe somente a Home inicialmente.
    document.body.classList.add("home-view");

    function openHome() {
        document.body.classList.add("home-view");

        document.querySelectorAll(".doc-section").forEach(section => {
            section.classList.remove("is-active");
        });

        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
        });

        history.replaceState(null, "", "#home");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function openDocumentation(sectionId) {

        const section = document.getElementById(sectionId);

        if (!section || !section.classList.contains("doc-section")) {
            return;
        }

        // Esconde a Home.
        document.body.classList.remove("home-view");

        // Esconde todas as documentações.
        document.querySelectorAll(".doc-section").forEach(item => {
            item.classList.remove("is-active");
        });

        // Exibe somente a seção selecionada.
        section.classList.add("is-active");

        // Atualiza o menu.
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + sectionId
            );
        });

        history.replaceState(null, "", "#" + sectionId);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // Eventos dos menus e botões.
    navigationLinks.forEach(link => {

        link.addEventListener("click", function(event) {

            const href = this.getAttribute("href");

            if (!href || !href.startsWith("#")) return;

            const sectionId = href.substring(1);

            if (sectionId === "home") {
                event.preventDefault();
                openHome();
                return;
            }

            const target = document.getElementById(sectionId);

            if (!target) return;

            const parentSection = target.classList.contains("doc-section")
                ? target
                : target.closest(".doc-section");

            if (parentSection) {
                event.preventDefault();
                openDocumentation(parentSection.id);
            }
        });
    });

    // Botão da logo: retorna à Home.
    homeLinks.forEach(link => {

        link.addEventListener("click", function(event) {
            event.preventDefault();
            openHome();
        });
    });
}

// Garante que a navegação seja inicializada após o HTML.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigation);
} else {
    initializeNavigation();
}
