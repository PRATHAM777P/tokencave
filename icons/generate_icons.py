"""
Generate TokenCave icons at all required sizes.
Requires: pip install Pillow

Usage: python icons/generate_icons.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 32, 48, 96, 128, 256]
OUT_DIR = os.path.dirname(os.path.abspath(__file__))


def make_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dark cave background circle
    margin = max(1, size // 16)
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(30, 27, 24, 255))

    # Orange accent ring
    ring_w = max(1, size // 12)
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        outline=(217, 119, 6, 220),
        width=ring_w,
    )

    # Rock emoji text (scales with size)
    emoji = "🪨"
    font_size = max(6, int(size * 0.55))
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", font_size)
    except Exception:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), emoji, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), emoji, font=font, embedded_color=True)

    return img


for s in SIZES:
    icon = make_icon(s)
    path = os.path.join(OUT_DIR, f"icon{s}.png")
    icon.save(path)
    print(f"Saved {path}")

print("Done! All icons generated.")
