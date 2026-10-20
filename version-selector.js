document.addEventListener("DOMContentLoaded", async () => {
  const base = "/Trabalho-Bio/";
  const path = window.location.pathname;

  const currentVersion = path
    .slice(base.length)
    .split("/")[0];

  const header = document.querySelector(".header-actions");

  if (!header) return;

  const selector = document.createElement("select");

  selector.id = "version-selector";
  selector.setAttribute("aria-label", "Selecionar versão");

  selector.style.padding = "8px 12px";
  selector.style.borderRadius = "6px";
  selector.style.cursor = "pointer";
  selector.style.background = "#ffffff";
  selector.style.color = "#222222";

  try {
    const response = await fetch(base + "versions.json");

    if (!response.ok) {
      throw new Error("Não foi possível carregar as versões");
    }

    const versions = await response.json();

    for (const item of versions) {
      const option = document.createElement("option");

      option.value = item.version;

      const aliases = item.aliases || [];

      option.textContent = aliases.includes("latest")
        ? `${item.version} (latest)`
        : item.version;

      option.selected =
        item.version === currentVersion ||
        aliases.includes(currentVersion);

      selector.appendChild(option);
    }

    selector.addEventListener("change", () => {
      window.location.href =
        base + encodeURIComponent(selector.value) + "/";
    });

    header.prepend(selector);

  } catch (error) {
    console.error("Erro ao carregar versões:", error);
  }
});
