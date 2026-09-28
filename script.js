/* =========================================================
   NAVEGAÇÃO SUAVE
========================================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(event) {

        const targetId =
            this.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


/* =========================================================
   NAVEGAÇÃO ATIVA
========================================================= */

const sections =
    document.querySelectorAll(
        ".doc-section, #home"
    );

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


function updateActiveNavigation() {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop =
            section.getBoundingClientRect().top;

        if (sectionTop <= 180) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            `#${currentSection}`
        ) {

            link.classList.add("active");

        }

    });


    sidebarLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            `#${currentSection}`
        ) {

            link.classList.add("active");

        }

    });

}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);

updateActiveNavigation();


/* =========================================================
   PESQUISA
========================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );


function performSearch() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!query) {
        return;
    }

    const elements =
        document.querySelectorAll(
            ".doc-section h2, .doc-section h3, .doc-section p"
        );

    let found = false;


    elements.forEach(element => {

        if (
            !found &&
            element.textContent
                .toLowerCase()
                .includes(query)
        ) {

            element.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            found = true;

        }

    });


    if (!found) {

        searchInput.value = "";

        searchInput.placeholder =
            "Nenhum resultado encontrado";

        setTimeout(() => {

            searchInput.placeholder =
                "Pesquisar...";

        }, 2000);

    }

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                performSearch();

            }

        }
    );

}


/* =========================================================
   BOTÃO COPY
========================================================= */

const copyButton =
    document.querySelector(
        ".copy-button"
    );


if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            const code =
                document.querySelector(
                    ".code-block code"
                );

            if (!code) {
                return;
            }

            try {

                await navigator.clipboard.writeText(
                    code.textContent
                );

                copyButton.textContent =
                    "Copied!";

                setTimeout(() => {

                    copyButton.textContent =
                        "Copy";

                }, 1800);

            } catch (error) {

                copyButton.textContent =
                    "Error";

                setTimeout(() => {

                    copyButton.textContent =
                        "Copy";

                }, 1800);

            }

        }
    );

}


/* =========================================================
   EFEITO SUTIL NO HERO
========================================================= */

const hero =
    document.querySelector(
        ".hero"
    );

const heroVisual =
    document.querySelector(
        ".hero-visual"
    );


if (hero && heroVisual) {

    hero.addEventListener(
        "mousemove",
        event => {

            const rect =
                hero.getBoundingClientRect();

            const x =
                (event.clientX - rect.left)
                / rect.width;

            const y =
                (event.clientY - rect.top)
                / rect.height;


            const moveX =
                (x - 0.5) * 12;

            const moveY =
                (y - 0.5) * 8;


            heroVisual.style.transform =
                `translate(${moveX}px, ${moveY}px)`;

        }
    );


    hero.addEventListener(
        "mouseleave",
        () => {

            heroVisual.style.transform =
                "translate(0, 0)";

        }
    );

}
