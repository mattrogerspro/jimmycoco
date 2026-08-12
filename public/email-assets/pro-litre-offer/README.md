# Pro Litre Offer — rebuilt HTML email

Built from the original photography in `../pro-litre-original-assets/` and the copy in
`email-copy.txt`. Every word is live HTML text; every icon is a fresh vector, not a screenshot crop.

## Files

| File | Use |
|---|---|
| `index.html` | Local preview — relative `images/` paths |
| `email.html` | Send-ready — absolute `https://jimmycoco.email/email-assets/pro-litre-offer/images/…` paths |
| `email.txt` | Plain-text multipart alternative |
| `images/` | 9 photographic derivatives + 17 recreated icons — **708 KB total** |

**Subject:** Limited Time: Buy 2 Pro Litres, Get 4 complimentary Soufflés
**Preview text:** Discover the professional solution designed to create beautifully bespoke results for every client.

## Hosting

Copy this whole folder (keeping the `images/` subfolder) to
`public/email-assets/pro-litre-offer/` and deploy. `email.html` expects:

```
https://jimmycoco.email/email-assets/pro-litre-offer/images/<file>
```

⚠️ `vercel.json` rewrites every unmatched path to `/index.html`, so a wrong asset path
does not 404 — it silently returns the Studio SPA and the image just fails to render.
When an image looks broken, open its URL directly: if you get the Studio page, the path is
wrong or the file was never deployed.

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
| Benefits background | original campaign photograph | `benefits-bg.jpg` 1200×952 | 600×476 full-bleed |
| Benefits (mobile) | same photograph | `benefits-product.jpg` 760×1164 | stacked, full width |
| Lifestyle break | `IMG_4625.jpg` | `lifestyle.jpg` 1200×1000 | 600×500 |
| Shade swatch | `d542e009 (1).jpg` | `leg-swatch.jpg` 400×700 | 170×298 |
| Jimmy spraying | `JIMMY.png` | `jimmy-spraying.jpg` 400×700 | 170×298 |
| Offer products | crop of the shelf shot | `offer-products.jpg` 560×390 | 244×170 |

The lifestyle crop is deliberately top-biased so the model's face stays in frame.

### Credibility sections

Two sections sit between the therapist quote and the redemption block, built from
`../sourceassets/` via `make_celeb.py`:

**As featured in Vogue** — the four Met Gala frames as a full-bleed four-across strip
(`celeb-1..4.jpg`, 300×420 each, top-biased so faces stay high in a tall narrow crop),
then the Vogue wordmark and the article excerpt.

**Meet the man behind Hollywood's glow** — a portrait crop of Jimmy as a full-bleed
background, with the positioning copy and four credentials beside it. The portrait is framed
on the upper body so it reads differently from the full-length spraying shot in the quote band.

Two notes on how the supplied assets were used:

- `celeb_text.png`, `vogue_text.png` and `jimmy_expertise.png` are screenshots of copy and
  layout. That copy is **transcribed into live HTML**, not shipped as pixels, so it stays
  readable with images blocked and reflows on mobile. Nothing was added to it.
- The Vogue excerpt is attributed on screen, and the byline keeps the surname as printed
  ("James Harknett") since it appears that way in the article — worth a look if you'd rather
  it read "Jimmy Coco" throughout.

The strip's columns are `width="25%"`, not `150px`. With `table-layout:fixed` a pixel width
holds four columns at 600px total and stops the whole email shrinking below that on mobile.

### Full-bleed photographic sections

Three sections use the photograph as a genuine CSS background rather than an inline image:
the demand story, the "one solution" editorial and the benefits checklist. In each case the
image cell carries `background-size:cover`, the `background` attribute and a VML
`<v:rect>/<v:fill type="frame">` fallback for Outlook's Word engine.

This matters because a table cell stretches to the height of its row, so a background always
fills the full column — top, bottom and outer edge — no matter how the copy beside it reflows
or which font the client substitutes. An inline `<img>` is locked to its own dimensions, which
is what left 14px of cream under the bag shot and 69px under the editorial portrait.

Two supporting details make it hold up:

- The image cells are empty on desktop, so the tables set `table-layout:fixed` — otherwise the
  text column wins the width negotiation and squeezes the photo (260px was collapsing to 230px).
- Cell padding never sits on a `.stack` cell. Padding plus `width:100%` overflows the viewport,
  so every padded text column is a nested single-cell table instead.

Under 620px all three backgrounds switch off and the same image is shown inline above the copy,
because at that width text would land on top of the photograph.

