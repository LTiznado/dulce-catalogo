"""Validación básica y sin dependencias del sitio estático."""

from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / "index.html", ROOT / "catalogo.html"]
errors: list[str] = []


class SiteParser(HTMLParser):
    def __init__(self, page: Path):
        super().__init__()
        self.page = page
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        attributes = dict(attrs)
        element_id = attributes.get("id")
        if element_id:
            if element_id in self.ids:
                errors.append(f"{self.page.name}: id duplicado #{element_id}")
            self.ids.add(element_id)

        for attribute in ("src", "href"):
            value = attributes.get(attribute)
            if not value or value.startswith(("#", "http:", "https:", "mailto:", "tel:")):
                continue
            path = unquote(urlsplit(value).path)
            if path and not (ROOT / path).exists():
                errors.append(f"{self.page.name}: no existe {path}")


for page in PAGES:
    parser = SiteParser(page)
    parser.feed(page.read_text(encoding="utf-8"))

catalog_source = (ROOT / "data" / "catalog.js").read_text(encoding="utf-8")
for image_path in re.findall(r'(?:image|hoverImage):\s*"([^"]*)"', catalog_source):
    if image_path and not (ROOT / image_path).exists():
        errors.append(f"catalog.js: no existe {image_path}")

for source_file in [*PAGES, ROOT / "script.js", ROOT / "data" / "catalog.js"]:
    if re.search(r"Ã|Â|ï¿½", source_file.read_text(encoding="utf-8")):
        errors.append(f"{source_file.name}: posible texto mal codificado")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    sys.exit(1)

print("Sitio validado: enlaces locales, imágenes, IDs y codificación correctos.")
