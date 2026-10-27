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
  selector.className = "version-select";
  selector.setAttribute(
    "aria-label",
    document.documentElement.lang === "pt-BR"
      ? "Versão da documentação"
      : "Documentation version"
  );

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
