#!/usr/bin/env python3
"""Flash sale derivatives, built from the clean raw assets in ../flashsale/.

Several raws are shot on pure white. Rather than dropping a white rectangle onto the
email's warm grey, the white is flood-filled from the corners and replaced with the page
tone, so those products sit on the background instead of in a box.
"""
from PIL import Image, ImageDraw, ImageChops
import numpy as np, os, cairosvg

SRC   = '/mnt/user-data/uploads/jimmycoco/existing-campaigns/flashsale'
OUT   = 'images'
PAGE  = (235, 231, 230)   # #EBE7E6 page background
BAND  = (226, 212, 200)   # #E2D4C8 footer band
BRONZE = '#BC7D5F'
os.makedirs(OUT, exist_ok=True)


def cover(im, tw, th, bias=0.5):
    sw, sh = im.size
    s = max(tw / sw, th / sh)
    nw, nh = round(sw * s), round(sh * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    return im.crop(((nw - tw) // 2, round((nh - th) * bias),
                    (nw - tw) // 2 + tw, round((nh - th) * bias) + th))


def save(im, name, q=84):
    p = f'{OUT}/{name}.jpg'
    im.convert('RGB').save(p, 'JPEG', quality=q, optimize=True,
                           progressive=True, subsampling=1)
    print(f'  {name}.jpg  {im.size[0]}x{im.size[1]}  {os.path.getsize(p)/1024:.0f} KB')


def dekey(im, bg, tol=26):
    """Flood-fill the white studio background from the corners and repaint it `bg`.
    Corner-seeded so white *inside* the product (labels, highlights) is untouched."""
    im = im.convert('RGB')
    w, h = im.size
    mask = Image.new('L', (w + 2, h + 2), 0)
    flood = im.copy()
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(flood, xy, (255, 0, 255), thresh=tol)
    a = np.array(flood)
    hit = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    out = np.array(im)
    out[hit] = bg
    return Image.fromarray(out)


def trim(im, thresh=244, pad=0):
    """Several raws are A4 pages with white margins. Crop to the actual artwork so the
    page white never leaks into the email's warm grey background."""
    a = np.array(im.convert('RGB')).astype(int)
    nz = a.min(axis=2) < thresh
    rows = np.where(nz.any(axis=1))[0]
    cols = np.where(nz.any(axis=0))[0]
    if not len(rows) or not len(cols):
        return im
    return im.crop((max(cols.min() + pad, 0), max(rows.min() + pad, 0),
                    min(cols.max() + 1 - pad, im.size[0]),
                    min(rows.max() + 1 - pad, im.size[1])))


CARD_EDGE = (173, 113, 87)   # #AD7157 outline sampled from the design


def card(im, radius_pct=0.066, stroke_pct=0.011, bg=None, edge=CARD_EDGE):
    """Round the corners and stroke an outline, baked into the pixels.

    Outlook's Word engine ignores border-radius, so doing this in CSS would give three
    square cards there and rounded ones everywhere else. Drawing it into the JPEG on the
    page background means every client renders the same card.
    Mask is built at 4x and downsampled so the arcs are smooth.
    """
    bg = bg or PAGE
    w, h = im.size
    r = max(2, round(min(w, h) * radius_pct))
    sw = max(1, round(w * stroke_pct))
    SS = 4

    mask = Image.new('L', (w * SS, h * SS), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w * SS - 1, h * SS - 1],
                                           radius=r * SS, fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)

    out = Image.new('RGB', (w, h), bg)
    out.paste(im, (0, 0), mask)

    line = Image.new('L', (w * SS, h * SS), 0)
    ImageDraw.Draw(line).rounded_rectangle(
        [sw * SS // 2, sw * SS // 2, w * SS - 1 - sw * SS // 2, h * SS - 1 - sw * SS // 2],
        radius=r * SS, outline=255, width=sw * SS)
    line = line.resize((w, h), Image.LANCZOS)
    out.paste(Image.new('RGB', (w, h), edge), (0, 0), line)
    return out


load = lambda n: Image.open(os.path.join(SRC, n)).convert('RGB')

# ---- hero: photograph + composited flash-sale lockup (see make_hero.mjs) -----
print('Hero:')
save(Image.open('hero-raw.png'), 'hero', q=86)

# ---- three bundle cards; the raws already carry the rounded bronze frame -----
print('\nBundle cards:')
for src, name in [('9.jpg', 'bundle-duo'), ('10.jpg', 'bundle-glow-kit'),
                  ('11.jpg', 'bundle-essentials')]:
    save(card(cover(trim(load(src), pad=10), 640, 800)), name)

# ---- full-bleed model band ---------------------------------------------------
print('\nBands:')
save(cover(trim(load('7.jpg')), 1200, 660, bias=0.42), 'model-band')

# ---- Kylie portrait ----------------------------------------------------------
save(cover(trim(load('8.jpg')), 760, 1000, bias=0.05), 'kylie')

# ---- glow edit pair and signature, lifted off their white studio ground ------
print('\nDe-keyed to the page tone:')
# keep the trimmed aspect so both bottles stay whole rather than being cropped
save(cover(dekey(trim(load('12.jpg')), PAGE), 660, 1094), 'glow-edit')
sig = dekey(trim(load('13.jpg')), PAGE)
save(cover(sig, 560, 200, bias=0.5), 'signature')

# ---- brand mark on the footer band ------------------------------------------
logo = load('fullcampaign/image.png')
logo = logo.resize((480, round(480 * logo.size[1] / logo.size[0])), Image.LANCZOS)
logo = ImageChops.multiply(logo, Image.new('RGB', logo.size, BAND))
logo.save(f'{OUT}/logo.png', 'PNG', optimize=True)
print(f'  logo.png  {logo.size[0]}x{logo.size[1]}  '
      f'{os.path.getsize(f"{OUT}/logo.png")/1024:.0f} KB')

# ---- scalloped divider that tops the footer band -----------------------------
# One period is 60px wide at 1200px; 20 repeats span the canvas.
W, Hh, amp, per = 1200, 90, 22, 60
d = f'M0,{amp} '
for i in range(W // per):
    x = i * per
    d += (f'C{x+per*0.25},{amp*2} {x+per*0.75},0 {x+per},{amp} ')
d += f'L{W},{Hh} L0,{Hh} Z'
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Hh}" '
       f'viewBox="0 0 {W} {Hh}"><rect width="{W}" height="{Hh}" fill="#EBE7E6"/>'
       f'<path d="{d}" fill="#E2D4C8"/></svg>')
cairosvg.svg2png(bytestring=svg.encode(), write_to=f'{OUT}/scallop.png',
                 output_width=W, output_height=Hh)
print(f'\n  scallop.png  {W}x{Hh}  {os.path.getsize(f"{OUT}/scallop.png")/1024:.0f} KB')

# ---- "Let's Connect" marks: white glyph in a bronze disc on the band ---------
G = 'fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'
marks = {
    'connect-email': f'<path {G} d="M64 69a23 23 0 1 1 10-19v5a7 7 0 0 1-14 0"/>'
                     f'<circle cx="50" cy="50" r="11" {G}/>',
    'connect-mail':  f'<rect x="28" y="35" width="44" height="31" rx="3" {G}/>'
                     f'<path {G} d="M29 37l21 16 21-16"/>',
    'connect-web':   f'<circle cx="50" cy="50" r="22" {G}/>'
                     f'<path {G} d="M28 50h44M50 28c9 7 9 37 0 44-9-7-9-37 0-44z"/>',
}
print('\nConnect marks:')
for n, g in marks.items():
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
         f'width="100" height="100"><rect width="100" height="100" fill="#E2D4C8"/>'
         f'<circle cx="50" cy="50" r="42" fill="{BRONZE}"/>{g}</svg>')
    cairosvg.svg2png(bytestring=s.encode(), write_to=f'{OUT}/{n}.png',
                     output_width=132, output_height=132)
    print(f'  {n}.png  132px  {os.path.getsize(f"{OUT}/{n}.png")/1024:.0f} KB')

print(f'\nTotal: {sum(os.path.getsize(f"{OUT}/{f}") for f in os.listdir(OUT))/1024/1024:.2f} MB')
