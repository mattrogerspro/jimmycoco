#!/usr/bin/env python3
"""Build the full-width benefits background from the original campaign photograph.

The Klaviyo capture holds the untouched plinth/vase/bottle photograph in columns 0-470;
from column ~455 rightward it is plain, out-of-focus wall. We keep the photographic region
verbatim and extend that flat wall across the rest of the canvas, so the checklist has
somewhere to sit without any product content being invented or duplicated.
"""
from PIL import Image
import numpy as np, os
Image.MAX_IMAGE_PIXELS = None

CANVAS = "../work/canvas.png"
SEC = (0, 5272, 1500, 6309)     # benefits section inside the capture
PHOTO_W = 470                    # last clean column before the baked-in checklist
OUT = "images"
os.makedirs(OUT, exist_ok=True)

# Section renders 600 x 476 -> export at 2x
DISP_W, DISP_H = 600, 476
W, H = DISP_W * 2, DISP_H * 2

sec = Image.open(CANVAS).convert("RGB").crop(SEC)

# --- the photograph, scaled so its own proportions are preserved ---------------
# Fit the section's height, then take the left PHOTO_W-equivalent slice.
scale = H / sec.size[1]
photo_w = round(PHOTO_W * scale)
photo = sec.crop((0, 0, PHOTO_W, sec.size[1])).resize((photo_w, H), Image.LANCZOS)

bg = Image.new("RGB", (W, H))
bg.paste(photo, (0, 0))

# --- extend the flat wall rightward ------------------------------------------
a = np.array(bg).astype(float)
edge = a[:, photo_w - 3].copy()                    # per-row tone at the photo's edge
flat = np.array([247.0, 240.0, 232.0])             # measured wall tone
FEATHER = 260                                       # px to settle from edge tone to flat

for i, x in enumerate(range(photo_w, W)):
    t = min(1.0, i / FEATHER)
    t = t * t * (3 - 2 * t)                        # smoothstep, no visible seam
    a[:, x] = edge * (1 - t) + flat * t

bg = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
bg.save(f"{OUT}/benefits-bg.jpg", "JPEG", quality=86, optimize=True,
        progressive=True, subsampling=1)
print(f"  benefits-bg.jpg  {W}x{H}  ({DISP_W}x{DISP_H} display)  "
      f"{os.path.getsize(f'{OUT}/benefits-bg.jpg')/1024:.0f} KB")

# --- stacked product image for mobile, from the same photograph ---------------
# Stay inside PHOTO_W so none of the baked-in checklist icons creep in, and trim
# vertically so the image is not absurdly tall at 375px.
mob = sec.crop((0, 180, PHOTO_W, 900))
mob = mob.resize((760, round(760 * mob.size[1] / mob.size[0])), Image.LANCZOS)
mob.save(f"{OUT}/benefits-product.jpg", "JPEG", quality=84, optimize=True,
         progressive=True, subsampling=1)
print(f"  benefits-product.jpg  {mob.size[0]}x{mob.size[1]}  "
      f"{os.path.getsize(f'{OUT}/benefits-product.jpg')/1024:.0f} KB")
