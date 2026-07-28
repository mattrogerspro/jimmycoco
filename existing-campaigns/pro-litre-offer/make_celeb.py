#!/usr/bin/env python3
"""Derivatives for the two credibility sections.

The four Met Gala frames become a full-bleed red-carpet strip; the Vogue wordmark and a
portrait crop of Jimmy support the "meet the man" block. The supplied celeb_text.png /
vogue_text.png / jimmy_expertise.png are screenshots of copy and layout — that copy is
transcribed into live HTML in index.html rather than shipped as pixels, so it stays
readable with images blocked and reflows on mobile.
"""
from PIL import Image, ImageChops
import os
Image.MAX_IMAGE_PIXELS = None

SRC = "/mnt/user-data/uploads/jimmycoco/existing-campaigns/sourceassets"
ORIG = "/mnt/user-data/uploads/jimmycoco/existing-campaigns/pro-litre-original-assets"
OUT = "images"
CREAM = (242, 237, 235)
os.makedirs(OUT, exist_ok=True)


def cover(im, tw, th, bias=0.5):
    sw, sh = im.size
    s = max(tw / sw, th / sh)
    nw, nh = round(sw * s), round(sh * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    l, t = (nw - tw) // 2, round((nh - th) * bias)
    return im.crop((l, t, l + tw, t + th))


def save(im, name, q=84, fmt="JPEG"):
    ext = "jpg" if fmt == "JPEG" else "png"
    p = f"{OUT}/{name}.{ext}"
    if fmt == "JPEG":
        im.convert("RGB").save(p, "JPEG", quality=q, optimize=True,
                               progressive=True, subsampling=1)
    else:
        im.save(p, "PNG", optimize=True)
    print(f"  {name}.{ext}  {im.size[0]}x{im.size[1]}  {os.path.getsize(p)/1024:.0f} KB")


load = lambda d, n: Image.open(os.path.join(d, n)).convert("RGB")

# --- four-across red-carpet strip ---------------------------------------------
# 600px container / 4 = 150px each, exported at 2x. Top-biased so faces stay high
# in frame in this tall, narrow crop.
print("Red-carpet strip:")
for i, n in enumerate(["kardashian_0001", "kardashian_0002",
                       "kardashian_0003", "kardashian_0004"], start=1):
    save(cover(load(SRC, f"{n}.png"), 300, 420, bias=0.06), f"celeb-{i}")

# --- Vogue wordmark, multiplied onto the cream card ---------------------------
# The supplied mark is black on white; multiplying keeps the letterforms and lets the
# cream show through, so it needs no alpha channel.
print("\nVogue wordmark:")
v = load(SRC, "vogue_logo.png")
v = v.resize((360, round(360 * v.size[1] / v.size[0])), Image.LANCZOS)
save(ImageChops.multiply(v, Image.new("RGB", v.size, CREAM)), "vogue-wordmark", fmt="PNG")

# --- portrait of Jimmy for the "meet the man" block ---------------------------
# Framed on the upper body so it reads as a portrait, distinct from the full-length
# spraying shot used in the quote band.
print("\nPortrait:")
save(cover(load(ORIG, "JIMMY.png").crop((300, 60, 1023, 900)), 560, 620, bias=0.18),
     "jimmy-portrait")

print("\nDone.")
