# Pro Litre Offer — rebuilt HTML email

Built from the original photography in `../pro-litre-original-assets/` and the copy in
`email-copy.txt`. Every word is live HTML text; every icon is a fresh vector, not a screenshot crop.

## Files

| File | Use |
|---|---|
| `index.html` | Local preview — relative `images/` paths |
| `email.html` | Send-ready — absolute `https://jimmycoco.email/email-assets/pro-litre-offer/…` paths |
| `email.txt` | Plain-text multipart alternative |
| `images/` | 9 photographic derivatives + 17 recreated icons — **708 KB total** |

**Subject:** Limited Time: Buy 2 Pro Litres, Get 4 Complimentary Soufflés
**Preview text:** Discover the professional solution designed to create beautifully bespoke results for every client.

## What changed from the sliced version

The first build cut the Klaviyo screenshot into ten flat images. This one is a real email:
all copy is selectable, translatable, screen-reader-readable text that reflows on any width,
and the payload dropped from ~1.0 MB to 708 KB despite the photography being higher quality.

## Photography

Each original was cropped to the aspect the layout needs and exported at 2× its display
size, JPEG q84 progressive.

| Slot | Source | Export | Display |
|---|---|---|---|
| Brand mark | `logo.webp` | `logo.png` 480×140, flattened onto cream | 240×70 |
| Hero shelf | `SALON NEWSLETTER JULY.png` | `hero-shelf.jpg` 1200×800 | 600×400 |
| Bag & Soufflés | `9c52330a.png` | `bag-souffles.jpg` 560×760 | 280×380 |
| Editorial portrait | `IMG_4624.jpg` | `model-editorial.jpg` 560×1000 | 246×439 |
| Single litre | crop of the shelf shot | `litre-bottle.jpg` 400×640 | 180×262 |
| Lifestyle break | `IMG_4625.jpg` | `lifestyle.jpg` 1200×1000 | 600×500 |
| Shade swatch | `d542e009 (1).jpg` | `leg-swatch.jpg` 400×700 | 170×298 |
| Jimmy spraying | `JIMMY.png` | `jimmy-spraying.jpg` 400×700 | 170×298 |
| Offer products | crop of the shelf shot | `offer-products.jpg` 560×390 | 244×170 |

The lifestyle crop is deliberately top-biased so the model's face stays in frame.

## Recreated graphics

Drawn from scratch as SVG in `make_icons.py`, rasterised through cairosvg at 2–3× and
flattened onto their section background so they need no alpha channel:

- **7 benefit marks** — bottle, star, group, sparkle, calendar, clock, bottle pair; tan `#B08F62`
  line glyph inside a hairline circle, 32px display
- **4 formulation marks** — botanical extracts, Hydration Complex™, Gold Complex™, Fine Fragrance;
  brown `#6B452D`, 72px display
- **3 UI marks** — shopping bag, envelope, tick
- **3 social marks** — Facebook, Instagram, LinkedIn, white on the footer brown

Rerun `python3 make_icons.py` or `python3 make_photos.py` to regenerate either set.

## Palette sampled from the original artwork

`#F2EDEB` cream · `#F6EAE1` benefits · `#F3E7DF` offer card · `#F3F3F3` formulation ·
`#664834` footer · `#8C5B3F` bronze · `#171310` ink · `#3B3630` body · `#C8A882` hairline

## Type

`Playfair Display` (Google Fonts) for the Didone display face, falling back to Georgia in
Outlook and anywhere webfonts are blocked. Arial/Helvetica throughout the body.

## Email-client engineering

- 600px table layout with an MSO ghost-table wrapper; Outlook is forced to Georgia/Arial
  and `mso-line-height-rule:exactly`.
- Two- and three-column rows collapse to full width under 620px via `.stack`. Column images
  cap at their desktop width and centre rather than upscaling, so nothing goes soft on mobile.
- Padding is never applied to a `.stack` cell directly — it lives on a nested table, which is
  what stops the 375px viewport overflowing.
- Bulletproof buttons: padded `<a>` inside a `bgcolor` cell, so they survive Outlook and render
  as full-width taps on mobile.
- Hidden preheader plus zero-width padding characters.
- `color-scheme: light only` with `prefers-color-scheme` and `[data-ogsc]` overrides so
  Outlook.com and Apple Mail can't invert the cream and brown.
- `format-detection` off so iOS stops auto-linking the address and the offer terms.
- Decorative icons carry empty `alt=""`; photography carries descriptive alt text.

Rendered height: 4,777px desktop / 6,148px at 375px.

## Before sending

1. **`{{unsubscribe_url}}`** — replace with your ESP's tag (Klaviyo `{% unsubscribe %}`,
   Resend `{{unsubscribe_link}}`, MailerLite `{$unsubscribe}`).
2. **`prosales@jimmyco.co.uk`** — one "CO", as written in the source artwork and copy deck.
   All three CTAs `mailto:` it. Confirm it's monitored.
3. **Policy and social URLs** are assumed Shopify paths on `jimmycoco.co.uk` — verify.
4. **Copyright** updated from the artwork's 2024 to 2026.
5. **"For a limited time only"** still has no dates. Add real ones or drop the urgency line.
6. **RRP £22.00** and the 2-for-4 mechanic need confirming against current trade terms.
7. In the source artwork the **Hydration Complex™ and Fine Fragrance icons are identical**.
   I reproduced that faithfully — say the word and I'll draw Fine Fragrance its own mark.
