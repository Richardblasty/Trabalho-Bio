from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / ".versioned-docs"

if DEST.exists():
    shutil.rmtree(DEST)

DEST.mkdir(parents=True)

# Copiar os arquivos originais
for filename in (
    "index.html",
    "style.css",
    "script.js",
    "version-selector.js",
):
    source = ROOT / filename

    if not source.exists():
        raise FileNotFoundError(f"Arquivo ausente: {source}")

    shutil.copy2(source, DEST / filename)

# Copiar outros recursos estáticos, se existirem
for dirname in ("images", "img", "assets", "fonts"):
    source = ROOT / dirname

    if source.is_dir():
        shutil.copytree(source, DEST / dirname)
image_source = ROOT / "proteina-ligante.png"
image_dest = DEST / "images" / "proteina-ligante.png"

if not image_source.is_file():
    raise FileNotFoundError(f"Imagem não encontrada: {image_source}")

image_dest.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(image_source, image_dest)


# Corrigir caminhos somente na cópia do HTML
html_path = DEST / "index.html"
html = html_path.read_text(encoding="utf-8")

html = html.replace(
    'href="css/style.css"',
    'href="style.css"'
)

html = html.replace(
    'src="js/script.js"',
    'src="script.js"'
)

# Incluir seletor de versões sem modificar o original
html = html.replace(
    "</body>",
    '<script src="version-selector.js"></script>\n</body>'
)

html_path.write_text(html, encoding="utf-8")

print("Site preparado para versionamento.")