### The benefits background

The original design runs a single photograph across the whole section — palm shadow, vase,
bottle on the plinth — with the checklist sitting over the out-of-focus wall to the right.
That plinth shot isn't in `pro-litre-original-assets/`, so `make_benefits_bg.py` recovers it
from the Klaviyo capture: columns 0–470 of the section are clean photography, and from
column ~455 rightward the frame is plain wall. It keeps the photographic region verbatim and
extends that flat wall across the remaining width with a smoothstep blend, so the checklist
has somewhere to sit. No product content is invented, duplicated or retouched — only a flat
background colour is carried further right.

It is applied as a real CSS background (`background-size:cover`) plus the `background`
attribute, with a VML `<v:rect>/<v:fill type="frame">` fallback so Outlook's Word engine
renders it too. Because it's a background rather than an inline image, the photograph fills
the section whatever height the checklist ends up being — it can't be cut off.

Under 620px the background is switched off and the same photograph is stacked above the list
instead, since at that width the text would sit on top of the bottle.

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

Rendered height: 6,031px desktop / 8,645px at 375px.

### Mobile

Every photograph fills its share of the width — nothing sits marooned at its desktop size.
Three mechanisms do this, and it is worth knowing which is which before editing:

- `.fluid` releases an image's `max-width` cap under 620px, so it grows to fill the column.
  Without it an inline `max-width:150px` pins the image at 150px even inside a 50% cell.
- `.half` turns a four-across strip into two-up (`display:inline-block; width:50%`), so the
  red-carpet frames render at ~188px instead of ~94px.
- `.hide-mob` / `.mob-photo` swap layouts. The quote band is three columns on desktop with the
  quote between the two photographs; on mobile the photographs move to a 2-up strip above the
  quote. Both reference the same files, so there is no extra download.

Logos are deliberately *not* fluid: the wordmark stays 240px and the Vogue mark 180px.

Verified for overflow at 320, 375, 414, 480, 600 and 700px — 0px at every width. Two traps
that caused real breakage here and will again:

- **Padding on a `.stack` cell overflows.** `width:100%` plus 48px of padding pushed a 375px
  viewport to 423px. Padded text columns are nested single-cell tables for this reason.
- **Pixel widths under `table-layout:fixed` set a floor.** Four `width="150"` columns held the
  strip at 600px and stopped the *whole email* shrinking below that. Use percentages.

## Links

Every clickable element points at
`https://jimmycoco.co.uk/pages/why-choose-pro-professional` — the brand header, all three CTA
buttons, and all fourteen photographic images (hero, bag, editorial portrait, benefits photo,
lifestyle, swatch, Jimmy, the four red-carpet frames, the offer product shot).

Two deliberate exceptions:

- **`PROSALES@JIMMYCOCO.CO.UK`** stays a `mailto:` link, because the sentence above it reads
  "To redeem this exclusive offer, simply email:". A link that doesn't do what its own copy
  says would be a support problem.
- **Decorative icons are not linked** — the benefit marks, ticks, formulation icons, envelope
  and bag. They carry `alt=""` and linking them adds tap targets with no destination value.
  The Vogue wordmark is also unlinked, since sending it to a product page would misrepresent it.

Social, all three confirmed by the client:

- Facebook — `https://www.facebook.com/jimmycocointernational/`
- Instagram — `https://www.instagram.com/jimmyjimmycoco/`
- LinkedIn — `https://www.linkedin.com/company/jimmy-coco/`

## Before sending

1. **`{{unsubscribe_url}}`** — replace with your ESP's tag (Klaviyo `{% unsubscribe %}`,
   Resend `{{unsubscribe_link}}`, MailerLite `{$unsubscribe}`).
2. **`PROSALES@JIMMYCOCO.CO.UK`** is the correct address, confirmed by the client on
   28 July 2026. The supplied artwork and `email-copy.txt` both read `JIMMYCO.CO.UK`
   (one "CO") — that was a typo in the source, now corrected everywhere in the repo.
3. **Policy and social URLs** are assumed Shopify paths on `jimmycoco.co.uk` — verify.
4. **Copyright** updated from the artwork's 2024 to 2026.
5. **"For a limited time only"** still has no dates. Add real ones or drop the urgency line.
6. **RRP £22.00** and the 2-for-4 mechanic need confirming against current trade terms.
7. In the source artwork the **Hydration Complex™ and Fine Fragrance icons are identical**.
   I reproduced that faithfully — say the word and I'll draw Fine Fragrance its own mark.
