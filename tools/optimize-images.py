"""Genera copias WebP ligeras de las imágenes usadas por el sitio."""

from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "products"
OUTPUT.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "salted-caramel.png": "salted-caramel.webp",
    "pie-de-limon.png": "pie-de-limon.webp",
    "creme-brulee.png": "creme-brulee.webp",
    "pecan-pisco.png": "pecan-pisco.webp",
    "coffee.png": "coffee.webp",
    "marmoleado.png": "marmoleado.webp",
    "brownie-papa-raw.png": "brownie-especial.webp",
    "mascota-ratones.png": "mascota-ratones.webp",
    "assets/imagenes/IMG_5480.PNG": "salted-caramel-interior.webp",
    "assets/imagenes/IMG_5484.PNG": "pie-de-limon-interior.webp",
    "assets/imagenes/IMG_5482.PNG": "pecan-pisco-interior.webp",
    "assets/imagenes/IMG_5479.PNG": "coffee-interior.webp",
    "assets/instagram/red-velvet.jpg": "red-velvet.webp",
    "assets/instagram/red-velvet-close.jpg": "red-velvet-interior.webp",
    "assets/instagram/avellana-chips.jpg": "avellana-chips.webp",
    "assets/instagram/avellana-chips-close.jpg": "avellana-chips-interior.webp",
}

for source_name, target_name in SOURCES.items():
    source = ROOT / source_name
    target = OUTPUT / target_name
    with Image.open(source) as image:
        image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=86, method=4)
    print(f"{source_name} -> {target.relative_to(ROOT)}")
