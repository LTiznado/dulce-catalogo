"""Importa originales descargados de Drive y genera WebP uniformes para el catálogo."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "products"
CANVAS_SIZE = 1200
CONTENT_SIZE = 1100

SOURCE_TO_TARGET = {
    "Red velvet .PNG": "red-velvet.webp",
    "1_2 red velvet .PNG": "red-velvet-interior.webp",
    "Salted caramel 2.PNG": "salted-caramel.webp",
    "1_2 salted caramel.PNG": "salted-caramel-interior.webp",
    "Pie de limón .PNG": "pie-de-limon.webp",
    "1_2 pie de limón.png": "pie-de-limon-interior.webp",
    "Coffee.PNG": "coffee.webp",
    "1_2 coffee.PNG": "coffee-interior.webp",
    "Crème brûlée .PNG": "creme-brulee.webp",
    "1_2 crème brûlée .PNG": "creme-brulee-interior.webp",
    "Marmoleada 2.PNG": "marmoleado.webp",
    "1_2 Marmoleada .PNG": "marmoleado-interior.webp",
}


def normalized_product_image(source: Path) -> Image.Image:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGBA")

    alpha_box = image.getchannel("A").getbbox()
    if alpha_box:
        image = image.crop(alpha_box)

    image.thumbnail((CONTENT_SIZE, CONTENT_SIZE), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    position = ((CANVAS_SIZE - image.width) // 2, (CANVAS_SIZE - image.height) // 2)
    canvas.alpha_composite(image, position)
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Carpeta que contiene los PNG descargados de Drive")
    args = parser.parse_args()

    OUTPUT.mkdir(parents=True, exist_ok=True)
    missing: list[str] = []

    for source_name, target_name in SOURCE_TO_TARGET.items():
        source = args.source / source_name
        if not source.exists():
            missing.append(source_name)
            continue

        target = OUTPUT / target_name
        normalized_product_image(source).save(target, "WEBP", quality=88, method=6)
        print(f"{source.name} -> {target.relative_to(ROOT)}")

    if missing:
        raise SystemExit("Faltan originales: " + ", ".join(missing))


if __name__ == "__main__":
    main()
