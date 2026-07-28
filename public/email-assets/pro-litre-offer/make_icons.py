#!/usr/bin/env python3
"""Recreate every icon in the Jimmy Coco professional-litre email as clean vectors,
then rasterise to PNG at 3x for crisp rendering in email clients."""
import os, cairosvg

TAN   = "#B08F62"   # benefit icons (circle + glyph)
BROWN = "#6B452D"   # formulation icons
CREAM = "#F6EAE1"   # benefit section background
GREY  = "#F3F3F3"   # formulation section background
CARD  = "#F3E7DF"   # offer card background
FOOT  = "#664834"   # footer brown
OUT = "images"
os.makedirs(OUT, exist_ok=True)


def svg(body, w=96, h=96, bg=None):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}">{rect}{body}</svg>')


def render(name, markup, px):
    cairosvg.svg2png(bytestring=markup.encode(), write_to=f"{OUT}/{name}.png",
                     output_width=px, output_height=px, background_color=None)
    print(f"  {name}.png  {px}px")


# ---------------------------------------------------------------- benefit icons
# Thin tan line glyph inside a thin tan circle, on the cream section background.
RING = f'<circle cx="48" cy="48" r="43" fill="none" stroke="{TAN}" stroke-width="1.7"/>'
G = (f'fill="none" stroke="{TAN}" stroke-width="2.1" '
     f'stroke-linecap="round" stroke-linejoin="round"')

benefit = {
    # single professional bottle
    "b1-bottle": f'''<path {G} d="M43 24h10v7h-10z"/>
        <path {G} d="M41.5 31h13a6 6 0 0 1 6 6v29a6 6 0 0 1-6 6h-13a6 6 0 0 1-6-6V37a6 6 0 0 1 6-6z"/>
        <path {G} d="M37 47h22"/>''',
    # star
    "b2-star": f'''<path {G} d="M48 26l6.6 13.4 14.8 2.1-10.7 10.4 2.5 14.7L48 59.7 34.8 66.6l2.5-14.7L26.6 41.5l14.8-2.1z"/>''',
    # group of people
    "b3-people": f'''<circle {G} cx="48" cy="40" r="7.5"/>
        <path {G} d="M35 66c0-7.2 5.8-12 13-12s13 4.8 13 12"/>
        <circle {G} cx="30" cy="45" r="5.5"/>
        <path {G} d="M20 66c0-5.6 4.3-9.5 10-9.5"/>
        <circle {G} cx="66" cy="45" r="5.5"/>
        <path {G} d="M76 66c0-5.6-4.3-9.5-10-9.5"/>''',
    # sparkles
    "b4-sparkle": f'''<path {G} d="M45 24c0 9.4-3.6 13-13 13 9.4 0 13 3.6 13 13 0-9.4 3.6-13 13-13-9.4 0-13-3.6-13-13z"/>
        <path {G} d="M64 42c0 5.4-2 7.5-7.5 7.5 5.4 0 7.5 2 7.5 7.5 0-5.4 2-7.5 7.5-7.5-5.4 0-7.5-2-7.5-7.5z"/>
        <path {G} d="M43 57c0 4.6-1.8 6.4-6.4 6.4 4.6 0 6.4 1.8 6.4 6.4 0-4.6 1.8-6.4 6.4-6.4-4.6 0-6.4-1.8-6.4-6.4z"/>''',
    # calendar
    "b5-calendar": f'''<rect {G} x="26" y="30" width="44" height="40" rx="4"/>
        <path {G} d="M26 42h44M37 24v10M59 24v10"/>
        <g fill="none" stroke="{TAN}" stroke-width="1.7">
          <rect x="34" y="49" width="6" height="5.5"/><rect x="45" y="49" width="6" height="5.5"/>
          <rect x="56" y="49" width="6" height="5.5"/><rect x="34" y="59" width="6" height="5.5"/>
          <rect x="45" y="59" width="6" height="5.5"/><rect x="56" y="59" width="6" height="5.5"/>
        </g>''',
    # clock
    "b6-clock": f'''<circle {G} cx="48" cy="48" r="23"/>
        <path {G} d="M48 33v15l10 6"/>''',
    # two bottles on a tray
    "b7-bottles": f'''<path {G} d="M37 30h7v6h-7z"/>
        <path {G} d="M35.5 36h10a5 5 0 0 1 5 5v20h-20V41a5 5 0 0 1 5-5z"/>
        <path {G} d="M53 34h6v5h-6z"/>
        <path {G} d="M52 39h8a4.5 4.5 0 0 1 4.5 4.5V61h-17V43.5A4.5 4.5 0 0 1 52 39z"/>
        <path {G} d="M26 61h44M30 61v5M66 61v5"/>''',
}

