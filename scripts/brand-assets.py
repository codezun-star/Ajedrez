#!/usr/bin/env python3
"""Derive every published brand asset from the master logo (public/logoage.png).

Run after replacing the master file:

    pip install pillow && python scripts/brand-assets.py

Outputs (all in public/):
    logo.png              trimmed lockup — knight, board and wordmark
    logo-dark.png         same lockup, legible on the dark surface
    favicon.png           the knight mark alone, square
    apple-touch-icon.png  the mark flattened onto the light theme colour
    og.png                1200x630 social card
"""

from PIL import Image, ImageDraw, ImageFont

MASTER = "public/logoage.png"
OUT = "public/"

SURFACE = (12, 15, 29)  # surface-950, the app background
BRAND = (231, 68, 69)  # brand-500
LIGHT = (232, 237, 247)
THEME_LIGHT = (238, 242, 249)  # <meta name="theme-color">

# Rows of the 500px master: the wordmark starts below the checkerboard.
WORDMARK_TOP = 344
MARK_BOTTOM = 336

master = Image.open(MASTER).convert("RGBA")
box = master.getchannel("A").getbbox()


def trimmed_lockup() -> Image.Image:
    return master.crop(box)


def dark_lockup(logo: Image.Image) -> Image.Image:
    """The wordmark's "bot" is near-black navy and would vanish on the dark
    surface; the knight is only a shade lighter. Recolour the letters and lift
    the mark's blacks, leaving the red "Ajedrez" untouched."""
    dark = logo.copy()
    px = dark.load()
    top = WORDMARK_TOP - box[1]
    for y in range(dark.height):
        for x in range(dark.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if y >= top:
                luma = 0.299 * r + 0.587 * g + 0.114 * b
                if luma < 110 and r < 120:
                    px[x, y] = (*LIGHT, a)
            else:
                px[x, y] = (int(26 + r * 0.9), int(26 + g * 0.9), int(30 + b * 0.9), a)
    return dark


def square_mark() -> Image.Image:
    """Just the knight and its board — the wordmark is a smear below ~32px."""
    mark = master.crop((box[0], box[1], box[2], MARK_BOTTOM))
    side = max(mark.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
    return square


def glow(size, cx, cy, radius, colour, strength):
    """A soft radial wash, matching the app's `.app-aura` background."""
    w, h = size
    small = (w // 10, h // 10)
    mask = Image.new("L", small)
    mpx = mask.load()
    for y in range(small[1]):
        for x in range(small[0]):
            dx = (x / small[0] - cx) * w
            dy = (y / small[1] - cy) * h
            d = (dx * dx + dy * dy) ** 0.5 / radius
            mpx[x, y] = int(max(0.0, 1 - d) ** 2 * 255 * strength)
    layer = Image.new("RGBA", size, (*colour, 0))
    layer.putalpha(mask.resize(size, Image.BICUBIC))
    return layer


def social_card(logo_dark: Image.Image) -> Image.Image:
    size = (1200, 630)
    card = Image.new("RGBA", size, (*SURFACE, 255))
    card.alpha_composite(glow(size, 0.12, -0.1, 780, BRAND, 0.55))
    card.alpha_composite(glow(size, 1.05, 0.15, 700, (240, 136, 136), 0.35))
    card.alpha_composite(glow(size, 0.5, 1.2, 640, (197, 25, 26), 0.3))

    height = 330
    scaled = logo_dark.resize(
        (round(logo_dark.width * height / logo_dark.height), height), Image.LANCZOS
    )
    card.alpha_composite(scaled, ((size[0] - scaled.width) // 2, 95))

    tagline = "Ajedrez online gratis con IA · 4 niveles · 10 idiomas"
    font = ImageFont.truetype(
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 40
    )
    draw = ImageDraw.Draw(card)
    tw = draw.textbbox((0, 0), tagline, font=font)[2]
    draw.text(((size[0] - tw) // 2, 480), tagline, font=font, fill=(203, 213, 225))
    return card.convert("RGB")


logo = trimmed_lockup()
logo.save(OUT + "logo.png")

dark = dark_lockup(logo)
dark.save(OUT + "logo-dark.png")

mark = square_mark()
mark.resize((256, 256), Image.LANCZOS).save(OUT + "favicon.png")

# iOS composites the icon over black, so bake in the light theme colour.
touch = Image.new("RGBA", (mark.width + 60, mark.height + 60), (*THEME_LIGHT, 255))
touch.paste(mark, (30, 30), mark)
touch.convert("RGB").resize((180, 180), Image.LANCZOS).save(OUT + "apple-touch-icon.png")

social_card(dark).save(OUT + "og.png", optimize=True)

for name in ("logo.png", "logo-dark.png", "favicon.png", "apple-touch-icon.png", "og.png"):
    print(name, Image.open(OUT + name).size)
