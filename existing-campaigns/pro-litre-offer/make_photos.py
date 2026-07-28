#!/usr/bin/env python3
"""Build email-optimised derivatives from the original Jimmy Coco assets.
Every export is 2x its display size for retina, JPEG q84 progressive."""
from PIL import Image
import os
Image.MAX_IMAGE_PIXELS = None

SRC = "/mnt/user-data/uploads/jimmycoco/existing-campaigns/pro-litre-original-assets"
OUT = "images"
CREAM = (242, 237, 235)
os.makedirs(OUT, exist_ok=True)


def load(name):
    return Image.open(os.path.join(SRC, name))


def cover(im, tw, th, bias=0.5):
    """Resize to exactly tw x th, cropping the overflow.
    bias sets the vertical anchor: 0 keeps the top, 0.5 centres, 1 keeps the base."""
    sw, sh = im.size
    s = max(tw / sw, th / sh)
    nw, nh = round(sw * s), round(sh * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    l = (nw - tw) // 2
    t = round((nh - th) * bias)
    return im.crop((l, t, l + tw, t + th))


def save(im, name, q=84):
    p = f"{OUT}/{name}.jpg"
    im.convert("RGB").save(p, "JPEG", quality=q, optimize=True,
                           progressive=True, subsampling=1)
    print(f"  {name}.jpg  {im.size[0]}x{im.size[1]}  {os.path.getsize(p)/1024:.0f} KB")


# ---- logo: flatten the transparent brand mark onto the cream card ------------
logo = load("logo.webp").convert("RGBA")
canvas = Image.new("RGBA", logo.size, CREAM + (255,))
canvas.alpha_composite(logo)
canvas.convert("RGB").resize((480, 140), Image.LANCZOS).save(
    f"{OUT}/logo.png", "PNG", optimize=True)
print(f"  logo.png  480x140  {os.path.getsize(f'{OUT}/logo.png')/1024:.0f} KB")

hero = load("SALON NEWSLETTER JULY.png").convert("RGB")   # 1536 x 1024

# ---- full-width hero: the professional and retail range on the salon shelf ---
save(cover(hero, 1200, 800), "hero-shelf")

# ---- single litre detail, cropped from the same shelf photograph -------------
save(cover(hero.crop((330, 210, 650, 890)), 400, 640), "litre-bottle")

# ---- product family for the redemption block --------------------------------
save(cover(hero.crop((140, 180, 1260, 960)), 560, 390), "offer-products")

# ---- Jimmy Coco bag and soufflés (two-column offer story) --------------------
save(cover(load("9c52330a.png").convert("RGB"), 560, 760), "bag-souffles")

# ---- editorial portrait beside the "one solution" copy ----------------------
save(cover(load("IMG_4624.jpg").convert("RGB"), 560, 1000), "model-editorial")

# ---- full-width lifestyle break: top-biased so the face stays in frame -------
save(cover(load("IMG_4625.jpg").convert("RGB"), 1200, 1000, bias=0.06), "lifestyle")

# ---- quote band: swatch left, Jimmy right -----------------------------------
save(cover(load("d542e009 (1).jpg").convert("RGB"), 400, 700), "leg-swatch")
save(cover(load("JIMMY.png").convert("RGB"), 400, 700), "jimmy-spraying")

print("\nTotal:",
      f"{sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT))/1024/1024:.2f} MB")