print("Benefit icons (32px display, 3x export):")
for n, g in benefit.items():
    render(n, svg(RING + g, bg=CREAM), 96)


# ----------------------------------------------------------- formulation icons
F = (f'fill="none" stroke="{BROWN}" stroke-width="4.6" '
     f'stroke-linecap="round" stroke-linejoin="round"')

formulation = {
    # botanical extracts — two leaves and a droplet
    "f1-botanical": f'''<path {F} d="M38 60A40 40 0 0 1 78 20 40 40 0 0 1 38 60Z"/>
        <path {F} d="M30 52A32 32 0 0 1 58 12 32 32 0 0 1 30 52Z"/>
        <path {F} d="M36 62 74 24"/>
        <path {F} d="M28 72c0-5.5 5.5-12 5.5-12s5.5 6.5 5.5 12a5.5 5.5 0 0 1-11 0z"/>''',
    # hydration complex — droplet flanked by rules
    "f2-hydration": f'''<path {F} d="M50 22s16 18 16 29a16 16 0 0 1-32 0c0-11 16-29 16-29z"/>
        <path {F} d="M8 44h22M70 44h22"/>''',
    # gold complex — shallow dish with suspended particles
    "f3-gold": f'''<path {F} d="M12 38h12c0 14 11 24 26 24s26-10 26-24h12"/>
        <g fill="{BROWN}">
          <circle cx="38" cy="34" r="2.4"/><circle cx="50" cy="30" r="2.4"/>
          <circle cx="62" cy="34" r="2.4"/><circle cx="44" cy="41" r="2.2"/>
          <circle cx="56" cy="41" r="2.2"/><circle cx="50" cy="47" r="2"/>
        </g>''',
    # fine fragrance — matches the source artwork's droplet mark
    "f4-fragrance": f'''<path {F} d="M50 22s16 18 16 29a16 16 0 0 1-32 0c0-11 16-29 16-29z"/>
        <path {F} d="M8 44h22M70 44h22"/>''',
}

print("Formulation icons (72px display, 3x export):")
for n, g in formulation.items():
    render(n, svg(g, w=100, h=100, bg=GREY), 216)


# ------------------------------------------------------------------- ui marks
print("UI marks:")
bag = svg(f'''<path fill="none" stroke="{TAN}" stroke-width="3" stroke-linecap="round"
    stroke-linejoin="round" d="M22 34h56l-5 44a6 6 0 0 1-6 5H33a6 6 0 0 1-6-5z"/>
    <path fill="none" stroke="{TAN}" stroke-width="3" stroke-linecap="round"
    d="M36 34V26a14 14 0 0 1 28 0v8"/>''', bg=CARD)
render("ui-bag", bag, 132)

env = svg(f'''<rect fill="none" stroke="{TAN}" stroke-width="3.4" stroke-linejoin="round"
    x="12" y="24" width="72" height="48" rx="4"/>
    <path fill="none" stroke="{TAN}" stroke-width="3.4" stroke-linecap="round"
    stroke-linejoin="round" d="M13 27l35 26 35-26"/>''', bg="#F2EDEB")
render("ui-envelope", env, 96)

tick = svg(f'''<path fill="none" stroke="{BROWN}" stroke-width="9" stroke-linecap="round"
    stroke-linejoin="round" d="M16 50l22 22 42-46"/>''', bg=CREAM)
render("ui-tick", tick, 60)


# ---------------------------------------------------------------- social icons
print("Social icons (24px display, 2x export, white on footer brown):")
W = "#FFFFFF"
social = {
    "social-facebook": f'''<path fill="{W}" d="M62 14H50c-9.9 0-18 8.1-18 18v12H20v16h12v34h16V60h13l3-16H48v-9c0-2.8 2.2-5 5-5h9z"/>''',
    "social-instagram": f'''<rect fill="none" stroke="{W}" stroke-width="8" x="14" y="14" width="68" height="68" rx="19"/>
        <circle fill="none" stroke="{W}" stroke-width="8" cx="48" cy="48" r="16"/>
        <circle fill="{W}" cx="68" cy="28" r="5.5"/>''',
    "social-linkedin": f'''<rect fill="{W}" x="14" y="38" width="14" height="44" rx="2"/>
        <circle fill="{W}" cx="21" cy="22" r="9"/>
        <path fill="{W}" d="M38 38h13v6a15 15 0 0 1 13-7c11 0 18 7 18 20v25H68V59c0-6-3-9-8-9s-9 3-9 10v22H38z"/>''',
}
for n, g in social.items():
    render(n, svg(g, bg=FOOT), 48)

print("\nDone.")
