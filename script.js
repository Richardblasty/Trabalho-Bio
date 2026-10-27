document.addEventListener("DOMContentLoaded", function () {

    const root = document.documentElement;
    const header = document.querySelector(".site-header");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getCurrentLanguage() {
        return root.lang === "pt-BR" ? "pt" : "en";
    }

    function t(en, pt) {
        return getCurrentLanguage() === "pt" ? pt : en;
    }

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Preferences still work for this visit without storage.
        }
    }


    // =====================================================
    // THEME SWITCHER
    // The initial theme is applied by an inline script in <head>.
    // =====================================================

    const themeToggle = document.getElementById("theme-toggle");
    const themeLabel = themeToggle ? themeToggle.querySelector(".theme-label") : null;

    function isDarkTheme() {
        return root.getAttribute("data-theme") === "dark";
    }

    function updateTheme() {
        if (!themeToggle) return;

        const isDark = isDarkTheme();
        const visible = isDark ? t("Light theme", "Tema claro") : t("Dark theme", "Tema escuro");
        const label = isDark
            ? t("Switch to light theme", "Mudar para tema claro")
            : t("Switch to dark theme", "Mudar para tema escuro");

        if (themeLabel) themeLabel.textContent = visible;
        themeToggle.setAttribute("aria-label", label);
        themeToggle.setAttribute("title", label);
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const next = isDarkTheme() ? "light" : "dark";
            root.setAttribute("data-theme", next);
            storageSet("project-theme", next);
            updateTheme();
        });
    }


    // =====================================================
    // LANGUAGE SWITCHER
    // Elements carry data-en / data-pt. Elements with data-html hold
    // markup (code, links) authored in this file and use innerHTML.
    // =====================================================

    const languageToggle = document.getElementById("language-toggle");

    function setLanguage(language) {
        const selected = language === "pt" ? "pt" : "en";
        const key = selected === "pt" ? "pt" : "en";

        root.lang = selected === "pt" ? "pt-BR" : "en";

        document.querySelectorAll("[data-en][data-pt]").forEach(function (element) {
            const value = element.dataset[key];

            if (element.hasAttribute("data-html")) {
                element.innerHTML = value;
            } else {
                element.textContent = value;
            }
        });

        document.querySelectorAll("[data-placeholder-en][data-placeholder-pt]").forEach(function (element) {
            element.placeholder = selected === "pt" ? element.dataset.placeholderPt : element.dataset.placeholderEn;
        });

        document.querySelectorAll("[data-aria-label-en][data-aria-label-pt]").forEach(function (element) {
            element.setAttribute("aria-label", selected === "pt" ? element.dataset.ariaLabelPt : element.dataset.ariaLabelEn);
        });

        document.querySelectorAll("[data-alt-en][data-alt-pt]").forEach(function (element) {
            element.setAttribute("alt", selected === "pt" ? element.dataset.altPt : element.dataset.altEn);
        });

        document.querySelectorAll("[data-content-en][data-content-pt]").forEach(function (element) {
            element.setAttribute("content", selected === "pt" ? element.dataset.contentPt : element.dataset.contentEn);
        });

        if (languageToggle) {
            languageToggle.querySelectorAll(".lang-option").forEach(function (option) {
                option.classList.toggle("is-active", option.dataset.lang === selected);
            });

            const hint = languageToggle.querySelector(".lang-hint");
            if (hint) {
                hint.textContent = selected === "en" ? " — switch to Portuguese" : " — mudar para inglês";
            }
        }

        const versionSelect = document.getElementById("version-selector");
        if (versionSelect) {
            versionSelect.setAttribute("aria-label", t("Documentation version", "Versão da documentação"));
        }

        // Column names reused as labels when record tables are stacked on small screens.
        document.querySelectorAll("table.records").forEach(function (table) {
            const labels = Array.from(table.querySelectorAll("thead th")).map(function (th) {
                return th.textContent.trim();
            });

            table.querySelectorAll("tbody tr").forEach(function (row) {
                Array.from(row.children).forEach(function (cell, i) {
                    if (cell.tagName === "TD" && labels[i]) cell.setAttribute("data-label", labels[i]);
                });
            });
        });

        updateTheme();
        updateMenuLabel();
        searchIndex = null;

        storageSet("project-language", selected);
    }

    if (languageToggle) {
        languageToggle.addEventListener("click", function () {
            setLanguage(getCurrentLanguage() === "en" ? "pt" : "en");
            closeSearchResults();
        });
    }


    // =====================================================
    // MOBILE / TABLET MENU
    // =====================================================

    const menuToggle = document.getElementById("menu-toggle");
    const searchLaunch = document.getElementById("search-launch");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    function isMenuOpen() {
        return header.classList.contains("menu-open");
    }

    function updateMenuLabel() {
        if (!menuToggle) return;
        menuToggle.setAttribute(
            "aria-label",
            isMenuOpen() ? t("Close menu", "Fechar menu") : t("Open menu", "Abrir menu")
        );
    }

    function setMenu(open, options) {
        if (!menuToggle || desktopQuery.matches) return;

        header.classList.toggle("menu-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        updateMenuLabel();

        if (!open && options && options.returnFocus) {
            menuToggle.focus();
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            setMenu(!isMenuOpen());
        });
    }

    if (searchLaunch) {
        searchLaunch.addEventListener("click", function () {
            setMenu(true);
            searchInput.focus();
        });
    }

    document.querySelectorAll(".site-menu .nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            setMenu(false);
        });
    });

    document.addEventListener("click", function (event) {
        if (isMenuOpen() && !header.contains(event.target)) {
            setMenu(false);
        }
    });

    desktopQuery.addEventListener("change", function () {
        header.classList.remove("menu-open");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        updateMenuLabel();
    });


    // =====================================================
    // DOCUMENTATION SEARCH
    // The index is built from the rendered page, in the current
    // language, so results always match what the reader sees.
    // =====================================================

    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const searchStatus = document.getElementById("search-status");
    const content = document.querySelector(".documentation-content");

    let searchIndex = null;
    let currentResults = [];
    let activeIndex = -1;

    function normalize(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[‐-―]/g, "-")
            .replace(/\s+/g, " ")
            .trim();
    }

    function cleanText(element) {
        return element.textContent.replace(/\s+/g, " ").trim();
    }

    function buildIndex() {
        const entries = [];

        content.querySelectorAll(".doc-section").forEach(function (section) {
            const sectionHeading = section.querySelector("h2");
            const sectionTitle = sectionHeading ? cleanText(sectionHeading) : "";
            let currentTitle = sectionTitle;

            const blocks = section.querySelectorAll(
                "h2, h3, p:not(.eyebrow):not(.callout-title), li:not(.module-card), dd, dt, tbody tr, .callout-title, .equation"
            );

            blocks.forEach(function (block) {
                if (block.closest(".search")) return;

                const isHeading = /^H[23]$/.test(block.tagName);
                const text = cleanText(block);

                if (!text) return;

                if (isHeading) {
                    currentTitle = text;
                }

                const target = block.closest("tr[id], .subsection[id], .module-card, .doc-section[id]");
                let targetId = target && target.id ? target.id : section.id;

                if (target && target.classList.contains("module-card")) {
                    const heading = target.querySelector("h3[id]");
                    targetId = heading ? heading.id : section.id;
                }

                // Also match the other language, so "histidina" finds the
                // histidine content while the page is in English.
                const otherKey = getCurrentLanguage() === "pt" ? "en" : "pt";
                const translated = [block].concat(Array.from(block.querySelectorAll("[data-en][data-pt]")))
                    .filter(function (element) { return element.dataset && element.dataset[otherKey]; })
                    .map(function (element) { return element.dataset[otherKey].replace(/<[^>]+>/g, " "); })
                    .join(" ");

                entries.push({
                    element: block,
                    targetId: targetId,
                    section: sectionTitle,
                    title: isHeading ? text : currentTitle,
                    text: text,
                    norm: normalize(text + " " + translated),
                    normTitle: normalize(isHeading ? text : currentTitle),
                    isHeading: isHeading
                });
            });
        });

        return entries;
    }

    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, function (char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
        });
    }

    // Highlight the query terms inside a snippet, mapping positions on the
    // normalized text back to the original text (same length after NFD
    // stripping is not guaranteed, so match character by character).
    function highlight(text, terms) {
        const lower = normalize(text);

        if (lower.length !== text.length) {
            return escapeHtml(text);
        }

        const marks = new Array(text.length).fill(false);

        terms.forEach(function (term) {
            let from = 0;
            let position;
            while ((position = lower.indexOf(term, from)) !== -1) {
                for (let i = position; i < position + term.length; i++) marks[i] = true;
                from = position + term.length;
            }
        });

        let html = "";
        let open = false;

        for (let i = 0; i < text.length; i++) {
            if (marks[i] && !open) { html += "<mark>"; open = true; }
            if (!marks[i] && open) { html += "</mark>"; open = false; }
            html += escapeHtml(text[i]);
        }

        if (open) html += "</mark>";
        return html;
    }

    function makeSnippet(text, terms) {
        const lower = normalize(text);
        const first = Math.max(0, lower.indexOf(terms[0]));
        const start = Math.max(0, first - 50);
        const end = Math.min(text.length, first + 110);

        return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    }

    function runSearch(query) {
        const terms = normalize(query).split(" ").filter(Boolean);

        if (!searchIndex) searchIndex = buildIndex();

        const scored = [];

        searchIndex.forEach(function (entry) {
            const haystack = entry.norm + " " + entry.normTitle;

            if (!terms.every(function (term) { return haystack.indexOf(term) !== -1; })) return;

            let score = 0;
            terms.forEach(function (term) {
                if (entry.isHeading && entry.norm.indexOf(term) !== -1) score += 10;
                if (entry.normTitle.indexOf(term) !== -1) score += 3;
                if (entry.norm.indexOf(term) !== -1) score += 2;
                if (entry.norm.indexOf(term) === 0) score += 2;
            });

            scored.push({ entry: entry, score: score });
        });

        scored.sort(function (a, b) { return b.score - a.score; });

        // One result per target, so a table row or subsection is not repeated.
        const seen = new Set();
        const results = [];

        scored.forEach(function (item) {
            const key = item.entry.targetId + "|" + item.entry.title;
            if (seen.has(key) || results.length >= 8) return;
            seen.add(key);
            results.push(item.entry);
        });

        return { results: results, terms: terms };
    }

    function setActive(index) {
        const options = searchResults.querySelectorAll(".search-result");

        options.forEach(function (option, i) {
            option.setAttribute("aria-selected", String(i === index));
        });

        activeIndex = index;

        if (index >= 0 && options[index]) {
            searchInput.setAttribute("aria-activedescendant", options[index].id);
            options[index].scrollIntoView({ block: "nearest" });
        } else {
            searchInput.removeAttribute("aria-activedescendant");
        }
    }

    function closeSearchResults() {
        searchResults.hidden = true;
        searchResults.innerHTML = "";
        searchInput.setAttribute("aria-expanded", "false");
        searchInput.removeAttribute("aria-activedescendant");
        currentResults = [];
        activeIndex = -1;
    }

    function renderResults(query) {
        const trimmed = query.trim();

        if (trimmed.length < 2) {
            closeSearchResults();
            searchStatus.textContent = "";
            return;
        }

        const found = runSearch(trimmed);
        currentResults = found.results;
        searchResults.innerHTML = "";

        if (!currentResults.length) {
            const empty = document.createElement("li");
            empty.className = "search-empty";
            empty.setAttribute("role", "option");
            empty.setAttribute("aria-disabled", "true");
            empty.id = "search-empty";
            empty.textContent = t(
                "No results for “" + trimmed + "”. Try a term such as λ, RDC-027 or MM/PBSA.",
                "Nenhum resultado para “" + trimmed + "”. Tente um termo como λ, RDC-027 ou MM/PBSA."
            );
            searchResults.appendChild(empty);
            searchStatus.textContent = t("No results.", "Nenhum resultado.");
        } else {
            currentResults.forEach(function (entry, i) {
                const option = document.createElement("li");
                option.className = "search-result";
                option.id = "search-option-" + i;
                option.setAttribute("role", "option");
                option.setAttribute("aria-selected", "false");

                const titleText = entry.isHeading ? entry.text : entry.title;
                const snippet = entry.isHeading ? "" : makeSnippet(entry.text, found.terms);

                option.innerHTML =
                    (entry.section !== titleText
                        ? "<span class=\"search-result-section\">" + escapeHtml(entry.section) + "</span>"
                        : "") +
                    "<span class=\"search-result-title\">" + highlight(titleText, found.terms) + "</span>" +
                    (snippet ? "<span class=\"search-result-snippet\">" + highlight(snippet, found.terms) + "</span>" : "");

                option.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                });

                option.addEventListener("click", function () {
                    openResult(i);
                });

                searchResults.appendChild(option);
            });

            searchStatus.textContent = t(
                currentResults.length + (currentResults.length === 1 ? " result." : " results."),
                currentResults.length + (currentResults.length === 1 ? " resultado." : " resultados.")
            );
        }

        searchResults.hidden = false;
        searchInput.setAttribute("aria-expanded", "true");
        setActive(-1);
    }

    function openResult(index) {
        const entry = currentResults[index];
        if (!entry) return;

        const target = document.getElementById(entry.targetId);
        const element = entry.element;

        closeSearchResults();
        setMenu(false);

        if (target && history.replaceState) {
            history.replaceState(null, "", "#" + entry.targetId);
        }

        element.scrollIntoView({
            block: "center",
            behavior: reduceMotion.matches ? "auto" : "smooth"
        });

        element.classList.remove("search-target");
        void element.offsetWidth;
        element.classList.add("search-target");

        if (!element.hasAttribute("tabindex")) {
            element.setAttribute("tabindex", "-1");
        }
        element.focus({ preventScroll: true });

        setTimeout(function () {
            element.classList.remove("search-target");
        }, 2600);
    }

    if (searchInput && searchResults && content) {
        searchInput.addEventListener("input", function () {
            renderResults(searchInput.value);
        });

        searchInput.addEventListener("focus", function () {
            if (searchInput.value.trim().length >= 2) renderResults(searchInput.value);
        });

        searchInput.addEventListener("keydown", function (event) {
            const count = currentResults.length;

            if (event.key === "ArrowDown" && count) {
                event.preventDefault();
                setActive((activeIndex + 1) % count);
            } else if (event.key === "ArrowUp" && count) {
                event.preventDefault();
                setActive(activeIndex <= 0 ? count - 1 : activeIndex - 1);
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (count) openResult(activeIndex >= 0 ? activeIndex : 0);
            } else if (event.key === "Escape") {
                if (!searchResults.hidden) {
                    event.stopPropagation();
                    closeSearchResults();
                } else if (searchInput.value) {
                    searchInput.value = "";
                }
            }
        });

        searchInput.addEventListener("blur", function () {
            setTimeout(function () {
                if (document.activeElement !== searchInput) closeSearchResults();
            }, 120);
        });
    }


    // =====================================================
    // KEYBOARD SHORTCUTS
    // "/" focuses the search; Escape closes the menu.
    // =====================================================

    document.addEventListener("keydown", function (event) {
        const tag = event.target.tagName;
        const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable;

        if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            setMenu(true);
            searchInput.focus();
            searchInput.select();
        }

        if (event.key === "Escape" && isMenuOpen()) {
            setMenu(false, { returnFocus: true });
        }
    });


    // =====================================================
    // CURRENT SECTION (top navigation and table of contents)
    // =====================================================

    const navLinks = Array.from(document.querySelectorAll(".primary-nav .nav-link"));
    const tocLinks = Array.from(document.querySelectorAll(".toc-link"));

    const tracked = tocLinks
        .map(function (link) {
            const id = link.getAttribute("href").slice(1);
            return { id: id, element: document.getElementById(id), link: link };
        })
        .filter(function (item) { return item.element; });

    const sectionIds = navLinks.map(function (link) { return link.getAttribute("href").slice(1); });

    function headerOffset() {
        return header.getBoundingClientRect().height + 24;
    }

    let ticking = false;

    function updateCurrentSection() {
        ticking = false;

        // A heading becomes current once it reaches the upper quarter of
        // the visible area below the sticky header.
        const offset = headerOffset() + Math.min(160, window.innerHeight * 0.25);
        let current = null;

        tracked.forEach(function (item) {
            if (item.element.getBoundingClientRect().top <= offset) current = item;
        });

        // At the very bottom of the page, the last section is current.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = tracked[tracked.length - 1];
        }

        let sectionId = null;

        if (current) {
            const section = current.element.closest(".doc-section");
            sectionId = section ? section.id : current.id;
        }

        tocLinks.forEach(function (link) {
            const isCurrent = current && link === current.link;
            const isParent = current && !isCurrent && link.getAttribute("href") === "#" + sectionId && current.link.classList.contains("toc-sub");

            if (isCurrent || isParent) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        navLinks.forEach(function (link) {
            if (sectionId && sectionIds.indexOf(sectionId) !== -1 && link.getAttribute("href") === "#" + sectionId) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function requestUpdate() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateCurrentSection);
        }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", requestUpdate);


    // =====================================================
    // INITIALIZE
    // =====================================================

    const savedLanguage = storageGet("project-language") === "pt" ? "pt" : "en";
    setLanguage(savedLanguage);
    requestUpdate();
});
