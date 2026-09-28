const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");

menuButton.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});


const sidebarLinks = document.querySelectorAll(".sidebar-navigation a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", () => {

        if (window.innerWidth <= 900) {

            sidebar.classList.remove("open");

        }

    });

});


const copyButtons = document.querySelectorAll(".copy-button");

copyButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const code = button
            .closest(".code-block")
            .querySelector("code")
            .innerText;

        await navigator.clipboard.writeText(code);

        button.innerText = "Copied!";

        setTimeout(() => {

            button.innerText = "Copy";

        }, 1500);

    });

});


const sections = document.querySelectorAll(
    ".documentation-section"
);

const navigationLinks = document.querySelectorAll(
    ".sidebar-navigation a"
);


window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop;

        if (window.scrollY >= sectionTop - 150) {

            current = section.getAttribute("id");

        }

    });


    navigationLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});